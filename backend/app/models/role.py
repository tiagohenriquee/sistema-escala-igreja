from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin, TimestampMixin


class Role(Base, IdMixin, TimestampMixin):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)

    members: Mapped[list["MemberRole"]] = relationship(back_populates="role", cascade="all, delete-orphan")
    slot_roles: Mapped[list["SlotRole"]] = relationship(back_populates="role", cascade="all, delete-orphan")
    schedule_items: Mapped[list["ScheduleItem"]] = relationship(back_populates="role")
    assignment_history: Mapped[list["AssignmentHistory"]] = relationship(back_populates="role")
