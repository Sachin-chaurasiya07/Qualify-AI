An AI-powered mock interview platform that analyzes your resume, generates role-specific interview questions, evaluates your answers in real-time, and delivers detailed performance reports — all in one place.

Live Link : [qualify-ai-client.onrender.com/](https://qualify-ai-client.onrender.com/)

## ✨ Features

- **Resume Analysis** — Upload your PDF resume; AI extracts your role, skills, experience, and projects automatically
- **Smart Question Generation** — Generates tailored interview questions based on your resume and selected mode (HR or Technical)
- **Real-Time AI Evaluation** — Each answer is scored on correctness, confidence, and communication
- **Detailed Reports** — Post-interview performance breakdown with charts, per-question feedback, and downloadable PDF reports
- **Interview History** — Browse and revisit all past interview sessions
- **Credit System** — Users start with free credits; additional credits purchasable via Razorpay
- **Google OAuth** — One-click sign-in via Firebase Authentication

---

## 🛠️ Tech Stack

| Layer | Technology |

| Frontend | React 19, Vite, Tailwind CSS v4, Redux Toolkit |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| AI | OpenRouter API (Nvidia Nemotron 120B) |
| Auth | Firebase (Google OAuth) + JWT |
| Payments | Razorpay |
| PDF Parsing | pdfjs-dist |
| Charts | Recharts |
| Animations | Motion (Framer Motion) |

---

## 📁 Project Structure

```
qualify-ai/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Home, Auth, InterviewPage, Pricing, History, Report
│       ├── components/      # Step1Setup, Step2Interview, Step3Report, Navbar, etc.
│       ├── redux/           # Global state (user slice)
│       └── utils/           # Firebase config
│
└── server/                  # Node.js + Express backend
    ├── controllers/         # auth, interview, payment, user
    ├── models/              # User, Interview (MongoDB schemas)
    ├── routes/              # REST API routes
    ├── middleware/           # JWT auth, Multer file upload
    ├── services/            # OpenRouter AI, Razorpay
    └── config/              # DB connection, token utils
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenRouter API key
- Firebase project (Google OAuth enabled)
- Razorpay account (for payments)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/qualify-ai.git
cd qualify-ai
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

```bash
npm run dev
```

### 3. Setup the Client

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

```bash
npm run dev
```

Client runs at `http://localhost:5173`

---

## 📸 Interview Flow

```
Upload Resume (or Role and Experience) →  AI Extracts Skills/Role
       ↓
Select Mode (HR / Technical) + Experience Level
       ↓
AI Generates Questions with Time Limits
       ↓
Answer Questions (with live timer)
       ↓
AI Evaluates: Score + Confidence + Communication + Feedback
       ↓
Detailed Report with Charts + PDF Export
```
