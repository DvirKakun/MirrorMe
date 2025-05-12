import os, json, uuid
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from tools import diagnose_risk, find_local_resources, save_report
import checks
from prompts import PROMPTS, SEED_SYSTEM

# Load secrets
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
# client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
# DB = client["MirrorMe"]
DB_MESSAGES: dict[str, list[dict]] = {}

app = FastAPI()
app.add_middleware(  # Allow browser <→ server
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


class ChatMsg(BaseModel):
    session_id: Optional[str] = None
    user_message: str
    location: Optional[str] = None


# Helper to load & limit token history
async def load_history(sid):
    # cur = DB.messages.find({"session_id": sid}).sort("ts", 1)
    # msgs = [{"role": m["role"], "content": m["content"]} async for m in cur]
    # return msgs[-20:]  # keep last 20 turns
    return DB_MESSAGES.get(sid, [])[-20:]


# Core function to handle one turn (REST or WS)
async def handle_turn(session_id, user_msg, location="Tel Aviv"):
    history = await load_history(session_id)
    messages = [{"role": "system", "content": SEED_SYSTEM}] + history
    # Optionally inject stage-aware prompt
    if "doubt" in user_msg.lower() or "not sure" in user_msg.lower():
        messages.append({"role": "assistant", "content": PROMPTS["denial_stage"][0]})
    messages.append({"role": "user", "content": user_msg})
    # Call OpenAI with tools
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        functions=[
            {
                "name": "diagnose_risk",
                "description": (
                    "Call this when the user's message describes violence, fear, or potential danger. "
                    "Use it to assess how severe or urgent the abuse situation is based on what the woman says. "
                    "For example, if she mentions being hit, threatened, scared, or unsafe at home."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {"text": {"type": "string"}},
                    "required": ["text"],
                },
            },
            {
                "name": "find_local_resources",
                "description": (
                    "Call this when the user mentions a city, district, or location OR asks for help near her. "
                    "Use it to suggest nearby hotlines or shelters. Trigger if she says 'I live in...', "
                    "'Is there somewhere safe near...', or if she sounds ready to take action or escape."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {"location": {"type": "string"}},
                    "required": ["location"],
                },
            },
            {
                "name": "save_report",
                "description": (
                    "Call this when the woman explicitly says she wants to report the abuse, file a complaint, or tell her story confidentially. "
                    "Use this to store what she described in a secure place (without needing her name). "
                    "Trigger if she says 'I want to report this', 'This needs to be saved', or 'Don't let him get away with it'."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {"report": {"type": "string"}},
                    "required": ["report"],
                },
            },
        ],
        function_call="auto",
        temperature=0.5,
    )
    choice = resp.choices[0]
    tool_used, tool_res, draft = None, None, None

    if choice.finish_reason == "function_call":
        fn = choice.message.function_call.name
        args = json.loads(choice.message.function_call.arguments)
        if fn == "diagnose_risk":
            tool_used, tool_res = fn, diagnose_risk(**args)
        elif fn == "find_local_resources":
            tool_used, tool_res = fn, find_local_resources(args["location"] or location)
        else:
            tool_used, tool_res = "save_report", save_report(args["report"])
        # ask LLM to convert tool output into a human reply
        messages.append(choice.message)
        messages.append(
            {"role": "function", "name": tool_used, "content": json.dumps(tool_res)}
        )

        followup = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, temperature=0.5
        )
        draft = followup.choices[0].message.content
    else:
        draft = choice.message.content

    # Response checking & regeneration loop
    for layer in range(2):
        if not checks.moderation_ok(draft):
            draft = "I’m sorry, I can’t continue that topic. If you’re in danger, call 100 or 118."
            break
        if checks.has_placeholder(draft):
            draft = (
                (
                    client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages
                        + [
                            {
                                "role": "system",
                                "content": "Remove placeholders and answer clearly.",
                            }
                        ],
                        temperature=0.5,
                    )
                )
                .choices[0]
                .message.content
            )
            continue
        if not checks.relevant(user_msg, draft):
            draft = (
                (
                    client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages
                        + [
                            {
                                "role": "system",
                                "content": "Stay on topic: respond to her safety concerns.",
                            }
                        ],
                        temperature=0.5,
                    )
                )
                .choices[0]
                .message.content
            )
            continue
        if not checks.empathetic_enough(draft):
            draft = (
                (
                    client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages
                        + [
                            {
                                "role": "system",
                                "content": "Rewrite warmly and validations.",
                            }
                        ],
                        temperature=0.5,
                    )
                )
                .choices[0]
                .message.content
            )
            continue
        if tool_used and not checks.consistent_with_tool(draft, tool_used, tool_res):
            draft = (
                (
                    client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages
                        + [
                            {
                                "role": "system",
                                "content": "Ensure you state the risk level correctly.",
                            }
                        ],
                        temperature=0.5,
                    )
                )
                .choices[0]
                .message.content
            )
            continue
        break

    # persist
    # await DB.messages.insert_many(
    #     [
    #         {
    #             "session_id": session_id,
    #             "role": "user",
    #             "content": user_msg,
    #             "ts": time.time(),
    #         },
    #         {
    #             "session_id": session_id,
    #             "role": "assistant",
    #             "content": draft,
    #             "ts": time.time(),
    #         },
    #     ]
    # )
    DB_MESSAGES.setdefault(session_id, []).append({"role": "user", "content": user_msg})
    DB_MESSAGES.setdefault(session_id, []).append(
        {"role": "assistant", "content": draft}
    )

    return draft


# REST endpoint
@app.get("/")
async def root():
    return {
        "message": "Hello, this is the MirrorMe API. Use /chat or /ws/{session_id}."
    }


@app.post("/chat")
async def chat_endpoint(msg: ChatMsg):
    sid = getattr(msg, "session_id", None) or str(uuid.uuid4())
    reply = await handle_turn(sid, msg.user_message, msg.location)
    return {"session_id": sid, "reply": reply}


@app.get("/session")
async def create_session():
    new_id = str(uuid.uuid4())

    return {"session_id": new_id}


# WebSocket endpoint
@app.websocket("/ws/{session_id}")
async def ws_endpoint(ws: WebSocket, session_id: str):
    await ws.accept()
    try:
        while True:
            data = (
                await ws.receive_json()
            )  # { "user_message": "...", "location": "Tel Aviv" }
            reply = await handle_turn(
                session_id, data["user_message"], data.get("location")
            )
            # send back both the assistant reply
            await ws.send_json({"role": "assistant", "content": reply})
    except WebSocketDisconnect:
        # client disconnected
        return
