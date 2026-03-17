from functools import lru_cache
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "escala-midia"
    environment: str = "local"

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5433/escala"
    redis_url: str = "redis://localhost:6379/0"

    # Deterministic scheduling when seed is provided
    scheduling_seed: int | None = None
    scheduling_history_days: int = 56

    cors_origins: list[str] = ["http://localhost:5173"]



class ApiInfo(BaseModel):
    name: str
    environment: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
