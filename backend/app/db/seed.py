from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Role, ServiceSlot, SlotRole


ROLE_DATA = [
    (1, "Sonoplasta"),
    (2, "Storymaker"),
    (3, "Fotos"),
    (4, "Videomaker"),
]

SLOT_DATA = [
    (1, "WEDNESDAY", "Quarta-feira", 2, 1),
    (2, "SUNDAY_EBD", "EBD", 6, 2),
    (3, "SUNDAY_FIRST_SERVICE", "1º Culto", 6, 3),
    (4, "SUNDAY_SECOND_SERVICE", "2º Culto", 6, 4),
]

SLOT_ROLE_DATA = [
    (1, 1, 1), (1, 2, 2), (1, 3, 3),
    (2, 1, 1), (2, 2, 2),
    (3, 1, 1), (3, 2, 2), (3, 3, 3),
    (4, 1, 1), (4, 4, 2), (4, 2, 3), (4, 3, 4),
]


def seed(db: Session) -> None:
    for role_id, name in ROLE_DATA:
        if not db.get(Role, role_id):
            db.add(Role(id=role_id, name=name))

    for slot_id, code, label, day, order in SLOT_DATA:
        if not db.get(ServiceSlot, slot_id):
            db.add(
                ServiceSlot(
                    id=slot_id,
                    code=code,
                    label=label,
                    day_of_week=day,
                    order=order,
                    is_active=True,
                )
            )

    db.flush()

    existing = {(item.slot_id, item.role_id) for item in db.query(SlotRole).all()}
    for slot_id, role_id, order in SLOT_ROLE_DATA:
        if (slot_id, role_id) not in existing:
            db.add(SlotRole(slot_id=slot_id, role_id=role_id, order=order))

    db.commit()
    _resync_sequences(db)


def _resync_sequences(db: Session) -> None:
    """Advance auto-increment sequences past the rows seeded with explicit IDs.

    Inserting explicit primary keys (roles/slots) does not bump the Postgres
    sequence, so the first app-created row would collide on id=1.
    """
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return
    for table in ("roles", "service_slots"):
        db.execute(
            text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}), 1), "
                f"(SELECT MAX(id) IS NOT NULL FROM {table}))"
            )
        )
    db.commit()


if __name__ == "__main__":
    session = SessionLocal()
    try:
        seed(session)
        print("Seed concluída")
    finally:
        session.close()
