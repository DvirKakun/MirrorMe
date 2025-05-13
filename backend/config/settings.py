from functools import lru_cache
import os
from dotenv import load_dotenv

# Get the base directory
base_dir = os.path.dirname(os.path.dirname(__file__))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)


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

    # Story filters
    MAX_STORIES_TO_RETURN = 5

    # Session settings
    SESSION_EXPIRY_DAYS = 30

    # Get Google credentials - now with explicit path reference
    raw_cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if raw_cred_path:
        # Since the file is now in the config folder, this should find it correctly
        GOOGLE_APPLICATION_CREDENTIALS = os.path.abspath(
            os.path.join(os.path.dirname(__file__), raw_cred_path)
        )
        # Add debugging print to verify the path (you can remove this later)
    else:
        GOOGLE_APPLICATION_CREDENTIALS = None


@lru_cache()
def get_settings() -> Settings:
    return Settings()
