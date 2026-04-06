"""
PhysioAI - Plan Generator
Rule-based logic to generate and adapt personalized physiotherapy plans.
"""

# ─── Exercise Library ─────────────────────────────────────────────────────────
# Each exercise has: name, category, difficulty (1=easy, 2=med, 3=hard), description

EXERCISE_LIBRARY = {
    "knee": [
        {"name": "Straight Leg Raises", "category": "knee", "difficulty": 1, "video_id": "Ka19yzAlIGY",
         "description": "Lie flat, raise leg to 45°, hold 5s", "reps": 10, "sets": 2},
        {"name": "Heel Slides", "category": "knee", "difficulty": 1, "video_id": "yL5maSn3M-g",
         "description": "Slide heel toward buttocks while lying down", "reps": 15, "sets": 2},
        {"name": "Terminal Knee Extensions", "category": "knee", "difficulty": 2, "video_id": "VuJZ6dqMf8M",
         "description": "Stand with band, straighten knee against resistance", "reps": 12, "sets": 3},
        {"name": "Mini Squats", "category": "knee", "difficulty": 2, "video_id": "IaInMN_WZDM",
         "description": "Partial squat to 30°, hold 3s", "reps": 10, "sets": 3},
        {"name": "Step-Ups", "category": "knee", "difficulty": 3, "video_id": "IaInMN_WZDM",
         "description": "Step onto platform, control the descent", "reps": 10, "sets": 3},
        {"name": "Wall Squats", "category": "knee", "difficulty": 3, "video_id": "VuJZ6dqMf8M",
         "description": "Slide down wall to 90°, hold 30s", "reps": 5, "sets": 3},
    ],
    "back": [
        {"name": "Pelvic Tilts", "category": "back", "difficulty": 1, "video_id": "ytvP0oUDKYw",
         "description": "Lie on back, flatten lower back into floor", "reps": 15, "sets": 2},
        {"name": "Cat-Cow Stretch", "category": "back", "difficulty": 1, "video_id": "Y-s5X4yKPCs",
         "description": "Alternate arch and round spine on all fours", "reps": 10, "sets": 2},
        {"name": "Bird-Dog", "category": "back", "difficulty": 2, "video_id": "Y-s5X4yKPCs",
         "description": "Extend opposite arm and leg while on all fours", "reps": 10, "sets": 3},
        {"name": "Bridges", "category": "back", "difficulty": 2, "video_id": "ytvP0oUDKYw",
         "description": "Raise hips from floor, hold 5s", "reps": 12, "sets": 3},
        {"name": "Dead Bug", "category": "back", "difficulty": 3, "video_id": "ytvP0oUDKYw",
         "description": "Lying down, extend opposite limbs while stabilizing core", "reps": 8, "sets": 3},
        {"name": "Superman Hold", "category": "back", "difficulty": 3, "video_id": "Y-s5X4yKPCs",
         "description": "Lie prone, lift arms and legs simultaneously", "reps": 10, "sets": 3},
    ],
    "shoulder": [
        {"name": "Pendulum Swings", "category": "shoulder", "difficulty": 1, "video_id": "QF_ubbr_RUE",
         "description": "Lean forward, let arm hang and swing in circles", "reps": 10, "sets": 2},
        {"name": "Wall Crawl", "category": "shoulder", "difficulty": 1, "video_id": "QF_ubbr_RUE",
         "description": "Walk fingers up wall to raise arm", "reps": 10, "sets": 2},
        {"name": "Shoulder External Rotation", "category": "shoulder", "difficulty": 2, "video_id": "QF_ubbr_RUE",
         "description": "Elbow bent 90°, rotate arm out against resistance", "reps": 12, "sets": 3},
        {"name": "Scapular Squeezes", "category": "shoulder", "difficulty": 2, "video_id": "QF_ubbr_RUE",
         "description": "Retract shoulder blades and hold 5s", "reps": 15, "sets": 3},
        {"name": "Lateral Raises", "category": "shoulder", "difficulty": 3, "video_id": "QF_ubbr_RUE",
         "description": "Raise arms to shoulder height with light weight", "reps": 12, "sets": 3},
        {"name": "PNF Diagonal Pattern", "category": "shoulder", "difficulty": 3, "video_id": "QF_ubbr_RUE",
         "description": "Move arm diagonally across body with resistance", "reps": 10, "sets": 3},
    ],
    "ankle": [
        {"name": "Ankle Circles", "category": "ankle", "difficulty": 1, "video_id": "mzTQGYGI0Ng",
         "description": "Rotate ankle in circles, clockwise and counter-clockwise", "reps": 10, "sets": 2},
        {"name": "Towel Toe Curls", "category": "ankle", "difficulty": 1, "video_id": "mzTQGYGI0Ng",
         "description": "Curl toes to scrunch a towel on the floor", "reps": 10, "sets": 2},
        {"name": "Calf Raises", "category": "ankle", "difficulty": 2, "video_id": "NPWkc5-6qD0",
         "description": "Rise on tiptoes slowly, lower with control", "reps": 15, "sets": 3},
        {"name": "Resistance Band Dorsiflexion", "category": "ankle", "difficulty": 2, "video_id": "mzTQGYGI0Ng",
         "description": "Pull foot up against band resistance", "reps": 12, "sets": 3},
        {"name": "Single Leg Balance", "category": "ankle", "difficulty": 3, "video_id": "mzTQGYGI0Ng",
         "description": "Stand on one leg for 30s, progress to unstable surface", "reps": 5, "sets": 3},
        {"name": "Heel-Toe Walking", "category": "ankle", "difficulty": 3, "video_id": "mzTQGYGI0Ng",
         "description": "Walk heel-to-toe in a straight line", "reps": 10, "sets": 3},
    ],
    "hip": [
        {"name": "Hip Flexor Stretch", "category": "hip", "difficulty": 1, "video_id": "O2KPabIoPPk",
         "description": "Lunge forward and stretch hip flexor, hold 30s", "reps": 5, "sets": 2},
        {"name": "Clam Shells", "category": "hip", "difficulty": 1, "video_id": "O2KPabIoPPk",
         "description": "Lie on side, open top knee like a clamshell", "reps": 15, "sets": 2},
        {"name": "Hip Abduction", "category": "hip", "difficulty": 2, "video_id": "qBqKuEQl9sI",
         "description": "Lie on side, raise top leg 45°", "reps": 12, "sets": 3},
        {"name": "Hip Bridges with Band", "category": "hip", "difficulty": 2, "video_id": "O2KPabIoPPk",
         "description": "Bridges with resistance band around thighs", "reps": 12, "sets": 3},
        {"name": "Lateral Band Walks", "category": "hip", "difficulty": 3, "video_id": "qBqKuEQl9sI",
         "description": "Step sideways with resistance band around ankles", "reps": 15, "sets": 3},
        {"name": "Single Leg Deadlift", "category": "hip", "difficulty": 3, "video_id": "qBqKuEQl9sI",
         "description": "Balance on one leg, hinge forward at hip", "reps": 8, "sets": 3},
    ],
    "neck": [
        {"name": "Chin Tucks", "category": "neck", "difficulty": 1, "video_id": "7rnlAVhAK-8",
         "description": "Retract chin to create double chin, hold 5s", "reps": 10, "sets": 2},
        {"name": "Neck Side Stretch", "category": "neck", "difficulty": 1, "video_id": "7rnlAVhAK-8",
         "description": "Tilt head to each side, hold 20s", "reps": 5, "sets": 2},
        {"name": "Neck Rotation", "category": "neck", "difficulty": 2, "video_id": "7rnlAVhAK-8",
         "description": "Slowly rotate head left and right", "reps": 10, "sets": 3},
        {"name": "Shoulder Shrugs", "category": "neck", "difficulty": 2, "video_id": "7rnlAVhAK-8",
         "description": "Raise and lower shoulders with control", "reps": 15, "sets": 3},
        {"name": "Isometric Neck Resistance", "category": "neck", "difficulty": 3, "video_id": "7rnlAVhAK-8",
         "description": "Push head against hand without moving", "reps": 10, "sets": 3},
        {"name": "Levator Scapulae Stretch", "category": "neck", "difficulty": 3, "video_id": "7rnlAVhAK-8",
         "description": "Rotate and tilt head diagonally, hold 30s", "reps": 5, "sets": 3},
    ],
}

