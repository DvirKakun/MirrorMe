from functools import lru_cache
import os


class Settings:
    """Configuration settings for the MirrorMe chatbot."""
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY = "your-gemini-key"
    
    # MongoDB settings
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME = "mirrorme"
    
    # Model settings
    DEFAULT_MODEL = "openai"  # or "gemini"
    OPENAI_MODEL_NAME = "gpt-4.1-mini"
    GEMINI_MODEL_NAME = "gemini-pro"
    
    # Google Sheets
    GOOGLE_SHEETS_ID = "your-sheet-id"
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    # Story filters
    MAX_STORIES_TO_RETURN = 5
    
    # Session settings
    SESSION_EXPIRY_DAYS = 30
    

@lru_cache()
def get_settings() -> Settings:
    return Settings()