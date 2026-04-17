<div align="center">

# 🏥 MediBot - AI Medical Assistant

### Enterprise-Grade Healthcare Chatbot powered by Multi-Model AI

[![Live Demo](https://img.shields.io/badge/Live-Demo-00D4AA?style=for-the-badge&logo=vercel)](https://medibot-gamma.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**MediBot is a production-ready AI medical chatbot that uses 6 AI models, supports 31+ languages, and features voice input/output, patient memory, medical study mode, and a FAANG-ready architecture.**

[Live Demo](https://medibot-gamma.vercel.app) • [Installation Guide](INSTALLATION.md) • [API Documentation](API_DOCS.md) • [Architecture](ARCHITECTURE.md)

</div>

---

## ✨ Key Features

### 🤖 Multi-Model AI Architecture
- **6 AI Models** intelligently routed based on query complexity
- **Intent & Complexity Classifier** — AI-powered query understanding
- **3-Path Routing System** — Instant (greetings), Fast (symptoms), Slow (complex medical)
- **Response Validator** — AI validates responses before sending, auto-retries with stronger model if needed

### 🧠 Intelligent Processing
- **Conversation Engine** — Detects user tone (scared, urgent, confused, calm) and adapts response style
- **Safety Filter** — GPT-OSS Safeguard 20B ensures safe, appropriate responses
- **API Gateway** — Rate limiting (15 req/min), PII filtering, request validation
- **Medical Study Mode** — Textbook-level explanations for medical students

### 🌍 Language Support
- **31+ Languages** — Hindi, Bengali, Tamil, Telugu, Arabic, Spanish, French, German, and more
- **Indian Language Specialization** — Hinglish, Banglish, Tamilish (romanized) support
- **Language Isolation** — Responds only in the user's language, never mixes

### 🎤 Voice Support
- **Speech-to-Text** — Tap mic to speak symptoms (Web Speech API)
- **Text-to-Speech** — AI reads responses aloud
- **Multilingual Voice** — Hindi, Bengali, Arabic voice support
- **Zero Server Load** — All voice processing happens in browser

### 💾 Memory System
- **Short-term Memory** — Remembers symptoms, conditions, allergies during session
- **Long-term Memory** — MongoDB Atlas stores patient profiles permanently
- **Feedback Learning** — Learns from thumbs up/down ratings to improve responses
- **RAG Knowledge Expansion** — Stores and retrieves expanded medical knowledge

### 🛡️ Safety & Reliability
- **WHO Guidelines** — 32 medical topics from WHO integrated via RAG
- **Emergency Detection** — Immediately identifies emergencies and guides to call 112
- **PII Filtering** — Detects and suppresses logging of phone numbers and emails
- **Fallback Chain** — Auto-retries with stronger model if primary fails

### 🎨 Modern UI/UX
- **Glassmorphism Design** — Premium dark theme with frosted glass effects
- **Mobile Responsive** — Optimized for all screen sizes
- **Voice Toggle** — Enable/disable voice responses
- **Symptom Checker Form** — Structured symptom input with severity slider
- **Feedback Buttons** — Rate every response for continuous improvement

---

## 🏗️ Architecture
User Input (Text/Voice)
↓
┌─────────────────────┐
│   API Gateway       │  Rate Limiting + PII Filter
└─────────────────────┘
↓
┌─────────────────────┐
│ Conversation Engine │  Tone Detection + Style Adaptation
└─────────────────────┘
↓
┌─────────────────────┐
│ Intent Classifier   │  LLaMA 3.1 8B (AI-powered)
└─────────────────────┘
↓
┌─────────┬───────────┬──────────┐
│⚡INSTANT │ 🏥 FAST    │ 🧠 SLOW   │
│Greetings│ Symptoms  │ Complex  │
│1 call   │ 3 calls   │ 4 calls  │
│LLaMA 8B │ LLaMA 70B │ GPT-OSS  │
│         │ Qwen3 32B │ 120B     │
│         │+Light RAG │+Full RAG │
└─────────┴───────────┴──────────┘
↓
┌─────────────────────┐
│  Response Validator │  Confidence Check + Auto-Retry
└─────────────────────┘
↓
┌─────────────────────┐
│   Safety Layer      │  GPT-OSS Safeguard 20B
└─────────────────────┘
↓
Final Response
(Text + Voice)
---

## 🤖 AI Models Used

| Model | Purpose | Path |
|-------|---------|------|
| **LLaMA 3.1 8B Instant** | Greetings, general queries, intent classification | ⚡ Instant/Fast |
| **LLaMA 3.3 70B Versatile** | Symptoms, medication questions, mental health | 🏥 Fast |
| **Qwen3 32B** | Hindi, Bengali, multilingual responses | 🏥 Fast |
| **GPT-OSS 120B** | Complex medical, emergencies, study mode | 🧠 Slow |
| **GPT-OSS Safeguard 20B** | Safety classification | 🛡️ Safety |
| **LLaMA 3.1 8B** | Tone detection, response validation | 🎯 Internal |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Ritwik9999/MEDIBOT.git
cd MEDIBOT

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start backend
node server.js

# Start frontend (in new terminal)
cd ..
npm start
```

See [INSTALLATION.md](INSTALLATION.md) for detailed setup guide.

---

## 🔑 Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq API key for AI models | [console.groq.com](https://console.groq.com) |
| `MONGODB_URI` | MongoDB Atlas connection string | [cloud.mongodb.com](https://cloud.mongodb.com) |

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Concurrent Users | 10-15 |
| Requests/min | ~30 |
| Greeting Response | < 1 second |
| Symptom Analysis | 2-3 seconds |
| Complex Medical | 3-5 seconds |
| Languages | 31+ |
| WHO Topics | 32 |
| Daily Users | 500-1000 |

---

## 🌍 Supported Languages

English, Hindi, Bengali, Tamil, Telugu, Gujarati, Malayalam, Punjabi, Odia, Kannada, Urdu, Arabic, Chinese, Japanese, Korean, Thai, Russian, Greek, Hebrew, Spanish, French, German, Portuguese, Italian, Dutch, Turkish, Indonesian, Vietnamese, Swahili, Hinglish, Banglish, Tamilish

---

## 📱 Screenshots

### Desktop View
*Glassmorphism dark theme with 3-column layout*

### Mobile View
*Fully responsive with bottom navigation*

### Landing Page
*Modern glass-effect landing with feature badges*

### Study Mode
*Detailed medical explanations for students*

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React.js |
| Backend | Node.js + Express |
| AI Provider | Groq (free tier) |
| Database | MongoDB Atlas (free) |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |
| Voice | Web Speech API |
| RAG | WHO Guidelines JSON |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For support, email ritwikmal8@gmail.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ by Ritwik Mal**

⭐ Star this repo if you find it useful!

</div>