# General/mobility exercises for any injury
GENERAL_EXERCISES = [
    {"name": "Deep Breathing", "category": "general", "difficulty": 1, "video_id": "-7-CAFhJn78",
     "description": "Diaphragmatic breathing for relaxation and recovery", "reps": 10, "sets": 2},
    {"name": "Gentle Walking", "category": "general", "difficulty": 1, "video_id": "ZgxniVfKT4I",
     "description": "Walk at comfortable pace for 10-15 minutes", "reps": 1, "sets": 1},
]


def generate_plan(age, injury_type, pain_level, activity_level, grade=1):
    """
    Generate a personalized exercise plan using rule-based logic.
    
    Rules:
    - High pain (7-10) → Only difficulty 1 exercises + general
    - Medium pain (4-6) → Difficulty 1-2 exercises
    - Low pain (1-3) → Difficulty 1-3 based on activity level
    - Activity level adjusts volume (sets/reps)
    - grade (1/2/3) controls severity reduction for recurring injuries
    """
    pain_level = int(pain_level)
    age = int(age)
    
    # Get injury-specific exercises
    injury_key = _map_injury(injury_type)
    exercises = EXERCISE_LIBRARY.get(injury_key, []).copy()

    # If it's a custom/unknown injury, use general exercises as the base
    if not exercises:
        exercises = GENERAL_EXERCISES.copy()

    # --- Grade 2 & 3: Force beginner-only regardless of pain level ---
    if grade >= 2:
        exercises = [e for e in exercises if e["difficulty"] == 1]
        if len(exercises) < 3:
            exercises += [e for e in GENERAL_EXERCISES if e["difficulty"] == 1]
    else:
        # Normal grade 1 filtering by pain level
        if pain_level >= 7:
            exercises = [e for e in exercises if e["difficulty"] == 1]
            exercises += GENERAL_EXERCISES
        elif pain_level >= 4:
            exercises = [e for e in exercises if e["difficulty"] <= 2]
        else:
            if activity_level == "low":
                exercises = [e for e in exercises if e["difficulty"] <= 2]

    # Limit exercise count: Grade 3 = 3 max, others = 5 max
    max_exercises = 3 if grade >= 3 else 5
    exercises = exercises[:max_exercises]

    # Adjust volume for age and activity level
    grade_volume_multiplier = {1: 1.0, 2: 0.7, 3: 0.5}.get(grade, 1.0)
    adjusted = []
    for ex in exercises:
        ex = ex.copy()
        ex = _adjust_volume(ex, age, activity_level, pain_level)
        # Apply grade reduction on top of base volume
        if grade >= 2:
            ex["reps"] = max(5, int(ex["reps"] * grade_volume_multiplier))
            ex["sets"] = max(1, int(ex["sets"] * grade_volume_multiplier))
        ex["difficulty_label"] = ["", "Beginner", "Intermediate", "Advanced"][ex["difficulty"]]
        adjusted.append(ex)

    return adjusted


