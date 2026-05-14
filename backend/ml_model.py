"""
PhysioAI - ML/DL Prediction Engine
====================================
Three-model ensemble that predicts exercise plan parameters from patient features:

  1. RandomForestClassifier     → max_difficulty  (1=Beginner, 2=Intermediate, 3=Advanced)
  2. GradientBoostingRegressor  → volume_multiplier (how much to scale reps/sets)
  3. MLPClassifier (Neural Net) → max_exercises   (3 = conservative, 5 = standard)

Models are trained ONCE on synthetic clinical data and saved to disk.
On subsequent server restarts they are loaded instantly from disk.
"""

import os
import json
import pickle
import numpy as np

from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error

# ─── Paths ──────────────────────────────────────────────────────────────────────
_DIR = os.path.dirname(__file__)
MODEL_PATH   = os.path.join(_DIR, "physioai_ml_models.pkl")
METRICS_PATH = os.path.join(_DIR, "physioai_ml_metrics.json")

# ─── Encoding Maps ──────────────────────────────────────────────────────────────
ACTIVITY_ENC  = {"low": 0, "medium": 1, "high": 2}
INJURY_ENC    = {
    "Knee Pain": 0, "Lower Back Pain": 1, "Shoulder Injury": 2,
    "Ankle Sprain": 3, "Hip Pain": 4, "Neck Pain": 5,
}


# ─── Synthetic Data Generator ───────────────────────────────────────────────────

def _generate_samples(n: int = 4000, seed: int = 42) -> tuple:
    """
    Generate n synthetic patient records with clinically grounded labels.
    ~15 % of labels have slight noise to teach the models robustness.
    
    Features (X): [age, pain_level, activity_enc, injury_enc, grade]
    Targets:
        y_diff  – max_difficulty  {1, 2, 3}
        y_vol   – volume_multiplier (float)
        y_exs   – max_exercises    {3, 5}
    """
    rng = np.random.default_rng(seed)

    age          = rng.integers(18, 81, n).astype(float)
    pain         = rng.integers(1, 11, n).astype(float)
    activity_enc = rng.integers(0, 3, n)   # 0=low, 1=medium, 2=high
    injury_enc   = rng.integers(0, 6, n)
    grade        = rng.integers(1, 4, n)   # 1/2/3

    y_diff = np.ones(n, dtype=int)
    y_vol  = np.ones(n, dtype=float)
    y_exs  = np.full(n, 5, dtype=int)

    for i in range(n):
        p, g, a, ag = pain[i], grade[i], activity_enc[i], age[i]

        # --- max_difficulty ---
        if g >= 2 or p >= 7:
            d = 1
        elif p >= 4:
            d = 2
        elif a == 0:           # low activity
            d = 2
        else:
            d = 3
        y_diff[i] = d

        # --- volume_multiplier ---
        vol = 1.0
        vol *= {1: 1.0, 2: 0.7, 3: 0.5}.get(g, 1.0)
        if ag > 60:
            vol *= 0.7
        elif ag > 45:
            vol *= 0.85
        if a == 2:             # high activity
            vol *= 1.3
        elif a == 0:           # low activity
            vol *= 0.8
        if p >= 7:
            vol *= 0.6
        y_vol[i] = round(float(np.clip(vol, 0.25, 1.6)), 4)

        # --- max_exercises ---
        y_exs[i] = 3 if g >= 3 else 5

    # ── Add ~15 % controlled noise to make models generalise ──────────────────
    noise_idx = rng.choice(n, size=int(n * 0.15), replace=False)
    y_diff[noise_idx] = np.clip(
        y_diff[noise_idx] + rng.integers(-1, 2, len(noise_idx)), 1, 3
    )
    y_vol[noise_idx] = np.clip(
        y_vol[noise_idx] + rng.uniform(-0.1, 0.1, len(noise_idx)), 0.25, 1.6
    )
    y_exs[noise_idx] = rng.choice([3, 5], len(noise_idx))

    X = np.column_stack([age, pain, activity_enc, injury_enc, grade])
    return X, y_diff, y_vol, y_exs


# ─── Model Training ─────────────────────────────────────────────────────────────

