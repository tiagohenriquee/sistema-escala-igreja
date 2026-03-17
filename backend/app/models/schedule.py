from __future__ import annotations

from datetime import datetime, date
from enum import Enum as PyEnum

from sqlalchemy import Date, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class ScheduleStatus(str, PyEnum):
    DRAFT = "draft"
    APPROVED = "approved"
    SENT = "sent"


class Schedule(Base, IdMixin):
    __tablename__ = "schedules"

    week_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(ScheduleStatus, name="schedule_status"),
        nullable=False,
        default=ScheduleStatus.DRAFT,
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["ScheduleItem"]] = relationship(back_populates="schedule", cascade="all, delete-orphan")
