"""
SeasonAI Backend Configuration — Enhanced with security, caching, and JWT settings
"""
import os
import secrets
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration."""

    # Flask
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    PORT = int(os.getenv("PORT", 5000))

    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

    # AI APIs
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

    # Gemini Embedding Model (DO NOT CHANGE — tested & working)
    GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
    EMBEDDING_DIM = 768

    # Gemini Chat Model (DO NOT CHANGE — tested & working)
    GEMINI_MODEL = "gemini-2.5-flash"

    # JWT Authentication
    JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    # Rate Limiting
    RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "100/hour")
    RATE_LIMIT_RECOMMEND = os.getenv("RATE_LIMIT_RECOMMEND", "30/hour")
    RATE_LIMIT_CHAT = os.getenv("RATE_LIMIT_CHAT", "60/hour")

    # Cache Settings (in-memory TTL cache — no Redis dependency)
    CACHE_TTL = int(os.getenv("CACHE_TTL", 300))  # 5 minutes default
    CACHE_MAX_SIZE = int(os.getenv("CACHE_MAX_SIZE", 100))

    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100

    # Security
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    @classmethod
    def validate(cls):
        """Validate required configuration."""
        errors = []
        warnings = []

        if not cls.SUPABASE_URL:
            errors.append("SUPABASE_URL is required")
        if not cls.SUPABASE_KEY:
            errors.append("SUPABASE_KEY is required")
        if not cls.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is required")

        # Security warnings
        if cls.JWT_SECRET == os.getenv("JWT_SECRET") is None:
            warnings.append("JWT_SECRET not set — using auto-generated key (tokens won't persist across restarts)")
        if cls.ALLOWED_ORIGINS == ["*"] and cls.FLASK_ENV == "production":
            warnings.append("ALLOWED_ORIGINS is '*' in production — consider restricting CORS")

        if errors:
            print(f"⚠️  Configuration errors: {', '.join(errors)}")
            print("   Some features may not work without proper configuration.")
        if warnings:
            for w in warnings:
                print(f"💡 {w}")

        return len(errors) == 0