def train_and_save() -> dict:
    """
    Train all three models, save them to disk, and return accuracy metrics.
    Called only when no saved models are found.
    """
    print("[ML] Training PhysioAI models on synthetic clinical dataset …")
    X, y_diff, y_vol, y_exs = _generate_samples(n=5000)

    (X_tr, X_te,
     yd_tr, yd_te,
     yv_tr, yv_te,
     ye_tr, ye_te) = train_test_split(
        X, y_diff, y_vol, y_exs, test_size=0.2, random_state=42
    )

    # ── Model 1: Random Forest Classifier → max_difficulty ──────────────────
    rf = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ))
    ])
    rf.fit(X_tr, yd_tr)
    diff_acc = accuracy_score(yd_te, rf.predict(X_te))
    print(f"[ML] RandomForest  (max_difficulty)    accuracy : {diff_acc:.3f}")

    # ── Model 2: Gradient Boosting Regressor → volume_multiplier ────────────
    gb = Pipeline([
        ("scaler", StandardScaler()),
        ("reg", GradientBoostingRegressor(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42
        ))
    ])
    gb.fit(X_tr, yv_tr)
    vol_mae = mean_absolute_error(yv_te, gb.predict(X_te))
    print(f"[ML] GradBoost     (volume_multiplier) MAE      : {vol_mae:.4f}")

    # ── Model 3: MLP Neural Network → max_exercises ──────────────────────────
    mlp = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", MLPClassifier(
            hidden_layer_sizes=(64, 32, 16),
            activation="relu",
            solver="adam",
            learning_rate_init=0.001,
            max_iter=500,
            early_stopping=True,
            validation_fraction=0.15,
            random_state=42
        ))
    ])
    mlp.fit(X_tr, ye_tr)
    exs_acc = accuracy_score(ye_te, mlp.predict(X_te))
    print(f"[ML] MLP NeuralNet (max_exercises)     accuracy : {exs_acc:.3f}")

    # ── Persist ───────────────────────────────────────────────────────────────
    bundle = {"rf_difficulty": rf, "gb_volume": gb, "mlp_exercises": mlp}
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(bundle, f)

    metrics = {
        "rf_difficulty_accuracy":  round(diff_acc, 4),
        "gb_volume_mae":           round(vol_mae,  4),
        "mlp_exercises_accuracy":  round(exs_acc,  4),
        "training_samples":        5000,
        "models": [
            "RandomForestClassifier (n_estimators=200)",
            "GradientBoostingRegressor (n_estimators=200)",
            "MLPClassifier (64-32-16 ReLU)"
        ]
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[ML] Models saved to {MODEL_PATH}")
    return metrics


# ─── Model Loading (Singleton) ──────────────────────────────────────────────────

_models = None   # module-level cache

def _load_models() -> dict:
    global _models
    if _models is not None:
        return _models
    if os.path.exists(MODEL_PATH):
        print("[ML] Loading saved PhysioAI models from disk …")
        with open(MODEL_PATH, "rb") as f:
            _models = pickle.load(f)
        print("[ML] Models loaded successfully.")
    else:
        train_and_save()
        with open(MODEL_PATH, "rb") as f:
            _models = pickle.load(f)
    return _models


# ─── Public Prediction API ──────────────────────────────────────────────────────

def predict_plan_params(
    age: int,
    pain_level: int,
    activity_level: str,
    injury_type: str,
    grade: int
) -> dict:
    """
    Run the three ML/DL models and return plan parameters.

    Returns
    -------
    {
        "max_difficulty":     int   (1-3),
        "volume_multiplier":  float (0.25-1.6),
        "max_exercises":      int   (3 or 5),
        "confidence":         dict  (per-model probabilities where available),
        "models_used":        list[str]
    }
    """
    models = _load_models()

    activity_enc = ACTIVITY_ENC.get(str(activity_level).lower(), 1)
    injury_enc   = INJURY_ENC.get(injury_type, 0)
    grade        = int(np.clip(grade, 1, 3))

    X = np.array([[age, pain_level, activity_enc, injury_enc, grade]], dtype=float)

    # ── Model 1: Random Forest → max_difficulty ──────────────────────────────
    diff_pred   = int(models["rf_difficulty"].predict(X)[0])
    diff_proba  = models["rf_difficulty"].predict_proba(X)[0]
    diff_conf   = round(float(np.max(diff_proba)), 3)

    # ── Model 2: Gradient Boosting → volume_multiplier ───────────────────────
    vol_pred = float(np.clip(models["gb_volume"].predict(X)[0], 0.25, 1.6))

    # ── Model 3: MLP Neural Net → max_exercises ───────────────────────────────
    exs_pred  = int(models["mlp_exercises"].predict(X)[0])
    exs_proba = models["mlp_exercises"].predict_proba(X)[0]
    exs_conf  = round(float(np.max(exs_proba)), 3)

    return {
        "max_difficulty":    diff_pred,
        "volume_multiplier": round(vol_pred, 3),
        "max_exercises":     exs_pred,
        "confidence": {
            "difficulty_confidence": diff_conf,
            "exercises_confidence":  exs_conf,
        },
        "models_used": [
            "RandomForestClassifier",
            "GradientBoostingRegressor",
            "MLPClassifier (Neural Net)"
        ]
    }


def get_model_metrics() -> dict:
    """Return the last saved training metrics (accuracy / MAE)."""
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            return json.load(f)
    return {}


def retrain():
    """Force a full retrain (call this if clinical rules change)."""
    global _models
    _models = None
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    return train_and_save()


# ─── Warm-up on import ──────────────────────────────────────────────────────────
# Trains or loads models when the module is first imported so the first
# API request is not slowed down.
try:
    _load_models()
except Exception as _e:
    print(f"[ML] Warm-up failed: {_e} — models will train on first request.")
