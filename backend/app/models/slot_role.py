from __future__ import annotations

from sqlalchemy import ForeignKey, SmallInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class SlotRole(Base, IdMixin):
    __tablename__ = "slot_roles"
    __table_args__ = (UniqueConstraint("slot_id", "role_id", name="uq_slot_role"),)

    slot_id: Mapped[int] = mapped_column(ForeignKey("service_slots.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    order: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    slot: Mapped["ServiceSlot"] = relationship(back_populates="roles")
    role: Mapped["Role"] = relationship(back_populates="slot_roles")
