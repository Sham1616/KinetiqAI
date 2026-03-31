"""
PhysioAI - AI Chatbot Physiotherapist
Integrates with Anthropic Claude API for intelligent responses.
Falls back to rule-based responses if API unavailable.
"""

import os
import json

# Try importing the Anthropic library
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


SYSTEM_PROMPT = """You are PhysioBot, an empathetic and knowledgeable AI physiotherapist assistant.
Your role is to:
1. Answer questions about exercises, recovery, and physiotherapy
2. Provide motivation and encouragement
3. Suggest safe modifications to exercises
4. Explain pain management strategies
5. Track patient progress and celebrate milestones

Patient context will be provided when available. Always:
- Be warm, encouraging, and supportive
- Prioritize patient safety — if pain is severe, recommend seeing a doctor
- Give specific, actionable advice
- Keep responses concise (2-4 sentences usually)
- Use simple language, not medical jargon

IMPORTANT: You are an AI assistant, not a replacement for professional medical care.
Always mention seeing a healthcare provider for serious concerns."""


# ─── Rule-based fallback responses ────────────────────────────────────────────

FALLBACK_RESPONSES = {
    "pain": [
        "If you're experiencing increased pain, it's important to rest and reduce intensity. Apply ice for 15-20 minutes and avoid exercises that worsen the pain. If pain persists beyond 48 hours, consult your physiotherapist.",
        "Pain during recovery is normal, but sharp or severe pain is a signal to stop. Try reducing your reps by 30% and focus on gentle range-of-motion exercises today. 💪",
    ],
    "exercise": [
        "Great question! For best results, perform exercises slowly and with control — quality beats quantity every time. Make sure to warm up for 5 minutes before starting your plan.",
        "Remember to breathe steadily during exercises — exhale on exertion and inhale on the return. This helps with stability and oxygen flow to muscles. 🌬️",
    ],
    "motivation": [
        "You're doing amazing! Recovery is a journey, not a race. Every small effort compounds into huge progress over time. Keep going — your future self will thank you! 🌟",
        "Progress isn't always linear, and that's completely okay! Some days feel harder, but showing up consistently is what drives recovery. You've got this! 💪",
    ],
    "streak": [
        "Your consistency is your superpower! Streaks like yours build neural pathways that make movement easier and more natural. Keep that fire going! 🔥",
    ],
    "default": [
        "That's a great question! Based on your recovery plan, focus on completing your daily exercises consistently. Consistency is the most powerful tool in physiotherapy.",
        "I'm here to support your recovery journey! For personalized advice, complete your daily exercises and feedback — your plan adapts based on how you're feeling.",
        "Remember: recovery happens in the rest periods too! Make sure you're sleeping well, staying hydrated, and eating enough protein to support tissue repair. 🥗",
    ]
}


def get_chat_response(message: str, history: list, patient_context: dict) -> str:
    """
    Get a response from the AI chatbot.
    Tries Anthropic API first, falls back to rule-based responses.
    """
    # Try Anthropic API
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if ANTHROPIC_AVAILABLE and api_key:
        try:
            return _get_llm_response(message, history, patient_context, api_key)
        except Exception as e:
            print(f"⚠️  LLM API error: {e}. Using fallback.")

    # Fallback to rule-based
    return _get_fallback_response(message, patient_context)


def _get_llm_response(message: str, history: list, patient_context: dict, api_key: str) -> str:
    """Call the Anthropic Claude API."""
    client = anthropic.Anthropic(api_key=api_key)

    # Build context string
    context_str = ""
    if patient_context:
        context_str = f"""
Current patient context:
- Age: {patient_context.get('age', 'unknown')}
- Injury: {patient_context.get('injury_type', 'unknown')}
- Current pain level: {patient_context.get('pain_level', 'unknown')}/10
- Activity level: {patient_context.get('activity_level', 'unknown')}
"""

    # Build message history for API
    messages = []
    for msg in history[-10:]:  # Last 10 messages for context
        if msg.get("role") in ["user", "assistant"]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=SYSTEM_PROMPT + context_str,
        messages=messages
    )

    return response.content[0].text


def _get_fallback_response(message: str, patient_context: dict) -> str:
    """Rule-based fallback chatbot response."""
    import random
    message_lower = message.lower()

    # Keyword matching
    if any(w in message_lower for w in ["pain", "hurt", "ache", "sore"]):
        responses = FALLBACK_RESPONSES["pain"]
    elif any(w in message_lower for w in ["exercise", "workout", "movement", "stretch"]):
        responses = FALLBACK_RESPONSES["exercise"]
    elif any(w in message_lower for w in ["motivat", "tired", "give up", "hard", "difficult", "struggle"]):
        responses = FALLBACK_RESPONSES["motivation"]
    elif any(w in message_lower for w in ["streak", "badge", "xp", "level", "points"]):
        responses = FALLBACK_RESPONSES["streak"]
    else:
        responses = FALLBACK_RESPONSES["default"]

    response = random.choice(responses)

    # Personalize if we have context
    if patient_context.get("injury_type"):
        response += f" (Tip: Your {patient_context['injury_type'].lower()} recovery is progressing — keep it up!)"

    return response