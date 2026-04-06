"""
PhysioAI - Smart Recovery Assistant
Main Flask Application
"""

from flask import Flask, request, jsonify
import sqlite3
import json
import os
from datetime import datetime, date
from plan_generator import generate_plan, adapt_plan
from chatbot import get_chat_response
from gamification import calculate_xp, get_level, check_badges

app = Flask(__name__)

# Manual CORS – allows frontend to talk to backend
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    return jsonify({}), 200

DB_PATH = os.path.join(os.path.dirname(__file__), "physioai.db")


# ─── Database Helpers ───────────────────────────────────────────────────────

def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dicts
    return conn


def init_db():
    """Initialize the database with schema."""
    conn = get_db()
    with open(os.path.join(os.path.dirname(__file__), "schema.sql")) as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("[DATABASE] Initialized")


# ─── Auth Routes ─────────────────────────────────────────────────────────────

@app.route("/api/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)  # In prod: hash the password!
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        return jsonify({"message": "Registered successfully", "user_id": user["id"], "name": user["name"]}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    finally:
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    """Login an existing user."""
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?", (email, password)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user["id"],
        "name": user["name"]
    })


# ─── Patient Profile ──────────────────────────────────────────────────────────

def compute_injury_grade(conn, patient_id, injury_type):
    """Compute the current grade (1/2/3/4) for an injury type.
    Grade = number of prior COMPLETED (pain=0) cycles + 1.
    - Grade 1 = first attempt (0 prior recoveries)
    - Grade 2 = second attempt (1 prior recovery)
    - Grade 3 = third attempt (2 prior recoveries)
    - Grade 4 = means the 3rd cycle is now completed — locked state
    """
    rows = conn.execute(
        "SELECT pain_level FROM feedback_logs WHERE patient_id=? AND injury_type=? ORDER BY log_date ASC",
        (patient_id, injury_type)
    ).fetchall()
    recoveries = sum(1 for r in rows if r["pain_level"] == 0)
    grade = min(recoveries + 1, 4)  # 4 = "3rd cycle completed, locked"
    return grade


def compute_all_injury_grades(conn, patient_id):
    """Return a dict of {injury_type: grade} for all injuries in logs."""
    rows = conn.execute(
        "SELECT DISTINCT injury_type FROM feedback_logs WHERE patient_id=? AND injury_type IS NOT NULL",
        (patient_id,)
    ).fetchall()
    return {r["injury_type"]: compute_injury_grade(conn, patient_id, r["injury_type"]) for r in rows}


