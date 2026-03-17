from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class AssignmentHistory(Base, IdMixin):
    __tablename__ = "assignment_history"
    __table_args__ = (Index("ix_assignment_member_date", "member_id", "assigned_date"),)

    member_id: Mapped[int] = mapped_column(ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    slot_id: Mapped[int] = mapped_column(ForeignKey("service_slots.id", ondelete="CASCADE"), nullable=False)
    schedule_id: Mapped[int | None] = mapped_column(ForeignKey("schedules.id", ondelete="SET NULL"))
    assigned_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    member: Mapped["Member"] = relationship(back_populates="assignment_history")
    role: Mapped["Role"] = relationship(back_populates="assignment_history")
    slot: Mapped["ServiceSlot"] = relationship(back_populates="assignment_history")
