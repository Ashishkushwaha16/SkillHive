# SkillHive

Full-stack internship collaboration platform with:
- React frontend
- Node.js + Express backend
- MongoDB data layer
- Socket.io real-time chat/notifications
- Python RAG-based AI assistant (multi-provider)

## Project Overview

SkillHive is designed for intern-mentor workflows:
- authentication and profile management
- mentor discovery and communication
- real-time messages and notifications
- legal/help/support pages
- AI-powered support assistant using knowledge-base retrieval

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Socket.io client

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT auth + RBAC middleware
- Socket.io

### AI Assistant
- Python
- Flask API
- SentenceTransformers + FAISS (RAG retrieval)
- Multi-provider LLM routing

## Repository Structure

```text
SkillHive/
├── client/                     # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── config/
│   └── package.json
├── server/                     # Node.js API server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── app.py                      # AI assistant core (RAG + provider routing)
├── server.py                   # Flask server exposing /chat and /health
├── knowledge_base/             # .txt policy/guideline files used by RAG
├── requirements.txt            # Python dependencies
└── .env.example                # Environment variable template
```

## AI Provider Priority and Options

Configured provider priority:
1. ChatGPT (Primary)
2. Google Gemini
3. Grok
4. Perplexity
5. Claude

Also available in UI profiles:
- ChatGPT Codex
- GitHub Copilot
- Microsoft Copilot

Note: Codex/Copilot profiles are mapped to the ChatGPT-compatible provider route in the current implementation.

## Local Setup

### 1) Clone and install Node dependencies

```bash
# Root (optional helper script only)
npm install

# Backend
npm --prefix server install

# Frontend
npm --prefix client install
```

### 2) Configure environment variables

You can start from any of these templates:
- `.env.chatgpt.example` (quick start, ChatGPT-only)
- `.env.multi-ai.example` (all configured providers)
- `.env.production.example` (production-ready template)
- `.env.production.local.example` (hardened production template, ChatGPT-only active)
- `.env.example` (base template)

Copy one template to `.env` and then fill your actual secrets.

Windows PowerShell example:

```powershell
Copy-Item .env.chatgpt.example .env
```

Production template example:

```powershell
Copy-Item .env.production.example .env
```

Hardened production-local template example:

```powershell
Copy-Item .env.production.local.example .env
```

Minimum required backend env values:
- `MONGO_URI`
- `JWT_SECRET`
- `PORT` (Node API default 5000)
- `CLIENT_ORIGIN` (for CORS)

Minimum required AI env values:
- `AI_PROVIDER` (default chatgpt)
- API key for selected provider (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`, `PERPLEXITY_API_KEY`, `CLAUDE_APIKEY`)
- `AI_ASSISTANT_PORT` (default 5050)

### 3) Install Python dependencies

```bash
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### 4) Run services

Run each service in separate terminal:

```bash
# Node backend API (port 5000 by default)
npm --prefix server run dev
```

```bash
# React frontend (port 3000 by default)
npm --prefix client start
```

```bash
# Python AI assistant (port 5050 by default)
python server.py
```

## Runtime Endpoints

### Node Backend
- `GET /health`
- `GET /` (basic API info)
- `/api/auth`, `/api/users`, `/api/messages`, `/api/chat`, `/api/notifications`, `/api/posts`, `/api/feedback`, `/api/calls`

### AI Assistant
- `GET /health`
- `POST /chat`

Example request:

```json
{
    "message": "What is attendance policy?",
    "provider": "chatgpt"
}
```

## Key Features Implemented

- centralized request handling in frontend service layer
- session-expiry handling with visible auth notice
- legal/help/support pages with shared metadata
- multilingual AI responses (English/Hindi)
- provider-switching AI assistant UI
- fallback logging for unanswered AI queries into `admin_flagged_queries.json`

## Testing and Build

```bash
# Backend tests
npm --prefix server test
```

```bash
# Frontend production build
npm --prefix client run build
```

## Troubleshooting

### AI assistant not connecting
- Ensure Python server is running
- Check `REACT_APP_AI_ASSISTANT_URL` (should match AI port, default `http://localhost:5050`)
- Verify selected provider key exists in env

### Backend not starting
- Check `MONGO_URI` and `JWT_SECRET`
- Confirm MongoDB connectivity

### Session expired / not authorized
- Re-login and ensure token is refreshed
- Check backend JWT settings

## Notes

- Keep API keys out of source code.
- Prefer environment variables for all secrets.
- For production, run Flask behind a production WSGI server.
