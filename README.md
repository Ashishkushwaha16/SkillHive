# SkillHive

SkillHive is a full-stack learning and collaboration platform with real-time messaging, profile management, and an AI support assistant.

## Features

- Secure authentication with JWT
- User profiles and skill-based discovery
- Real-time messaging with Socket.io
- Notifications and feedback flows
- AI Assistant with RAG-based answers (ChatGPT or Gemini)
- AI Search Engine mode for knowledge-base-only support
- Admin-managed quick issue prompts for AI Search

## Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Socket.io Client

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication and role-based authorization
- Socket.io

### AI Service

- Python
- Flask + Flask-CORS
- SentenceTransformers + FAISS
- OpenAI and Google Gemini SDKs

## Project Structure

```text
SkillHive/
|-- client/
|-- server/
|-- knowledge_base/
|-- app.py
|-- server.py
|-- requirements.txt
`-- .env.example
```

## Environment Setup

Copy one template and update it with real values:

```powershell
Copy-Item .env.example .env
```

Required variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `REACT_APP_API_BASE_URL`
- `REACT_APP_AI_ASSISTANT_URL`
- `AI_PROVIDER` (`chatgpt`, `gemini`, or `ai-search`)
- `AI_ASSISTANT_PORT`
- `AI_SEARCH_QUICK_ISSUES_FILE`
- `OPENAI_API_KEY` when using ChatGPT
- `GEMINI_API_KEY` when using Gemini

If you want retrieval-only support without external provider keys, set `AI_PROVIDER=ai-search`.

## Install Dependencies

```bash
npm --prefix server install
npm --prefix client install
python -m pip install -r requirements.txt
```

## Run Locally

```bash
# Node backend
npm --prefix server run dev
```

```bash
# React frontend
npm --prefix client start
```

```bash
# Python AI server
python server.py
```

Default ports:

- Backend API: `5000`
- Frontend: `3000`
- AI assistant API: `5050`

## API Overview

### Node backend

- `GET /health`
- `GET /`
- `/api/auth`
- `/api/users`
- `/api/chat`
- `/api/messages`
- `/api/notifications`
- `/api/posts`
- `/api/feedback`
- `/api/calls`
- `/api/ai-search-config`

### Python AI API

- `POST /chat`
- `GET /health`
- `GET /chat-config`

### Admin AI Search configuration

- `GET /api/ai-search-config/quick-issues`
- `PUT /api/ai-search-config/quick-issues`

## Validation Commands

```bash
npm --prefix server test
npm --prefix client run build
python -m py_compile app.py server.py
python scripts/probe_ai_providers.py
```

## Notes

- Keep `.env` values real and do not commit secrets.
- Runtime-generated files are ignored by git.
- Quick issue prompts are configured from `knowledge_base/ai_search_quick_issues.json`.

## Release Checklist

- Ensure Node API health endpoint returns `200` on production host.
- Ensure AI API health endpoint returns `200` on production host.
- Verify CORS origin is restricted to the real frontend domain.
- Verify `JWT_SECRET` is long and random.
- Verify database connection uses production credentials.
- Verify `AI_PROVIDER` is intentionally set (`chatgpt`, `gemini`, or `ai-search`).
- Verify provider keys are present only for enabled providers.
- Run backend tests: `npm --prefix server test`.
- Run frontend production build: `npm --prefix client run build`.
- Run Python syntax checks: `python -m py_compile app.py server.py`.
- Smoke test AI chat flow with both `/health` and `/chat` endpoints.
