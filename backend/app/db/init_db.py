from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    """Dev-only shortcut to create tables directly from the models.

    Prefer `alembic upgrade head` (the canonical path) so the schema stays in
    sync with versioned migrations. This bypasses Alembic entirely.
    """
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Tabelas criadas")
