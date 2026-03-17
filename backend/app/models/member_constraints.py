from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, SmallInteger, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class MemberConstraints(Base, IdMixin):
    __tablename__ = "member_constraints"
    __table_args__ = (UniqueConstraint("member_id", name="uq_member_constraints"),)

    member_id: Mapped[int] = mapped_column(ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    max_assignments_per_day: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    max_assignments_per_week: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=2)
    allow_multiple_roles_same_slot: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    member: Mapped["Member"] = relationship(back_populates="constraints")
