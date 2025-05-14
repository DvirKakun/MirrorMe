from passlib.context import CryptContext
from backend.db.models.user_doc import User
from backend.utils.jwt_handler import create_token
from mongoengine.errors import NotUniqueError
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(email: str, password: str):
    email = email.lower()
    if User.objects(email=email).first():
        raise Exception("User already exists")

    tokened = create_token(email)
    hashed_password = pwd_context.hash(password)
    user = User(
        email=email,
        token=tokened,
        hashed_password=hashed_password,
        created_at=datetime.now(tz=timezone.utc),
        updated_at=datetime.now(tz=timezone.utc),
        is_verified=False
    )
    try:
        user.save()
    except NotUniqueError:
        raise Exception("Email already in use")

    return create_token(email)

def login_user(email: str, password: str):
    email = email.lower()
    user = User.objects(email=email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise Exception("Invalid credentials")
    else:
        user.token = create_token(email)
    
    return create_token(email)
