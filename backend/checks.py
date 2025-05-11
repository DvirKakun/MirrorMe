# backend/checks.py
from openai import OpenAI
import os
import re
import math
from dotenv import load_dotenv


load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# 1) Moderation via OpenAI API
def moderation_ok(text: str) -> bool:
    res = client.moderations.create(input=text)

    return not res.results[0].flagged


# 2) Regex / placeholder
BAD = [r"ERROR", r"\{.*?\}", r"undefined", r"\bnonsense\b"]


def has_placeholder(text: str) -> bool:
    return any(re.search(p, text, re.I) for p in BAD)


# 3) Relevance via embeddings
def cosine(a, b):
    return sum(x * y for x, y in zip(a, b)) / (
        math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    )


def relevant(user, reply, th=0.6):
    u = client.embeddings.create(model="text-embedding-3-small", input=user)
    r = client.embeddings.create(model="text-embedding-3-small", input=reply)

    u_vec = u.data[0].embedding
    r_vec = r.data[0].embedding

    return cosine(u_vec, r_vec) >= th


# 4) Empathy classifier via few-shot GPT
def empathetic_enough(reply):
    out = (
        client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": "Label this reply: empathetic / neutral / cold / judgmental.",
                },
                {"role": "user", "content": reply},
            ],
        )
        .choices[0]
        .message.content.strip()
        .lower()
    )
    return out in {"empathetic", "neutral"}


# 5) Tool-result consistency (example for diagnose_risk)
def consistent_with_tool(reply, tool, result):
    if tool == "diagnose_risk":
        return (
            result["risk_level"] in reply.lower() and str(result["score"])[:2] in reply
        )
    # other tools analogous...
    return True
