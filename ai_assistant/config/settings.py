from pydantic_settings import BaseSettings
from pathlib import Path




class Settings(BaseSettings):
    GROQ_API_KEY: str
    # GROQ_MODEL: str

    class Config:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        case_sensitive = True

settings = Settings()