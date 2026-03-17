from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin, TimestampMixin


class Member(Base, IdMixin, TimestampMixin):
    __tablename__ = "members"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    roles: Mapped[list["MemberRole"]] = relationship(back_populates="member", cascade="all, delete-orphan")
    availabilities: Mapped[list["Availability"]] = relationship(
        back_populates="member", cascade="all, delete-orphan"
    )
    constraints: Mapped["MemberConstraints"] = relationship(
        back_populates="member", uselist=False, cascade="all, delete-orphan"
    )
    schedule_items: Mapped[list["ScheduleItem"]] = relationship(back_populates="member")
    assignment_history: Mapped[list["AssignmentHistory"]] = relationship(back_populates="member")
