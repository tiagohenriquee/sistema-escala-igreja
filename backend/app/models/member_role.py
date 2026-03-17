from __future__ import annotations

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import IdMixin


class MemberRole(Base, IdMixin):
    __tablename__ = "member_roles"
    __table_args__ = (UniqueConstraint("member_id", "role_id", name="uq_member_role"),)

    member_id: Mapped[int] = mapped_column(ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)

    member: Mapped["Member"] = relationship(back_populates="roles")
    role: Mapped["Role"] = relationship(back_populates="members")
