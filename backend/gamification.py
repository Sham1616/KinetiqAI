"""
PhysioAI - Gamification System
XP, levels, streaks, and badges.
"""

# ─── XP Rules ──────────────────────────────────────────────────────────────────
XP_PER_EXERCISE = 10
XP_FULL_DAY = 50   # Bonus for 100% completion
XP_STREAK_BONUS = 20  # Bonus per streak milestone


def calculate_xp(completion_pct: int) -> int:
    """
    Calculate XP earned from a session.
    - Each exercise (~20% of plan) = 10 XP
    - 100% completion = +50 bonus XP
    """
    completion_pct = int(completion_pct)
    base_xp = int((completion_pct / 100) * 5) * XP_PER_EXERCISE  # ~5 exercises per plan
    bonus_xp = XP_FULL_DAY if completion_pct == 100 else 0
    return base_xp + bonus_xp


# ─── Levels ────────────────────────────────────────────────────────────────────
LEVELS = [
    (0,    "Beginner",    "sprout"),
    (100,  "Recovering",  "refresh-cw"),
    (300,  "Improving",   "trending-up"),
    (600,  "Strong",      "dumbbell"),
    (1000, "Fully Fit",   "trophy"),
]


def get_level(xp: int) -> str:
    """Return current level name based on XP."""
    level_name = "Beginner"
    for threshold, name, _ in LEVELS:
        if xp >= threshold:
            level_name = name
    return level_name


def get_level_info(xp: int) -> dict:
    """Return full level info including next milestone."""
    current_level = LEVELS[0]
    next_level = None

    for i, level in enumerate(LEVELS):
        if xp >= level[0]:
            current_level = level
            next_level = LEVELS[i + 1] if i + 1 < len(LEVELS) else None

    progress_pct = 100
    if next_level:
        span = next_level[0] - current_level[0]
        earned = xp - current_level[0]
        progress_pct = min(100, int((earned / span) * 100))

    return {
        "name": current_level[1],
        "icon_id": current_level[2],
        "threshold": current_level[0],
        "next_threshold": next_level[0] if next_level else None,
        "next_name": next_level[1] if next_level else "Max Level",
        "progress_pct": progress_pct,
    }


# ─── Badges ────────────────────────────────────────────────────────────────────
BADGE_DEFINITIONS = [
    {"id": "first_session", "name": "First Step", "icon_id": "footprints", "description": "Completed your first session", "xp_required": 10},
    {"id": "streak_3",      "name": "Hat Trick",  "icon_id": "target", "description": "3-day streak",              "streak_required": 3},
    {"id": "streak_7",      "name": "Week Warrior","icon_id": "shield", "description": "7-day streak",              "streak_required": 7},
    {"id": "xp_100",        "name": "Century",    "icon_id": "star", "description": "Earned 100 XP",             "xp_required": 100},
    {"id": "xp_500",        "name": "Powerhouse", "icon_id": "zap", "description": "Earned 500 XP",             "xp_required": 500},
    {"id": "xp_1000",       "name": "Legend",     "icon_id": "crown", "description": "Earned 1000 XP",            "xp_required": 1000},
    {"id": "full_day",      "name": "Perfectionist","icon_id": "check", "description": "100% completion in a day",  "xp_required": 50},
    {"id": "streak_14",     "name": "Iron Will",  "icon_id": "activity", "description": "14-day streak",             "streak_required": 14},
]


def check_badges(xp: int, streak: int) -> list:
    """Return list of earned badge IDs."""
    earned = []
    for badge in BADGE_DEFINITIONS:
        xp_req = badge.get("xp_required", 0)
        streak_req = badge.get("streak_required", 0)
        if xp >= xp_req and streak >= streak_req:
            earned.append(badge["id"])
    return earned


def get_all_badges_with_status(earned_badge_ids: list) -> list:
    """Return all badges with earned status."""
    result = []
    for badge in BADGE_DEFINITIONS:
        b = badge.copy()
        b["earned"] = badge["id"] in earned_badge_ids
        result.append(b)
    return result