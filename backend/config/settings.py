from functools import lru_cache
import os
from dotenv import load_dotenv


dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)


class Settings:
    """Configuration settings for the MirrorMe chatbot."""

    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    # MongoDB settings
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME = "mirrorme"

    # Model settings
    DEFAULT_MODEL = "gemini"  # or "gemini"
    OPENAI_MODEL_NAME = "gpt-4.1-mini"
    GEMINI_MODEL_NAME = "gemini-2.0-flash"

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
