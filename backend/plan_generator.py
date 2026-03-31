"""
PhysioAI - Plan Generator
Rule-based logic to generate and adapt personalized physiotherapy plans.
"""

# ─── Exercise Library ─────────────────────────────────────────────────────────
# Each exercise has: name, category, difficulty (1=easy, 2=med, 3=hard), description

EXERCISE_LIBRARY = {
    "knee": [
        {"name": "Straight Leg Raises", "category": "knee", "difficulty": 1,
         "description": "Lie flat, raise leg to 45°, hold 5s", "reps": 10, "sets": 2},
        {"name": "Heel Slides", "category": "knee", "difficulty": 1,
         "description": "Slide heel toward buttocks while lying down", "reps": 15, "sets": 2},
        {"name": "Terminal Knee Extensions", "category": "knee", "difficulty": 2,
         "description": "Stand with band, straighten knee against resistance", "reps": 12, "sets": 3},
        {"name": "Mini Squats", "category": "knee", "difficulty": 2,
         "description": "Partial squat to 30°, hold 3s", "reps": 10, "sets": 3},
        {"name": "Step-Ups", "category": "knee", "difficulty": 3,
         "description": "Step onto platform, control the descent", "reps": 10, "sets": 3},
        {"name": "Wall Squats", "category": "knee", "difficulty": 3,
         "description": "Slide down wall to 90°, hold 30s", "reps": 5, "sets": 3},
    ],
    "back": [
        {"name": "Pelvic Tilts", "category": "back", "difficulty": 1,
         "description": "Lie on back, flatten lower back into floor", "reps": 15, "sets": 2},
        {"name": "Cat-Cow Stretch", "category": "back", "difficulty": 1,
         "description": "Alternate arch and round spine on all fours", "reps": 10, "sets": 2},
        {"name": "Bird-Dog", "category": "back", "difficulty": 2,
         "description": "Extend opposite arm and leg while on all fours", "reps": 10, "sets": 3},
        {"name": "Bridges", "category": "back", "difficulty": 2,
         "description": "Raise hips from floor, hold 5s", "reps": 12, "sets": 3},
        {"name": "Dead Bug", "category": "back", "difficulty": 3,
         "description": "Lying down, extend opposite limbs while stabilizing core", "reps": 8, "sets": 3},
        {"name": "Superman Hold", "category": "back", "difficulty": 3,
         "description": "Lie prone, lift arms and legs simultaneously", "reps": 10, "sets": 3},
    ],
    "shoulder": [
        {"name": "Pendulum Swings", "category": "shoulder", "difficulty": 1,
         "description": "Lean forward, let arm hang and swing in circles", "reps": 10, "sets": 2},
        {"name": "Wall Crawl", "category": "shoulder", "difficulty": 1,
         "description": "Walk fingers up wall to raise arm", "reps": 10, "sets": 2},
        {"name": "Shoulder External Rotation", "category": "shoulder", "difficulty": 2,
         "description": "Elbow bent 90°, rotate arm out against resistance", "reps": 12, "sets": 3},
        {"name": "Scapular Squeezes", "category": "shoulder", "difficulty": 2,
         "description": "Retract shoulder blades and hold 5s", "reps": 15, "sets": 3},
        {"name": "Lateral Raises", "category": "shoulder", "difficulty": 3,
         "description": "Raise arms to shoulder height with light weight", "reps": 12, "sets": 3},
        {"name": "PNF Diagonal Pattern", "category": "shoulder", "difficulty": 3,
         "description": "Move arm diagonally across body with resistance", "reps": 10, "sets": 3},
    ],
    "ankle": [
        {"name": "Ankle Circles", "category": "ankle", "difficulty": 1,
         "description": "Rotate ankle in circles, clockwise and counter-clockwise", "reps": 10, "sets": 2},
        {"name": "Towel Toe Curls", "category": "ankle", "difficulty": 1,
         "description": "Curl toes to scrunch a towel on the floor", "reps": 10, "sets": 2},
        {"name": "Calf Raises", "category": "ankle", "difficulty": 2,
         "description": "Rise on tiptoes slowly, lower with control", "reps": 15, "sets": 3},
        {"name": "Resistance Band Dorsiflexion", "category": "ankle", "difficulty": 2,
         "description": "Pull foot up against band resistance", "reps": 12, "sets": 3},
        {"name": "Single Leg Balance", "category": "ankle", "difficulty": 3,
         "description": "Stand on one leg for 30s, progress to unstable surface", "reps": 5, "sets": 3},
        {"name": "Heel-Toe Walking", "category": "ankle", "difficulty": 3,
         "description": "Walk heel-to-toe in a straight line", "reps": 10, "sets": 3},
    ],
    "hip": [
        {"name": "Hip Flexor Stretch", "category": "hip", "difficulty": 1,
         "description": "Lunge forward and stretch hip flexor, hold 30s", "reps": 5, "sets": 2},
        {"name": "Clam Shells", "category": "hip", "difficulty": 1,
         "description": "Lie on side, open top knee like a clamshell", "reps": 15, "sets": 2},
        {"name": "Hip Abduction", "category": "hip", "difficulty": 2,
         "description": "Lie on side, raise top leg 45°", "reps": 12, "sets": 3},
        {"name": "Hip Bridges with Band", "category": "hip", "difficulty": 2,
         "description": "Bridges with resistance band around thighs", "reps": 12, "sets": 3},
        {"name": "Lateral Band Walks", "category": "hip", "difficulty": 3,
         "description": "Step sideways with resistance band around ankles", "reps": 15, "sets": 3},
        {"name": "Single Leg Deadlift", "category": "hip", "difficulty": 3,
         "description": "Balance on one leg, hinge forward at hip", "reps": 8, "sets": 3},
    ],
    "neck": [
        {"name": "Chin Tucks", "category": "neck", "difficulty": 1,
         "description": "Retract chin to create double chin, hold 5s", "reps": 10, "sets": 2},
        {"name": "Neck Side Stretch", "category": "neck", "difficulty": 1,
         "description": "Tilt head to each side, hold 20s", "reps": 5, "sets": 2},
        {"name": "Neck Rotation", "category": "neck", "difficulty": 2,
         "description": "Slowly rotate head left and right", "reps": 10, "sets": 3},
        {"name": "Shoulder Shrugs", "category": "neck", "difficulty": 2,
         "description": "Raise and lower shoulders with control", "reps": 15, "sets": 3},
        {"name": "Isometric Neck Resistance", "category": "neck", "difficulty": 3,
         "description": "Push head against hand without moving", "reps": 10, "sets": 3},
        {"name": "Levator Scapulae Stretch", "category": "neck", "difficulty": 3,
         "description": "Rotate and tilt head diagonally, hold 30s", "reps": 5, "sets": 3},
    ],
}

