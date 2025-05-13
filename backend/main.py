import os, json, uuid
from typing import Optional, Literal, List
from fastapi import FastAPI, UploadFile, Form, File, Path, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import storage
import shutil
import tempfile
from datetime import timedelta, datetime
from pydantic import BaseModel
from typing import Optional, List
import uuid
from mongoengine import connect, disconnect
from backend.config.settings import get_settings
from backend.db.mongodb import close_mongo_connection, connect_to_mongo
from backend.services.chatbot_service import ChatbotService

from backend.db.models.user_model import UserRegister, UserLogin
from backend.services.authentication_service import register_user, login_user
from google.oauth2 import service_account



settings = get_settings()

# Initialize FastAPI application
app = FastAPI(title="MirrorMe Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connect to MongoDB
@app.on_event("startup")
async def startup_db_client():
    connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
    close_mongo_connection()


# Initialize chatbot service
chatbot_service = ChatbotService()


# Request and response models
class MessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    entry_source: Optional[str] = None
    entry_statement: Optional[str] = None


class MessageResponse(BaseModel):
    session_id: str
    response: str
    is_new: bool


class ConversationSummary(BaseModel):
    id: str
    session_id: str
    preview: str
    updated_at: datetime
    message_count: int


@app.get("/")
async def root():
    return {"message": "Welcome to the MirrorMe Chatbot API"}


@app.post("/chat", response_model=MessageResponse)
async def chat(request: MessageRequest):
    """Process a user message and return a response."""
    try:
        # Process the message
        response = chatbot_service.process_message(
            session_id=request.session_id,
            user_message=request.message,
            entry_source=request.entry_source,
            entry_statement=request.entry_statement,
        )

        return response
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/conversations", response_model=List[ConversationSummary])
async def get_conversations(limit: int = 10):
    """Get a list of recent conversations."""
    try:
        conversations = chatbot_service.get_recent_conversations(limit=limit)

        result = []
        for conv in conversations:
            # Get preview from last message
            preview = ""
            if conv.messages:
                preview = (
                    conv.messages[-1].content[:100] + "..."
                    if len(conv.messages[-1].content) > 100
                    else conv.messages[-1].content
                )

            result.append(
                ConversationSummary(
                    id=str(conv.id),
                    session_id=conv.session_id,
                    preview=preview,
                    updated_at=conv.updated_at,
                    message_count=len(conv.messages),
                )
            )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get details of a specific conversation."""
    try:
        from backend.db.models.conversation import Conversation

        conversation = Conversation.objects(id=conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = []
        for msg in conversation.messages:
            messages.append(
                {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp}
            )

        return {
            "id": str(conversation.id),
            "session_id": conversation.session_id,
            "entry_source": conversation.entry_source,
            "entry_statement": conversation.entry_statement,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "messages": messages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health check endpoint
@app.get("/health")
async def health_check():
    """Check API health."""
    return {"status": "healthy", "timestamp": datetime.now()}


def upload_to_gcs(bucket_name, file_path, destination_blob_name):
    settings = get_settings()

    # Create credentials object from the file
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_APPLICATION_CREDENTIALS
    )

    gcs_client = storage.Client(credentials=credentials)
    bucket = gcs_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file_path)
    print(f"Uploaded to gs://{bucket_name}/{destination_blob_name}")


@app.post("/vault/items")
async def vault_items(
    files: List[UploadFile] = File(...),
    category: Literal["images", "records", "videos"] = Form(...),
):
    uploaded_files = []

    for file in files:
        # 1. Save to temp
        temp_path = os.path.join(tempfile.gettempdir(), file.filename)

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Upload to GCS
        upload_to_gcs(
            bucket_name="mirrorme-bucket",
            file_path=temp_path,
            destination_blob_name=f"uploads/{category}/{file.filename}",
        )

        # 3. Delete temp file
        os.remove(temp_path)

        # 4. Append result
        uploaded_files.append({"filename": file.filename, "category": category})

    return {"status": "uploaded", "files": uploaded_files}


@app.get("/vault/{category}")
async def get_files_by_category(
    category: Literal["images", "records", "videos"] = Path(...),
):
    settings = get_settings()

    # Create credentials object from the file
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_APPLICATION_CREDENTIALS
    )

    bucket_name = "mirrorme-bucket"
    folder_path = f"uploads/{category}/"

    gcs_client = storage.Client(credentials=credentials)
    bucket = gcs_client.bucket(bucket_name)

    blobs = bucket.list_blobs(prefix=folder_path)
    file_list = []

    for blob in blobs:
        if blob.name.endswith("/"):
            continue

        signed_url = blob.generate_signed_url(
            expiration=timedelta(minutes=30), method="GET"
        )

        file_list.append(
            {
                "filename": blob.name.split("/")[-1],
                "url": signed_url,
                "timestamp": blob.updated.isoformat(),  # ISO 8601 string
            }
        )

    return {"category": category, "files": file_list}


@app.post("/register")
async def register(data: UserRegister):
    try:
        token = register_user(data.email, data.password)
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
async def login(data: UserLogin):
    try:
        token = login_user(data.email, data.password)
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

