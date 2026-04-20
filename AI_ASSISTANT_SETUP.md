# SkillHive AI Assistant Setup

This guide is aligned with the current SkillHive implementation.

## What Is Included

- RAG retrieval with SentenceTransformers + FAISS
- Flask assistant API in [server.py](server.py)
- Dual-provider routing in [app.py](app.py)
- Provider priority:
  1. ChatGPT
  2. Gemini

## Ports

- Node backend: 5000
- AI assistant: 5050
- React frontend: 3000

## 1) Prepare Environment

Use one template and copy to `.env`:

- `.env.chatgpt.example`
- `.env.multi-ai.example`
- `.env.production.example`
- `.env.production.local.example`

PowerShell example:

```powershell
Copy-Item .env.multi-ai.example .env
```

Then fill real secrets in `.env`.

Minimum AI keys (based on selected provider):

- `OPENAI_API_KEY` for `AI_PROVIDER=chatgpt`
- `GEMINI_API_KEY` for `AI_PROVIDER=gemini`

## 2) Install Dependencies

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 3) Start Services

Terminal 1 (Node backend):

```powershell
npm --prefix server run dev
```

Terminal 2 (AI assistant):

```powershell
venv\Scripts\Activate.ps1
python server.py
```

Terminal 3 (React frontend):

```powershell
npm --prefix client start
```

## 4) Verify Health

AI assistant health:

```powershell
Invoke-WebRequest -Uri "http://localhost:5050/health" -Method GET
```

Expected fields include:

- `status`
- `service`
- `defaultProvider`
- `availableProviders`

## 5) Test Chat Endpoint

```powershell
$body = @{ message = "What is attendance policy?"; provider = "chatgpt" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5050/chat" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
```

## 6) Troubleshooting

### Assistant not connecting

- Ensure `python server.py` is running
- Ensure `REACT_APP_AI_ASSISTANT_URL=http://localhost:5050`
- Verify `AI_PROVIDER` is set to `chatgpt` or `gemini`, and the matching key exists in `.env`

### No answer from KB

- Ensure files in [knowledge_base](knowledge_base) are non-empty
- Restart `python server.py` after KB edits

### Backend auth/session issues

- Verify Node backend is running on port 5000
- Re-login if token expired

## Notes

- Keep secrets out of source files
- Use secret managers in production
- Keep `CLIENT_ORIGIN` strict in production
