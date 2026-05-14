"""
PhysioAI - AI + ML-Powered Plan Generator
==========================================
Pipeline:
  1. ML/DL Models (ml_model.py)   → predict difficulty cap, volume multiplier, exercise count
  2. Exercise selection            → pick from curated library using ML predictions
  3. Gemini AI                     → enrich each exercise with clinical rationale
  4. Rule-based fallback           → used if both ML and Gemini fail

The ML layer runs LOCALLY (scikit-learn) so it always works even without internet.
Gemini enriches the plan with explanatory text when available.
"""

import json
import urllib.request
import urllib.error

# Import local ML engine (trains / loads models at import time)
try:
    from ml_model import predict_plan_params, get_model_metrics
    _ML_AVAILABLE = True
    print("[PlanGen] ML engine loaded successfully.")
except Exception as _ml_err:
    _ML_AVAILABLE = False
    print(f"[PlanGen] ML engine unavailable: {_ml_err}. Using rule-based fallback.")

# ─── Gemini Config ─────────────────────────────────────────────────────────────

GEMINI_API_KEY   = "AIzaSyDVZurgxZ7EVNqxr72Ejlf_vNk6G2Vudco"
GEMINI_MODELS    = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
GEMINI_ENDPOINTS = ["v1beta", "v1"]


# ─── Exercise Library ──────────────────────────────────────────────────────────

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

GENERAL_EXERCISES = [
    {"name": "Deep Breathing", "category": "general", "difficulty": 1, "video_id": "-7-CAFhJn78",
     "description": "Diaphragmatic breathing for relaxation and recovery", "reps": 10, "sets": 2},
    {"name": "Gentle Walking", "category": "general", "difficulty": 1, "video_id": "ZgxniVfKT4I",
     "description": "Walk at comfortable pace for 10-15 minutes", "reps": 1, "sets": 1},
]

DIFF_LABEL = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}


# ─── Gemini Rationale Helper ────────────────────────────────────────────────────

def _gemini_rationale(exercises: list, age: int, injury_type: str,
                       pain_level: int, activity_level: str, ml_params: dict) -> list:
    """
    Ask Gemini to add a short clinical rationale to each exercise.
    Returns the enriched list; falls back to generic text on failure.
    """
    exercise_names = [e["name"] for e in exercises]
    prompt = f"""You are an expert clinical physiotherapist AI.

A patient has the following profile:
- Age: {age}
- Injury: {injury_type}
- Pain Level: {pain_level}/10
- Activity Level: {activity_level}
- Plan selected by ML models: difficulty_cap={ml_params['max_difficulty']}, volume_multiplier={ml_params['volume_multiplier']:.2f}

The following exercises have been chosen for them:
{json.dumps(exercise_names)}

For EACH exercise, write a single concise clinical rationale (max 15 words) explaining
WHY it suits this specific patient. Be specific about pain level, age, or injury.

Respond ONLY with a valid JSON object mapping exercise name to rationale string.
Example: {{"Heel Slides": "Gentle range-of-motion ideal for acute knee pain at level {pain_level}."}}
"""
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "responseMimeType": "application/json"},
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
        ]
    }

    for model in GEMINI_MODELS:
        for ep in GEMINI_ENDPOINTS:
            try:
                url = (f"https://generativelanguage.googleapis.com/{ep}/models/"
                       f"{model}:generateContent?key={GEMINI_API_KEY}")
                req = urllib.request.Request(
                    url, data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}, method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    result = json.loads(resp.read().decode("utf-8"))
                    raw = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if raw.startswith("```"):
                        raw = "\n".join(
                            l for l in raw.split("\n") if not l.strip().startswith("```")
                        )
                    rationale_map = json.loads(raw)
                    for ex in exercises:
                        ex["ai_rationale"] = rationale_map.get(
                            ex["name"],
                            f"Clinically appropriate for {injury_type} at pain level {pain_level}."
                        )
                    print(f"[PlanGen] Gemini rationale enrichment success via {model}.")
                    return exercises
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    continue
                if e.code == 429:
                    break
                return _add_default_rationale(exercises, injury_type, pain_level)
            except Exception:
                continue

    return _add_default_rationale(exercises, injury_type, pain_level)


def _add_default_rationale(exercises: list, injury_type: str, pain_level: int) -> list:
    for ex in exercises:
        ex.setdefault(
            "ai_rationale",
            f"Selected by ML models for {injury_type} with pain level {pain_level}/10."
        )
    return exercises


# ─── Core Plan Builder (ML-driven) ─────────────────────────────────────────────

