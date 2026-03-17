from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import availabilities, health, members, roles, schedules
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(members.router)
app.include_router(roles.router)
app.include_router(availabilities.router)
app.include_router(schedules.router)
