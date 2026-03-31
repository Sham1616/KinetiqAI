"""
PhysioAI - Sample Data Seeder
Run this to populate the database with demo data.
Usage: python seed.py
"""

import sqlite3
import json
import os
from datetime import date, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "physioai.db")

def seed():
    conn = sqlite3.connect(DB_PATH)

    # Create demo user
    try:
        conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?,?,?)",
            ("Demo User", "demo@physioai.com", "demo123")
        )
        print("✅ Created demo user: demo@physioai.com / demo123")
    except sqlite3.IntegrityError:
        print("⚠️  Demo user already exists")

    user = conn.execute("SELECT id FROM users WHERE email='demo@physioai.com'").fetchone()
    user_id = user[0]

    # Create patient profile
    try:
        conn.execute(
            "INSERT OR REPLACE INTO patients (user_id, age, injury_type, pain_level, activity_level) VALUES (?,?,?,?,?)",
            (user_id, 35, "Knee Pain", 5, "medium")
        )
        print("✅ Created patient profile")
    except Exception as e:
        print(f"⚠️  {e}")

    patient = conn.execute("SELECT id FROM patients WHERE user_id=?", (user_id,)).fetchone()
    patient_id = patient[0]

    # Create sample exercise plan
    plan = [
        {"name": "Straight Leg Raises", "category": "knee", "difficulty": 1, "difficulty_label": "Beginner",
         "description": "Lie flat, raise leg to 45°, hold 5s", "reps": 10, "sets": 2},
        {"name": "Heel Slides", "category": "knee", "difficulty": 1, "difficulty_label": "Beginner",
         "description": "Slide heel toward buttocks while lying down", "reps": 12, "sets": 2},
        {"name": "Terminal Knee Extensions", "category": "knee", "difficulty": 2, "difficulty_label": "Intermediate",
         "description": "Stand with band, straighten knee against resistance", "reps": 12, "sets": 3},
        {"name": "Mini Squats", "category": "knee", "difficulty": 2, "difficulty_label": "Intermediate",
         "description": "Partial squat to 30°, hold 3s", "reps": 10, "sets": 3},
    ]
    conn.execute(
        "INSERT INTO exercise_plans (patient_id, exercises) VALUES (?,?)",
        (patient_id, json.dumps(plan))
    )
    print("✅ Created exercise plan")

    # Create 14 days of feedback history
    today = date.today()
    pain_trend = [7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3]  # Improving trend
    completion_trend = [60, 70, 75, 80, 80, 85, 90, 85, 90, 90, 95, 90, 95, 100]
    difficulties = ["hard","hard","ok","ok","ok","ok","easy","ok","easy","easy","easy","easy","easy","easy"]

    for i in range(14):
        log_date = today - timedelta(days=13-i)
        conn.execute(
            "INSERT OR IGNORE INTO feedback_logs (patient_id, pain_level, completion_pct, difficulty, log_date) VALUES (?,?,?,?,?)",
            (patient_id, pain_trend[i], completion_trend[i], difficulties[i], str(log_date))
        )

    print("✅ Created 14 days of feedback history")

    # Create gamification record
    try:
        badges = json.dumps(["first_session", "xp_100", "streak_3"])
        conn.execute(
            "INSERT INTO gamification (user_id, xp, level, streak, last_active, badges) VALUES (?,?,?,?,?,?)",
            (user_id, 420, "Improving", 7, str(today), badges)
        )
        print("✅ Created gamification record (420 XP, 7-day streak)")
    except sqlite3.IntegrityError:
        print("⚠️  Gamification record already exists")

    # Create sample chat history
    chats = [
        ("user", "What exercises should I do for my knee?"),
        ("assistant", "Great question! For knee recovery, I recommend starting with Straight Leg Raises and Heel Slides. These low-impact exercises strengthen the muscles around your knee without putting stress on the joint. Remember to move slowly and stop if you feel sharp pain! 💪"),
        ("user", "How long will my recovery take?"),
        ("assistant", "Recovery timelines vary based on injury severity and consistency. With your medium activity level and current pain of 5/10, you're looking at 6-12 weeks with consistent daily exercises. The key is showing up every day — even on tough days, doing 50% is better than skipping! 🌟"),
    ]
    for role, content in chats:
        conn.execute(
            "INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)",
            (user_id, role, content)
        )
    print("✅ Created sample chat history")

    conn.commit()
    conn.close()
    print("\n🎉 Seeding complete! Login with: demo@physioai.com / demo123")

if __name__ == "__main__":
    seed()