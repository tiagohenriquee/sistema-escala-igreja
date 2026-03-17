from __future__ import annotations

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class ScheduleItem(Base, IdMixin):
    __tablename__ = "schedule_items"
    __table_args__ = (UniqueConstraint("schedule_id", "slot_id", "role_id", name="uq_schedule_slot_role"),)

    schedule_id: Mapped[int] = mapped_column(ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False)
    slot_id: Mapped[int] = mapped_column(ForeignKey("service_slots.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    member_id: Mapped[int | None] = mapped_column(ForeignKey("members.id", ondelete="SET NULL"), nullable=True)

    schedule: Mapped["Schedule"] = relationship(back_populates="items")
    slot: Mapped["ServiceSlot"] = relationship(back_populates="schedule_items")
    role: Mapped["Role"] = relationship(back_populates="schedule_items")
    member: Mapped["Member"] = relationship(back_populates="schedule_items")