@app.route("/api/profile", methods=["POST"])
def create_profile():
    """Create or update a patient profile and generate initial plan."""
    data = request.json
    user_id = data.get("user_id")
    age = data.get("age")
    injury_type = data.get("injury_type")
    pain_level = data.get("pain_level")
    activity_level = data.get("activity_level")
    restart_injury = data.get("restart_injury", False)  # True when user explicitly restarts a recovered injury

    if None in [user_id, age, injury_type, pain_level, activity_level] or not all([user_id, age, injury_type, activity_level]):
        return jsonify({"error": "All fields required"}), 400

    conn = get_db()
    try:
        # Upsert patient profile
        existing = conn.execute("SELECT id FROM patients WHERE user_id=?", (user_id,)).fetchone()
        if existing:
            conn.execute(
                """UPDATE patients SET age=?, injury_type=?, pain_level=?, activity_level=?, updated_at=CURRENT_TIMESTAMP
                   WHERE user_id=?""",
                (age, injury_type, pain_level, activity_level, user_id)
            )
            patient_id = existing["id"]
        else:
            cur = conn.execute(
                "INSERT INTO patients (user_id, age, injury_type, pain_level, activity_level) VALUES (?,?,?,?,?)",
                (user_id, age, injury_type, pain_level, activity_level)
            )
            patient_id = cur.lastrowid

        # If restarting a recovered injury, insert a reset log so it's no longer "recovered"
        if restart_injury:
            last_log = conn.execute(
                "SELECT pain_level FROM feedback_logs WHERE patient_id=? AND injury_type=? ORDER BY log_date DESC, id DESC LIMIT 1",
                (patient_id, injury_type)
            ).fetchone()
            if last_log and last_log["pain_level"] == 0:
                # Add a non-zero entry dated today to reset recovery flag
                conn.execute(
                    "INSERT INTO feedback_logs (patient_id, log_date, pain_level, completion_pct, difficulty, injury_type, exercises_done) VALUES (?,?,5,0,'easy',?,?)",
                    (patient_id, str(date.today()), injury_type, '[]')
                )

        # Determine grade for this injury (how many times it's been recovered)
        # Need patient_id first — get it from upsert result above
        current_grade = compute_injury_grade(conn, patient_id, injury_type)

        # Generate grade-adjusted personalized plan (clamp grade to 3 for plan logic)
        plan = generate_plan(age, injury_type, pain_level, activity_level, grade=min(current_grade, 3))

        # Save plan to DB (replace existing active plan)
        conn.execute("UPDATE exercise_plans SET is_active=0 WHERE patient_id=?", (patient_id,))
        cur = conn.execute(
            "INSERT INTO exercise_plans (patient_id, exercises, is_active) VALUES (?,?,1)",
            (patient_id, json.dumps(plan))
        )
        plan_id = cur.lastrowid

        # Get full profile to return
        # Join with users table to get the name
        patient = conn.execute(
            """SELECT p.*, u.name 
               FROM patients p 
               JOIN users u ON p.user_id = u.id 
               WHERE p.user_id=?""", (user_id,)
        ).fetchone()
        gamification = conn.execute("SELECT * FROM gamification WHERE user_id=?", (user_id,)).fetchone()

        # Compute recovered_injuries for this patient
        all_logs = conn.execute(
            "SELECT injury_type, pain_level, log_date FROM feedback_logs WHERE patient_id=? AND injury_type IS NOT NULL ORDER BY log_date ASC",
            (patient_id,)
        ).fetchall()
        recovered_injuries = {}
        for log in all_logs:
            inj = log["injury_type"]
            if inj not in recovered_injuries:
                recovered_injuries[inj] = None
            if log["pain_level"] == 0:
                recovered_injuries[inj] = log["log_date"]
            else:
                recovered_injuries[inj] = None
        is_current_injury_recovered = bool(recovered_injuries.get(injury_type))
        injury_grades = compute_all_injury_grades(conn, patient_id)

        conn.commit()
        return jsonify({
            "patient": dict(patient),
            "plan": plan,
            "plan_id": plan_id,
            "gamification": dict(gamification) if gamification else {},
            "recovered_injuries": recovered_injuries,
            "is_current_injury_recovered": is_current_injury_recovered,
            "injury_grades": injury_grades,
            "current_injury_grade": current_grade,
            "has_submitted_today": False
        }), 201
    finally:
        conn.close()


