# KinetiqAI
### AI-Powered Personalized Physiotherapy Recovery System

KinetiqAI is an intelligent physiotherapy recovery platform that helps users recover from common injuries through **personalized exercise plans, daily feedback adaptation, AI-assisted guidance, and gamified motivation**.

Built for smarter rehabilitation, the system adjusts recovery plans based on:
- injury type
- pain level
- activity level
- progress history
- recurring injury severity

---

## 🚀 Overview

KinetiqAI is designed to make physiotherapy more **accessible, adaptive, and engaging**.

Instead of static recovery plans, the platform creates **dynamic, personalized exercise programs** that evolve based on the user’s daily progress and pain feedback.

It combines:
- **AI-assisted exercise planning**
- **progress tracking**
- **daily adaptation**
- **gamification**
- **chatbot support**

---

## ✨ Key Features

### 🧠 Personalized Recovery Plans
Generates custom physiotherapy exercise plans based on:
- Age
- Injury Type
- Pain Level
- Activity Level

### 🔄 Adaptive Daily Feedback System
Recovery plans are updated based on user feedback such as:
- Pain level after exercises
- Completion percentage
- Difficulty rating

### 🏥 Injury-Specific Rehabilitation
Supports multiple common injury categories:
- Knee Pain
- Lower Back Pain
- Shoulder Injury
- Ankle Sprain
- Hip Pain
- Neck Pain

### 📈 Progressive Recovery Logic
The system tracks repeated injury cycles and reduces intensity appropriately for safer rehabilitation.

### 🎮 Gamification Layer
Keeps users motivated through:
- XP system
- Recovery levels
- Streaks
- Achievement badges

### 💬 AI Recovery Assistant
Includes a chatbot for recovery-related support and guidance.

### 🗃️ Database-Driven Progress Tracking
Stores:
- user accounts
- patient profiles
- exercise plans
- daily logs
- gamification progress

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Framer Motion
- Chart.js
- Lucide React

### Backend
- Python
- Flask
- SQLite

---

## 📂 Project Structure

```bash
KinetiqAI/
│
├── backend/
│   ├── app.py
│   ├── chatbot.py
│   ├── gamification.py
│   ├── plan_generator.py
│   ├── schema.sql
│   ├── requirements.txt
│   └── physioai.db
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── index.html
│   └── tsconfig.json
│
└── README.md
```
---

## ⚙️ How It Works

### 1. User Registration & Login
Users can create an account and securely log in.

### 2. Profile Setup
Users enter:
- age
- injury type
- pain level
- activity level

### 3. Plan Generation
The backend creates a personalized recovery plan using rule-based logic.

### 4. Daily Progress Logging
Users submit feedback after sessions:
- pain level
- completion percentage
- difficulty

### 5. Plan Adaptation
The system modifies the next plan based on recovery performance.

### 6. Gamified Motivation
Users earn XP, levels, streaks, and badges as they progress.

---

## 🧠 Recovery Logic

KinetiqAI uses rule-based adaptive physiotherapy logic.

### Pain-Based Filtering
- **High pain (7–10):** only beginner-safe exercises
- **Medium pain (4–6):** low to moderate difficulty
- **Low pain (1–3):** broader progression based on activity level

### Recurring Injury Handling
If a user recovers and later restarts the same injury:
- intensity is reduced
- only beginner-safe movements are prioritized
- progression becomes more cautious

### Volume Personalization
Exercise reps and sets are adjusted using:
- age
- pain severity
- activity level
- recovery cycle

---

## 🎮 Gamification System

The app includes a motivational recovery layer with:

### XP Rewards
Users earn XP based on session completion.

### Levels
Progression stages include:
- Beginner
- Recovering
- Improving
- Strong
- Fully Fit

### Badges
Example achievements:
- First Step
- Hat Trick
- Week Warrior
- Century
- Legend

### Streak Tracking
Encourages consistent daily rehabilitation.

---

## 🧪 Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sham1616/KinetiqAI.git
cd KinetiqAI
```

2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```
The Flask backend will run locally.

3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start using Vite.

📡 API Highlights

Some core backend endpoints include:

Authentication
```bash
POST /api/register
POST /api/login
Profile & Plan
POST /api/profile
GET /api/profile/<user_id>
```
Feedback & Recovery Tracking
daily plan adaptation
progress logging
injury recovery cycle tracking
### Feedback & Recovery Tracking
- daily plan adaptation
- progress logging
- injury recovery cycle tracking

---

## 🔒 Notes

- This project is a prototype / educational healthcare-tech solution
- It is not a replacement for licensed physiotherapy or medical diagnosis
- User passwords are currently stored in a basic format for development and should be hashed before production deployment

---

## 📌 Future Improvements

- AI-powered posture/form detection
- video-based exercise feedback
- wearable sensor integration
- doctor/physiotherapist dashboard
- secure authentication with JWT
- cloud deployment
- advanced patient analytics
