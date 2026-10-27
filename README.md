# Portfolio AI Chatbot

A small portfolio assistant with a Next.js + TypeScript frontend and a Python FastAPI backend.

## Requirements

- Node.js 20 or newer and npm
- Python 3.10 or newer
- An OpenAI API key with API access

## 1. Configure the Python backend

In PowerShell, from this project directory:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend/.env` and set `OPENAI_API_KEY`. The key stays on the server and must never be added to frontend code or committed to Git. You can change `OPENAI_MODEL` if your API account uses a different model.

Edit `backend/portfolio_context.md` with accurate information about your background, skills, and projects. The assistant uses this content to answer portfolio questions.

Start the API:

```powershell
uvicorn main:app --reload --port 8000
```

## 2. Start the Next.js frontend

Open a second PowerShell window in this project directory:

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The Python API runs at <http://localhost:8000>.

Optionally, copy `frontend/.env.local.example` to `frontend/.env.local` and set `NEXT_PUBLIC_PORTFOLIO_URL` to the local or deployed portfolio URL. `NEXT_PUBLIC_CHAT_API_URL` sets the Python API base URL; this value is public and must not contain secrets.

## Configuration

Backend settings are in `backend/.env`:

- `OPENAI_API_KEY`: required secret API key
- `OPENAI_MODEL`: model name (default: `gpt-6-astra`)
- `FRONTEND_ORIGIN`: allowed frontend origin (default: `http://localhost:3000`)

For deployment, host the frontend and API, set these values as server-side environment variables, and update `FRONTEND_ORIGIN` to the deployed frontend URL. Never expose the API key in a `NEXT_PUBLIC_` variable.