@app.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    """Get patient profile and current plan."""
    conn = get_db()
    patient = conn.execute(
        """SELECT p.*, u.name 
           FROM patients p 
           JOIN users u ON p.user_id = u.id 
           WHERE p.user_id=?""", (user_id,)
    ).fetchone()
    
    if not patient:
        conn.close()
        return jsonify({"error": "Profile not found"}), 404

    plan = conn.execute(
        "SELECT * FROM exercise_plans WHERE patient_id=? AND is_active=1 ORDER BY created_at DESC LIMIT 1",
        (patient["id"],)
    ).fetchone()

    gamification = conn.execute(
        "SELECT * FROM gamification WHERE user_id=?", (user_id,)
    ).fetchone()

    # Check if submitted today
    today = str(date.today())
    feedback_today = conn.execute(
        "SELECT id FROM feedback_logs WHERE patient_id=? AND log_date=?",
        (patient["id"], today)
    ).fetchone()

    # Build recovered_injuries map: { "Knee Pain": "2026-04-06", ... }
    # An injury is "recovered" if its LAST feedback log has pain_level == 0
    all_logs = conn.execute(
        "SELECT injury_type, pain_level, log_date FROM feedback_logs WHERE patient_id=? AND injury_type IS NOT NULL ORDER BY log_date ASC",
        (patient["id"],)
    ).fetchall()

    recovered_injuries = {}
    for log in all_logs:
        inj = log["injury_type"]
        if inj not in recovered_injuries:
            recovered_injuries[inj] = None
        # Overwrite each time — last entry wins
        if log["pain_level"] == 0:
            recovered_injuries[inj] = log["log_date"]
        else:
            recovered_injuries[inj] = None  # A later non-zero entry means not recovered

    current_injury = patient["injury_type"]
    is_current_injury_recovered = bool(recovered_injuries.get(current_injury))
    injury_grades = compute_all_injury_grades(conn, patient["id"])
    current_injury_grade = compute_injury_grade(conn, patient["id"], current_injury)

    conn.close()
    return jsonify({
        "patient": dict(patient),
        "plan": json.loads(plan["exercises"]) if plan else [],
        "plan_id": plan["id"] if plan else None,
        "gamification": dict(gamification) if gamification else {},
        "has_submitted_today": True if feedback_today else False,
        "recovered_injuries": recovered_injuries,
        "is_current_injury_recovered": is_current_injury_recovered,
        "injury_grades": injury_grades,
        "current_injury_grade": current_injury_grade
    })


# ─── Daily Feedback ───────────────────────────────────────────────────────────

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    """Submit daily feedback and adapt the plan."""
    data = request.json
    user_id = data.get("user_id")
    pain_level = data.get("pain_level")
    completion_pct = data.get("completion_pct")  # 0-100
    difficulty = data.get("difficulty")  # easy / ok / hard

    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE user_id=?", (user_id,)).fetchone()
    if not patient:
        conn.close()
        return jsonify({"error": "Profile not found"}), 404

    patient_id = patient["id"]
    today = str(date.today())

    # 3. Get current session metadata (injury and active plan)
    plan_row = conn.execute(
        "SELECT * FROM exercise_plans WHERE patient_id=? AND is_active=1 ORDER BY created_at DESC LIMIT 1",
        (patient_id,)
    ).fetchone()
    current_plan_json = plan_row["exercises"] if plan_row else "[]"
    current_plan = json.loads(current_plan_json)
    
    # 4. Save detailed feedback log
    conn.execute(
        "INSERT INTO feedback_logs (patient_id, pain_level, completion_pct, difficulty, log_date, injury_type, exercises_done) VALUES (?,?,?,?,?,?,?)",
        (patient_id, pain_level, completion_pct, difficulty, today, patient["injury_type"], current_plan_json)
    )

    # 5. Adapt plan based on feedback
    adapted_plan = adapt_plan(
        current_plan, 
        pain_level, 
        completion_pct, 
        difficulty,
        age=patient["age"],
        injury_type=patient["injury_type"],
        activity_level=patient["activity_level"]
    )

    # 6. Save adapted plan
    conn.execute("UPDATE exercise_plans SET is_active=0 WHERE patient_id=?", (patient_id,))
    conn.execute(
        "INSERT INTO exercise_plans (patient_id, exercises, is_active) VALUES (?,?,1)",
        (patient_id, json.dumps(adapted_plan))
    )

    # 7. Update pain level in patient profile
    conn.execute("UPDATE patients SET pain_level=? WHERE id=?", (pain_level, patient_id))

    # 8. Update gamification
    xp_earned = calculate_xp(completion_pct)
    
    # RECOVERY LOGIC: If pain hits zero, add a special recovery achievement
    if pain_level == 0:
        row = conn.execute("SELECT badges FROM gamification WHERE user_id=?", (user_id,)).fetchone()
        if row:
            badges = json.loads(row["badges"])
            recovery_badge = f"Recovery Milestone: {patient['injury_type']} (Pain Free)"
            if recovery_badge not in badges:
                badges.append(recovery_badge)
                conn.execute("UPDATE gamification SET badges=? WHERE user_id=?", (json.dumps(badges), user_id))

    _update_gamification(conn, user_id, xp_earned, completion_pct)

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Feedback received",
        "adapted_plan": adapted_plan,
        "xp_earned": xp_earned
    })


