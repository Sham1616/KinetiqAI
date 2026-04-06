"""
KinetiqAI - AI Chatbot Physiotherapist
Integrates with Google Gemini API using frontend-provided API token for a lively engine.
"""

import json

import urllib.request
import urllib.error


SYSTEM_PROMPT = """You are KinetiqBot, an empathetic and professional AI physiotherapist assistant for the KinetiqAI platform.
Guidelines:
1. BALANCE: Keep responses concise but warm and supportive. Avoid the previous 'hyper-minimal' one-word style.
2. LENGTH: Aim for 60-120 words for medical advice. Greetings should be 1-2 friendly sentences.
3. STRUCTURE: Use bold headers (e.g., **Key Instruction**) and clean newlines (\n) for readability.
4. VALUE: Briefly explain the clinical reason behind the advice to provide better support.
5. NO ASTERIKS: Do NOT use '*' for bullets. Rely on bolding and newlines for clarity.
"""

def get_chat_response(message: str, history: list, patient_context: dict, api_key: str):
    """
    Get a dynamic response using a model fallback chain.
    """
    # Hardcoded key for professional deployment
    api_key = api_key or "AIzaSyDVZurgxZ7EVNqxr72Ejlf_vNk6G2Vudco"
    
    # Prioritizing Gemini 2.5 Flash which was confirmed active in diagnostic check
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    endpoints = ["v1beta", "v1"]
    
    for model_name in models:
        for ep in endpoints:
            try:
                context_str = ""
                if patient_context:
                    context_str = f"[SYSTEM: Patient context - Age: {patient_context.get('age')}, Injury: {patient_context.get('injury_type')}, Pain Level: {patient_context.get('pain_level')}/10, Activity Profile: {patient_context.get('activity_level')}]\n"
                    
                contents = []
                for msg in history[-10:]:
                    role = "user" if msg.get("role") == "user" else "model"
                    contents.append({
                        "role": role,
                        "parts": [{"text": msg["content"]}]
                    })
                    
                final_message = f"[SYSTEM INSTRUCTION: {SYSTEM_PROMPT}]\n\n{context_str}\nPatient Message: {message}"
                contents.append({"role": "user", "parts": [{"text": final_message}]})
                
                url = f"https://generativelanguage.googleapis.com/{ep}/models/{model_name}:generateContent?key={api_key}"
                print(f"[AI] Sync: Calling {url}")
                
                payload = {
                    "contents": contents,
                    "safetySettings": [{"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}]
                }
                
                req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"}, method='POST')
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    return {"response": text.strip(), "status": "ok"}
                    
            except urllib.error.HTTPError as e:
                # If 404, it might just be the wrong endpoint/model combo, so continue
                if e.code == 404:
                    continue
                
                error_msg = e.read().decode('utf-8')
                # If 429 (Quota), try the next model in the chain as it may have separate quota
                if e.code == 429:
                    print(f"[AI] Quota exhausted for {model_name}. Attempting fallback...")
                    break # Break from endpoints loop to try next model
                
                if e.code in [400, 403]:
                     return {"response": "The Gemini API Key provided was invalid or lacks permissions.", "status": "needs_key"}
                return {"response": f"Sorry, my neural core encountered an HTTP error {e.code}: {error_msg}.", "status": "error"}
            except Exception as e:
                # Continue reaching through fallbacks on generic error
                continue
            
    return {"response": "None of the AI models (Flash, Pro, Legacy) were found in your region. Check Cloud Console permissions.", "status": "error"}