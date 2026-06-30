from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import require_auth
from app.api.routers import auth, availabilities, health, members, roles, schedules
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

# Public routers
app.include_router(health.router)
app.include_router(auth.router)

# Protected routers — require a valid bearer token
protected = [Depends(require_auth)]
app.include_router(members.router, dependencies=protected)
app.include_router(roles.router, dependencies=protected)
app.include_router(availabilities.router, dependencies=protected)
app.include_router(schedules.router, dependencies=protected)
