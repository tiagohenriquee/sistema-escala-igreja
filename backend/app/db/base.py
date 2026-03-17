from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models for metadata registration
import app.models  # noqa: E402,F401
