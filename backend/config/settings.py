from functools import lru_cache
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuration settings for the MirrorMe chatbot."""
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "your-openai-key")
    GEMINI_API_KEY: str = "your-gemini-key"
    
    # MongoDB settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "mirrorme"
    
    # Model settings
    DEFAULT_MODEL: str = "openai"  # or "gemini"
    OPENAI_MODEL_NAME: str = "gpt-4o-mini"
    GEMINI_MODEL_NAME: str = "gemini-pro"
    
    # Google Sheets
    GOOGLE_SHEETS_ID: str = "your-sheet-id"
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

    # Story filters
    MAX_STORIES_TO_RETURN: int = 5
    
    # Session settings
    SESSION_EXPIRY_DAYS: int = 30
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Allow extra fields in environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()