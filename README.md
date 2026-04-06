# KinetiqAI
AI-Powered Personalized Physiotherapy System

KinetiqAI
AI-Powered Personalized Physiotherapy Recovery System
Show Image
Show Image
Show Image
Show Image
Show Image
Smarter rehabilitation through adaptive AI — personalized exercise plans that evolve with your recovery.
</div>

Table of Contents

Overview
Key Features
Tech Stack
Project Structure
Getting Started
API Reference
Recovery Logic
Gamification System
Roadmap
Disclaimer
License


Overview
KinetiqAI is an intelligent physiotherapy recovery platform designed to make rehabilitation more accessible, adaptive, and engaging. Unlike static recovery programs, KinetiqAI generates dynamic, personalized exercise plans that continuously evolve based on each user's daily progress and pain feedback.
The platform combines AI-assisted exercise planning, real-time progress tracking, adaptive daily feedback, and a gamification layer — all powered by a rule-based rehabilitation engine tailored to the user's injury profile.

Key Features

Personalized Recovery Plans
Generates custom physiotherapy programs based on age, injury type, current pain level, and activity level — ensuring each plan is medically appropriate and progressively challenging.

Adaptive Daily Feedback System
After every session, users submit feedback (pain level, completion rate, difficulty). The system automatically adjusts the next session's intensity and exercise selection accordingly.

Injury-Specific Rehabilitation
Supports six common injury categories

Progressive Recovery Logic
Tracks recurring injury cycles and intelligently reduces intensity for safer rehabilitation when a user re-injures the same area.

Gamification Layer
Keeps users engaged and consistent through XP rewards, recovery levels, daily streaks, and achievement badges.

AI Recovery Chatbot
An integrated assistant for answering recovery-related questions and providing real-time guidance throughout the rehabilitation journey.

Database-Driven Progress Tracking
Stores user accounts, patient profiles, exercise plans, daily session logs, and gamification progress in a structured relational database.

Project Structure
KinetiqAI/
│
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── chatbot.py              # AI recovery assistant
│   ├── gamification.py         # XP, levels, badges, streaks
│   ├── plan_generator.py       # Adaptive exercise plan logic
│   ├── schema.sql              # Database schema
│   ├── requirements.txt        # Python dependencies
│   └── physioai.db             # SQLite database
│
├── frontend/
│   ├── src/                    # React source files
│   ├── package.json
│   ├── index.html
│   └── tsconfig.json
│
└── README.md



Getting Started
Prerequisites

Python 3.10+
Node.js 18+
npm

1. Clone the Repository

git clone https://github.com/Sham1616/KinetiqAI.git
cd KinetiqAI

2. Backend Setup

cd backend
pip install -r requirements.txt
python app.py
The Flask backend will start on http://localhost:5000.

3. Frontend Setup

Open a new terminal:
cd frontend
npm install
npm run dev
The frontend will start via Vite on http://localhost:5173.

Gamification System
KinetiqAI includes a motivational layer to support consistent rehabilitation:
XP & Levels
Users earn XP for each completed session. As XP accumulates, they progress through recovery stages:
Beginner → Recovering → Improving → Strong → Fully Fit
Streak Tracking
Daily streaks are tracked to encourage consistent rehabilitation habits.

Roadmap
Planned features for future development:

 AI-powered posture and form detection via camera
 Video-based exercise feedback
 Wearable sensor integration
 Physiotherapist / doctor dashboard
 JWT-based secure authentication
 Cloud deployment (AWS / GCP)
 Advanced patient analytics and reporting


Disclaimer
KinetiqAI is a prototype and educational healthcare-tech solution. It is not a substitute for licensed physiotherapy, medical diagnosis, or professional clinical advice. 