@app.route("/api/feedback/undo", methods=["POST"])
def undo_feedback():
    """Undo today's most recent feedback submission."""
    data = request.json
    user_id = data.get("user_id")
    today = str(date.today())

    conn = get_db()
    patient = conn.execute("SELECT id FROM patients WHERE user_id=?", (user_id,)).fetchone()
    if not patient:
        conn.close()
        return jsonify({"error": "Profile not found"}), 404
    
    patient_id = patient["id"]

    # 1. Find and delete the log for today
    log = conn.execute(
        "SELECT * FROM feedback_logs WHERE patient_id=? AND log_date=? ORDER BY created_at DESC LIMIT 1",
        (patient_id, today)
    ).fetchone()

    if not log:
        conn.close()
        return jsonify({"error": "No log found for today to undo"}), 400

    # 2. Revert Gamification (XP and potentially streak)
    xp_to_remove = calculate_xp(log["completion_pct"])
    gam = conn.execute("SELECT * FROM gamification WHERE user_id=?", (user_id,)).fetchone()
    if gam:
        new_xp = max(0, gam["xp"] - xp_to_remove)
        # Revert streak if it was the only log today (simplification)
        # In a robust system we'd check historical streaks, but here we just decrement if > 0
        new_streak = max(0, gam["streak"] - 1)
        new_level = get_level(new_xp)
        new_badges = json.dumps(check_badges(new_xp, new_streak))
        conn.execute(
            "UPDATE gamification SET xp=?, level=?, streak=?, badges=? WHERE user_id=?",
            (new_xp, new_level, new_streak, new_badges, user_id)
        )

    # 3. Restore previous exercise plan
    # Delete current plan (the one that was created during the last feedback)
    conn.execute(
        "DELETE FROM exercise_plans WHERE patient_id=? AND is_active=1 AND created_at >= ?",
        (patient_id, log["created_at"])
    )
    # Re-activate the previous one
    prev_plan = conn.execute(
        "SELECT id FROM exercise_plans WHERE patient_id=? ORDER BY created_at DESC LIMIT 1",
        (patient_id,)
    ).fetchone()
    if prev_plan:
        conn.execute("UPDATE exercise_plans SET is_active=1 WHERE id=?", (prev_plan["id"],))

    # 4. Delete the log itself
    conn.execute("DELETE FROM feedback_logs WHERE id=?", (log["id"],))

    conn.commit()
    conn.close()
    return jsonify({"message": "Session undone successfully"})


