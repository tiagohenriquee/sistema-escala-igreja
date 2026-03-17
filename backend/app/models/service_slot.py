from __future__ import annotations

from sqlalchemy import Boolean, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin, TimestampMixin


class ServiceSlot(Base, IdMixin, TimestampMixin):
    __tablename__ = "service_slots"

    code: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    day_of_week: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    order: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    roles: Mapped[list["SlotRole"]] = relationship(back_populates="slot", cascade="all, delete-orphan")
    availabilities: Mapped[list["Availability"]] = relationship(back_populates="slot")
    schedule_items: Mapped[list["ScheduleItem"]] = relationship(back_populates="slot")
    assignment_history: Mapped[list["AssignmentHistory"]] = relationship(back_populates="slot")