def _adjust_volume(exercise, age, activity_level, pain_level):
    """Adjust reps/sets based on patient profile."""
    multiplier = 1.0

    # Age adjustment
    if age > 60:
        multiplier *= 0.7
    elif age > 45:
        multiplier *= 0.85

    # Activity level adjustment
    if activity_level == "high":
        multiplier *= 1.3
    elif activity_level == "low":
        multiplier *= 0.8

    # Pain adjustment
    if pain_level >= 7:
        multiplier *= 0.6

    exercise["reps"] = max(5, int(exercise["reps"] * multiplier))
    exercise["sets"] = max(1, int(exercise["sets"] * multiplier))
    return exercise


def _map_injury(injury_type):
    """Map injury type string to library key."""
    mapping = {
        "Knee Pain": "knee",
        "Lower Back Pain": "back",
        "Shoulder Injury": "shoulder",
        "Ankle Sprain": "ankle",
        "Hip Pain": "hip",
        "Neck Pain": "neck",
    }
    return mapping.get(injury_type, None)


def adapt_plan(current_plan, pain_level, completion_pct, difficulty, age=30, injury_type="Knee Pain", activity_level="medium"):
    """
    Adapt the current plan based on daily feedback.
    
    Rules:
    - High Pain (>=7) or Difficulty = hard → Switch ALL exercises to difficulty 1 (Beginner)
    - Pain decreased + Easy → Increase volume incrementally
    - Completion < 50% → Simplify volume significantly
    """
    pain_level = int(pain_level)
    completion_pct = int(completion_pct)
    age = int(age)

    # 1. Safety Check: If it was too hard or painful, we do a full "Beginner Reset"
    if pain_level >= 7 or difficulty == "hard":
        injury_key = _map_injury(injury_type)
        library = EXERCISE_LIBRARY.get(injury_key, GENERAL_EXERCISES).copy()
        
        # Only take beginner exercises
        beginner_exs = [e for e in library if e["difficulty"] == 1]
        
        # If not enough beginner ones, mix in general
        if len(beginner_exs) < 3:
            beginner_exs += GENERAL_EXERCISES
            
        adapted = []
        for ex in beginner_exs[:5]:
            ex = ex.copy()
            # Reduce volume even further during a reset
            ex = _adjust_volume(ex, age, activity_level, pain_level)
            ex["reps"] = max(5, int(ex["reps"] * 0.8))
            ex["sets"] = max(1, ex["sets"] - 1)
            ex["difficulty_label"] = "Beginner (Safety Reset)"
            adapted.append(ex)
        return adapted

    # 2. Incremental Adjustment for normal sessions
    adapted = []
    for ex in current_plan:
        ex = ex.copy()

        # Adjust based on completion
        if completion_pct < 50:
            ex["reps"] = max(5, int(ex["reps"] * 0.7))
            ex["sets"] = max(1, ex["sets"] - 1)

        # Adjust based on difficulty feedback
        if difficulty == "easy":
            ex["reps"] = int(ex["reps"] * 1.2)
            ex["sets"] = min(5, ex["sets"] + 1)
        elif difficulty == "hard":
            # This case is now handled by the Beginner Reset above, but kept for individual exercise precision
            ex["reps"] = max(5, int(ex["reps"] * 0.8))
            ex["sets"] = max(1, ex["sets"] - 1)

        adapted.append(ex)

    return adapted