# General/mobility exercises for any injury
GENERAL_EXERCISES = [
    {"name": "Deep Breathing", "category": "general", "difficulty": 1,
     "description": "Diaphragmatic breathing for relaxation and recovery", "reps": 10, "sets": 2},
    {"name": "Gentle Walking", "category": "general", "difficulty": 1,
     "description": "Walk at comfortable pace for 10-15 minutes", "reps": 1, "sets": 1},
]


def generate_plan(age, injury_type, pain_level, activity_level):
    """
    Generate a personalized exercise plan using rule-based logic.
    
    Rules:
    - High pain (7-10) → Only difficulty 1 exercises + general
    - Medium pain (4-6) → Difficulty 1-2 exercises
    - Low pain (1-3) → Difficulty 1-3 based on activity level
    - Activity level adjusts volume (sets/reps)
    """
    pain_level = int(pain_level)
    age = int(age)
    
    # Get injury-specific exercises
    injury_key = _map_injury(injury_type)
    exercises = EXERCISE_LIBRARY.get(injury_key, []).copy()

    # Filter by difficulty based on pain level
    if pain_level >= 7:
        exercises = [e for e in exercises if e["difficulty"] == 1]
        exercises += GENERAL_EXERCISES
    elif pain_level >= 4:
        exercises = [e for e in exercises if e["difficulty"] <= 2]
    else:
        if activity_level == "low":
            exercises = [e for e in exercises if e["difficulty"] <= 2]
        else:
            exercises = exercises  # All difficulties

    # Limit to 4-6 exercises per session
    exercises = exercises[:5]

    # Adjust volume for age and activity level
    adjusted = []
    for ex in exercises:
        ex = ex.copy()
        ex = _adjust_volume(ex, age, activity_level, pain_level)
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
    return mapping.get(injury_type, "back")


def adapt_plan(current_plan, pain_level, completion_pct, difficulty):
    """
    Adapt the current plan based on daily feedback.
    
    Rules:
    - Pain decreased + Easy → Increase intensity (add harder exercises)
    - Pain increased → Reduce intensity (swap to easier exercises)
    - Completion < 50% → Simplify (reduce reps)
    - Difficulty = hard → Reduce reps/sets by 20%
    - Difficulty = easy → Increase reps/sets by 20%
    """
    pain_level = int(pain_level)
    completion_pct = int(completion_pct)
    adapted = []

    for ex in current_plan:
        ex = ex.copy()

        # Adjust based on completion
        if completion_pct < 50:
            # Too much — reduce volume
            ex["reps"] = max(5, int(ex["reps"] * 0.8))
            ex["sets"] = max(1, int(ex["sets"] * 0.8))

        # Adjust based on difficulty feedback
        if difficulty == "easy":
            ex["reps"] = int(ex["reps"] * 1.2)
            ex["sets"] = min(5, ex["sets"] + 1)
        elif difficulty == "hard":
            ex["reps"] = max(5, int(ex["reps"] * 0.8))
            ex["sets"] = max(1, ex["sets"] - 1)

        # Pain-based safety override
        if pain_level >= 7:
            ex["reps"] = max(5, int(ex["reps"] * 0.7))
            ex["sets"] = max(1, ex["sets"] - 1)

        adapted.append(ex)

    return adapted