def _ml_select_exercises(age: int, injury_type: str, pain_level: int,
                          activity_level: str, grade: int) -> tuple:
    """
    Use ML models to get (max_difficulty, volume_multiplier, max_exercises),
    then select exercises from the library accordingly.

    Returns (exercises_list, ml_params_dict)
    """
    ml_params = predict_plan_params(age, pain_level, activity_level, injury_type, grade)
    max_diff = ml_params["max_difficulty"]
    vol_mult = ml_params["volume_multiplier"]
    max_exs  = ml_params["max_exercises"]

    # Select exercises from library filtered by difficulty cap
    injury_key = _map_injury(injury_type)
    pool = EXERCISE_LIBRARY.get(injury_key, []).copy()
    if not pool:
        pool = GENERAL_EXERCISES.copy()

    filtered = [e for e in pool if e["difficulty"] <= max_diff]

    # If too few exercises, supplement with general exercises
    if len(filtered) < 2:
        filtered += [e for e in GENERAL_EXERCISES if e["difficulty"] <= max_diff]

    # Prefer a mix of difficulties (easiest to hardest)
    selected = filtered[:max_exs]

    # Apply ML volume multiplier to reps/sets
    result = []
    for ex in selected:
        ex = ex.copy()
        ex["reps"] = max(5, int(round(ex["reps"] * vol_mult)))
        ex["sets"] = max(1, int(round(ex["sets"] * vol_mult)))
        ex["difficulty_label"] = DIFF_LABEL.get(ex["difficulty"], "Beginner")
        result.append(ex)

    return result, ml_params


# ─── Public API ────────────────────────────────────────────────────────────────

def generate_plan(age, injury_type, pain_level, activity_level, grade=1):
    """
    Generate a personalised exercise plan.

    Priority:
      1. ML models (RandomForest + GradBoost + MLP) → exercise selection & volume
      2. Gemini AI                                    → clinical rationale text
      3. Rule-based fallback                          → if ML unavailable
    """
    age        = int(age)
    pain_level = int(pain_level)
    grade      = int(grade)

    if _ML_AVAILABLE:
        try:
            exercises, ml_params = _ml_select_exercises(
                age, injury_type, pain_level, activity_level, grade
            )
            print(f"[PlanGen] ML predicted → difficulty_cap={ml_params['max_difficulty']}, "
                  f"volume={ml_params['volume_multiplier']:.2f}, "
                  f"max_exercises={ml_params['max_exercises']}, "
                  f"models={ml_params['models_used']}")

            # Enrich with Gemini rationale
            exercises = _gemini_rationale(
                exercises, age, injury_type, pain_level, activity_level, ml_params
            )

            # Attach ML metadata to the first exercise for frontend display
            exercises[0]["ml_metadata"] = {
                "engine": "ML + AI",
                "models": ml_params["models_used"],
                "confidence": ml_params["confidence"],
                "volume_multiplier": ml_params["volume_multiplier"]
            }

            return exercises

        except Exception as e:
            print(f"[PlanGen] ML pipeline error: {e} — falling back to rule-based.")

    # ── Rule-based fallback ───────────────────────────────────────────────────
    return _rule_based_generate(age, injury_type, pain_level, activity_level, grade)


def adapt_plan(current_plan, pain_level, completion_pct, difficulty,
               age=30, injury_type="Knee Pain", activity_level="medium"):
    """
    Adapt the current exercise plan using ML-informed logic + Gemini insight.

    The ML engine re-predicts parameters from updated pain level, then applies
    to each exercise incrementally.
    """
    pain_level     = int(pain_level)
    completion_pct = int(completion_pct)
    age            = int(age)

    # Full safety reset always overrides everything
    if pain_level >= 7 or difficulty == "hard":
        return _safety_reset(age, injury_type, activity_level, pain_level)

    if _ML_AVAILABLE:
        try:
            # Re-predict volume with current (updated) pain level
            ml_params = predict_plan_params(age, pain_level, activity_level, injury_type, grade=1)
            new_vol   = ml_params["volume_multiplier"]

            adapted = []
            for ex in current_plan:
                ex = ex.copy()

                # Completion < 50% → reduce further on top of ML volume
                if completion_pct < 50:
                    new_vol = max(0.4, new_vol * 0.75)

                # Difficulty easy → boost
                if difficulty == "easy" and completion_pct >= 50:
                    ex["reps"] = min(30, max(5, int(ex["reps"] * 1.2)))
                    ex["sets"] = min(5, ex["sets"] + 1)
                else:
                    # Apply ML-predicted volume multiplier
                    base_reps = ex.get("reps", 10)
                    base_sets = ex.get("sets", 2)
                    ex["reps"] = max(5, int(round(base_reps * new_vol)))
                    ex["sets"] = max(1, int(round(base_sets * new_vol)))

                ex.setdefault("difficulty_label", DIFF_LABEL.get(ex.get("difficulty", 1), "Beginner"))
                ex["ai_rationale"] = (
                    f"ML-adapted: volume×{new_vol:.2f} based on pain {pain_level}/10 "
                    f"and {completion_pct}% completion."
                )
                adapted.append(ex)

            print(f"[PlanGen] ML adapted plan (pain={pain_level}, completion={completion_pct}%, "
                  f"difficulty={difficulty}, new_vol={new_vol:.2f})")
            return adapted

        except Exception as e:
            print(f"[PlanGen] ML adapt error: {e} — falling back to rule-based.")

    return _rule_based_adapt(current_plan, pain_level, completion_pct, difficulty,
                              age, injury_type, activity_level)


