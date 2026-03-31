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
    print("✅ Database initialized")


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

@app.route("/api/profile", methods=["POST"])
def create_profile():
    """Create or update a patient profile and generate initial plan."""
    data = request.json
    user_id = data.get("user_id")
    age = data.get("age")
    injury_type = data.get("injury_type")
    pain_level = data.get("pain_level")
    activity_level = data.get("activity_level")

    if not all([user_id, age, injury_type, pain_level, activity_level]):
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

        # Generate personalized plan
        plan = generate_plan(age, injury_type, pain_level, activity_level)

        # Save plan to DB (replace existing active plan)
        conn.execute("UPDATE exercise_plans SET is_active=0 WHERE patient_id=?", (patient_id,))
        cur = conn.execute(
            "INSERT INTO exercise_plans (patient_id, exercises) VALUES (?,?)",
            (patient_id, json.dumps(plan))
        )
        plan_id = cur.lastrowid

        conn.commit()
        return jsonify({"message": "Profile saved", "patient_id": patient_id, "plan": plan, "plan_id": plan_id}), 201
    finally:
        conn.close()


@app.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    """Get patient profile and current plan."""
    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE user_id=?", (user_id,)).fetchone()
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

    conn.close()
    return jsonify({
        "patient": dict(patient),
        "plan": json.loads(plan["exercises"]) if plan else [],
        "plan_id": plan["id"] if plan else None,
        "gamification": dict(gamification) if gamification else {}
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

    # Save feedback log
    conn.execute(
        "INSERT INTO feedback_logs (patient_id, pain_level, completion_pct, difficulty, log_date) VALUES (?,?,?,?,?)",
        (patient_id, pain_level, completion_pct, difficulty, today)
    )

    # Get current plan
    plan_row = conn.execute(
        "SELECT * FROM exercise_plans WHERE patient_id=? AND is_active=1 ORDER BY created_at DESC LIMIT 1",
        (patient_id,)
    ).fetchone()
    current_plan = json.loads(plan_row["exercises"]) if plan_row else []

    # Adapt plan based on feedback
    adapted_plan = adapt_plan(current_plan, pain_level, completion_pct, difficulty)

    # Save adapted plan
    conn.execute("UPDATE exercise_plans SET is_active=0 WHERE patient_id=?", (patient_id,))
    conn.execute(
        "INSERT INTO exercise_plans (patient_id, exercises) VALUES (?,?)",
        (patient_id, json.dumps(adapted_plan))
    )

    # Update pain level in patient profile
    conn.execute("UPDATE patients SET pain_level=? WHERE id=?", (pain_level, patient_id))

    # Update gamification
    xp_earned = calculate_xp(completion_pct)
    _update_gamification(conn, user_id, xp_earned, completion_pct)

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Feedback received",
        "adapted_plan": adapted_plan,
        "xp_earned": xp_earned
    })


def _update_gamification(conn, user_id, xp_earned, completion_pct):
    """Update XP, streak, level and badges."""
    today = str(date.today())
    row = conn.execute("SELECT * FROM gamification WHERE user_id=?", (user_id,)).fetchone()

    if not row:
        # Create gamification record
        new_xp = xp_earned
        streak = 1 if completion_pct > 0 else 0
        level = get_level(new_xp)
        badges = json.dumps(check_badges(new_xp, streak))
        conn.execute(
            "INSERT INTO gamification (user_id, xp, level, streak, last_active, badges) VALUES (?,?,?,?,?,?)",
            (user_id, new_xp, level, streak, today, badges)
        )
    else:
        new_xp = row["xp"] + xp_earned
        last_active = row["last_active"]
        # Streak logic
        from datetime import timedelta
        yesterday = str(date.today() - timedelta(days=1))
        if last_active == yesterday:
            streak = row["streak"] + 1
        elif last_active == today:
            streak = row["streak"]
        else:
            streak = 1 if completion_pct > 0 else 0

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

    if not message:
        return jsonify({"error": "Message required"}), 400

    # Get patient context for personalized responses
    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE user_id=?", (user_id,)).fetchone()
    patient_context = dict(patient) if patient else {}
    conn.close()

    # Get AI response
    response = get_chat_response(message, history, patient_context)

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
    if not os.path.exists(DB_PATH):
        init_db()
    else:
        init_db()  # Re-run to ensure tables exist
    print("🚀 PhysioAI backend running on http://localhost:5000")
    app.run(debug=True, port=5000)