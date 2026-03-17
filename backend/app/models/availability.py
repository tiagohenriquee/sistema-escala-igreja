from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class Availability(Base, IdMixin):
    __tablename__ = "availabilities"
    __table_args__ = (UniqueConstraint("member_id", "slot_id", name="uq_member_slot"),)

    member_id: Mapped[int] = mapped_column(ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    slot_id: Mapped[int] = mapped_column(ForeignKey("service_slots.id", ondelete="CASCADE"), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    member: Mapped["Member"] = relationship(back_populates="availabilities")
    slot: Mapped["ServiceSlot"] = relationship(back_populates="availabilities")