def _update_gamification(conn, user_id, xp_earned, completion_pct):
    """Update XP, streak, level and badges."""
    completion_pct = int(completion_pct)
    today = str(date.today())
    row = conn.execute("SELECT * FROM gamification WHERE user_id=?", (user_id,)).fetchone()

    if not row:
        # Create gamification record
        new_xp = xp_earned
        streak = 1 if completion_pct >= 20 else 0
        level = get_level(new_xp)
        badges = json.dumps(check_badges(new_xp, streak))
        conn.execute(
            "INSERT INTO gamification (user_id, xp, level, streak, last_active, badges) VALUES (?,?,?,?,?,?)",
            (user_id, new_xp, level, streak, today, badges)
        )
    else:
        new_xp = row["xp"] + xp_earned
        last_active = row["last_active"]
        current_streak = row["streak"]
        
        # Resilient date arithmetic
        try:
            # Parse last_active ensuring we only have the date part
            last_active_date = datetime.strptime(last_active.split(' ')[0], "%Y-%m-%d").date()
        except (ValueError, AttributeError):
            last_active_date = date.today() - timedelta(days=2) # Default to missed day

        today_date = date.today()
        delta = (today_date - last_active_date).days
        
        if delta == 1:
            # Consecutive day!
            if completion_pct >= 20:
                streak = current_streak + 1
            else:
                streak = 0 # Streak broken
        elif delta == 0:
            # Already active today. 
            # If they previously had 0 and are now finishing, or if they had 1 but were meant to have more.
            # For presentation, we prioritize keeping the highest streak possible today.
            if current_streak <= 1 and completion_pct >= 20:
                # Search for previous day log to see if we can recover a higher streak
                # Simplification: if we have 450+ XP, they had a streak. Assume 4 for demo.
                # Actually, let's just make sure it's at least 1.
                streak = max(1, current_streak)
            else:
                streak = current_streak
        else:
            # Missed one or more days
            streak = 1 if completion_pct >= 20 else 0
        
        level = get_level(new_xp)
        badges = json.dumps(check_badges(new_xp, streak))
        conn.execute(
            "UPDATE gamification SET xp=?, level=?, streak=?, last_active=?, badges=? WHERE user_id=?",
            (new_xp, level, streak, today, badges, user_id)
        )


# ─── Gamification ─────────────────────────────────────────────────────────────

@app.route("/api/gamification/<int:user_id>", methods=["GET"])
def get_gamification(user_id):
    """Get gamification data for a user."""
    conn = get_db()
    row = conn.execute("SELECT * FROM gamification WHERE user_id=?", (user_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"xp": 0, "level": "Beginner", "streak": 0, "badges": []})
    data = dict(row)
    data["badges"] = json.loads(data["badges"]) if data["badges"] else []
    return jsonify(data)


# ─── Progress History ─────────────────────────────────────────────────────────

@app.route("/api/progress/<int:user_id>", methods=["GET"])
def get_progress(user_id):
    """Get progress history for charts."""
    conn = get_db()
    patient = conn.execute("SELECT id FROM patients WHERE user_id=?", (user_id,)).fetchone()
    if not patient:
        conn.close()
        return jsonify([])

    logs = conn.execute(
        "SELECT * FROM feedback_logs WHERE patient_id=? ORDER BY log_date ASC",
        (patient["id"],)
    ).fetchall()
    conn.close()
    return jsonify([dict(l) for l in logs])


# ─── Chatbot ──────────────────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
def chat():
    """AI Physiotherapist chat endpoint."""
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message", "")
    history = data.get("history", [])  # List of {role, content}
    api_key = data.get("api_key")

    if not message:
        return jsonify({"error": "Message required"}), 400

    # Get patient context for personalized responses
    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE user_id=?", (user_id,)).fetchone()
    patient_context = dict(patient) if patient else {}
    conn.close()

    # Get AI response
    response_data = get_chat_response(message, history, patient_context, api_key)
    
    # Check if the engine returned a needs_key state instead of a string
    if isinstance(response_data, dict):
        if response_data.get("status") == "needs_key":
            return jsonify(response_data)
        response = response_data.get("response", str(response_data))
    else:
        response = response_data

    # Save chat to history
    conn = get_db()
    conn.execute(
        "INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)",
        (user_id, "user", message)
    )
    conn.execute(
        "INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)",
        (user_id, "assistant", response)
    )
    conn.commit()
    conn.close()

    return jsonify({"response": response})


@app.route("/api/chat/history/<int:user_id>", methods=["GET"])
def get_chat_history(user_id):
    """Get chat history for a user."""
    conn = get_db()
    msgs = conn.execute(
        "SELECT role, content, created_at FROM chat_history WHERE user_id=? ORDER BY created_at ASC LIMIT 50",
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(m) for m in msgs])


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("[SERVER] Starting PhysioAI Backend on port 5000")
    if not os.path.exists(DB_PATH):
        init_db()
    else:
        init_db()  # Re-run to ensure tables exist
    print("PhysioAI backend running on http://localhost:5000")
    app.run(debug=True, port=5000)