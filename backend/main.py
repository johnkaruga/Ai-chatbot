import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIConnectionError, APIStatusError, AsyncOpenAI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Portfolio Assistant API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class ChatResponse(BaseModel):
    reply: str


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "replace-with-your-api-key":
        raise HTTPException(
            status_code=503,
            detail="The AI service is not configured yet. Add an API key to backend/.env.",
        )

    context_path = BASE_DIR / "portfolio_context.md"
    portfolio_context = context_path.read_text(encoding="utf-8")
    instructions = f"""You are the friendly AI assistant for John Njuguna's IT portfolio.
Answer clearly and conversationally using the portfolio information below. Keep replies concise.
If the information does not contain an answer, say you do not know and direct the visitor to the portfolio's Contact section when appropriate.
Never invent personal details, qualifications, employers, contact information, or project outcomes.

Portfolio information:
{portfolio_context}
"""

    client = AsyncOpenAI(api_key=api_key)
    try:
        result = await client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-6-astra"),
            instructions=instructions,
            input=[message.model_dump() for message in request.messages],
            max_output_tokens=500,
        )
    except APIConnectionError as exc:
        raise HTTPException(status_code=502, detail="Could not reach the AI service. Please try again.") from exc
    except APIStatusError as exc:
        raise HTTPException(status_code=502, detail="The AI service could not complete that request.") from exc
    finally:
        await client.close()

    reply = result.output_text.strip()
    if not reply:
        raise HTTPException(status_code=502, detail="The AI service returned an empty reply. Please try again.")
    return ChatResponse(reply=reply)