# ─── Safety Reset ───────────────────────────────────────────────────────────────

def _safety_reset(age, injury_type, activity_level, pain_level):
    """Full reset to beginner exercises when pain is high or session was too hard."""
    injury_key  = _map_injury(injury_type)
    library     = EXERCISE_LIBRARY.get(injury_key, GENERAL_EXERCISES).copy()
    beginners   = [e for e in library if e["difficulty"] == 1]
    if len(beginners) < 3:
        beginners += GENERAL_EXERCISES

    result = []
    for ex in beginners[:5]:
        ex = ex.copy()
        ex = _adjust_volume(ex, age, activity_level, pain_level)
        ex["reps"]            = max(5, int(ex["reps"] * 0.8))
        ex["sets"]            = max(1, ex["sets"] - 1)
        ex["difficulty_label"] = "Beginner (Safety Reset)"
        ex["ai_rationale"]    = (
            f"Safety reset: high pain ({pain_level}/10) requires beginner-only exercises "
            "with reduced volume."
        )
        result.append(ex)
    return result


# ─── Rule-Based Fallback ────────────────────────────────────────────────────────

def _rule_based_generate(age, injury_type, pain_level, activity_level, grade=1):
    injury_key = _map_injury(injury_type)
    exercises  = EXERCISE_LIBRARY.get(injury_key, []).copy()
    if not exercises:
        exercises = GENERAL_EXERCISES.copy()

    if grade >= 2:
        exercises = [e for e in exercises if e["difficulty"] == 1]
        if len(exercises) < 3:
            exercises += [e for e in GENERAL_EXERCISES if e["difficulty"] == 1]
    else:
        if pain_level >= 7:
            exercises = [e for e in exercises if e["difficulty"] == 1]
            exercises += GENERAL_EXERCISES
        elif pain_level >= 4:
            exercises = [e for e in exercises if e["difficulty"] <= 2]
        else:
            if activity_level == "low":
                exercises = [e for e in exercises if e["difficulty"] <= 2]

    max_exercises = 3 if grade >= 3 else 5
    exercises     = exercises[:max_exercises]
    grade_mult    = {1: 1.0, 2: 0.7, 3: 0.5}.get(grade, 1.0)

    adjusted = []
    for ex in exercises:
        ex = ex.copy()
        ex = _adjust_volume(ex, age, activity_level, pain_level)
        if grade >= 2:
            ex["reps"] = max(5, int(ex["reps"] * grade_mult))
            ex["sets"] = max(1, int(ex["sets"] * grade_mult))
        ex["difficulty_label"] = DIFF_LABEL.get(ex["difficulty"], "Beginner")
        ex["ai_rationale"]     = "Selected by rule-based fallback engine (ML unavailable)."
        adjusted.append(ex)
    return adjusted


def _rule_based_adapt(current_plan, pain_level, completion_pct, difficulty,
                       age=30, injury_type="Knee Pain", activity_level="medium"):
    if pain_level >= 7 or difficulty == "hard":
        return _safety_reset(age, injury_type, activity_level, pain_level)

    adapted = []
    for ex in current_plan:
        ex = ex.copy()
        if completion_pct < 50:
            ex["reps"] = max(5, int(ex["reps"] * 0.7))
            ex["sets"] = max(1, ex["sets"] - 1)
        if difficulty == "easy":
            ex["reps"] = int(ex["reps"] * 1.2)
            ex["sets"] = min(5, ex["sets"] + 1)
        elif difficulty == "hard":
            ex["reps"] = max(5, int(ex["reps"] * 0.8))
            ex["sets"] = max(1, ex["sets"] - 1)
        adapted.append(ex)
    return adapted


# ─── Utility Helpers ───────────────────────────────────────────────────────────

def _adjust_volume(exercise, age, activity_level, pain_level):
    multiplier = 1.0
    if age > 60:
        multiplier *= 0.7
    elif age > 45:
        multiplier *= 0.85
    if activity_level == "high":
        multiplier *= 1.3
    elif activity_level == "low":
        multiplier *= 0.8
    if pain_level >= 7:
        multiplier *= 0.6
    exercise["reps"] = max(5, int(exercise["reps"] * multiplier))
    exercise["sets"] = max(1, int(exercise["sets"] * multiplier))
    return exercise


def _map_injury(injury_type):
    mapping = {
        "Knee Pain":       "knee",
        "Lower Back Pain": "back",
        "Shoulder Injury": "shoulder",
        "Ankle Sprain":    "ankle",
        "Hip Pain":        "hip",
        "Neck Pain":       "neck",
    }
    return mapping.get(injury_type, None)