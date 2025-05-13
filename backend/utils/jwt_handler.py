import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os


load_dotenv()
SECRET_KEY = ("SECRET_KEY")
ALGORITHM = "HS256"

def create_token(email: str):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
