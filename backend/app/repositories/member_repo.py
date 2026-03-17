from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.models import Member, MemberRole
from app.repositories.base import BaseRepository


class MemberRepository(BaseRepository):
    def list(self) -> list[Member]:
        return list(self.db.scalars(select(Member).order_by(Member.name)))

    def get(self, member_id: int) -> Member | None:
        return self.db.get(Member, member_id)

    def list_with_roles(self) -> list[Member]:
        stmt = (
            select(Member)
            .options(joinedload(Member.roles).joinedload(MemberRole.role))
            .order_by(Member.name)
        )
        return self.db.execute(stmt).unique().scalars().all()

    def get_with_roles(self, member_id: int) -> Member | None:
        stmt = (
            select(Member)
            .options(joinedload(Member.roles).joinedload(MemberRole.role))
            .where(Member.id == member_id)
        )
        return self.db.execute(stmt).unique().scalars().first()

    def create(self, member: Member) -> Member:
        self.db.add(member)
        self.db.flush()
        return member

    def update(self, member: Member) -> Member:
        self.db.add(member)
        self.db.flush()
        return member

    def set_active(self, member: Member, is_active: bool) -> Member:
        member.is_active = is_active
        self.db.add(member)
        self.db.flush()
        return member

    def replace_roles(self, member: Member, role_ids: list[int]) -> None:
        self.db.query(MemberRole).filter(MemberRole.member_id == member.id).delete()
        for role_id in role_ids:
            self.db.add(MemberRole(member_id=member.id, role_id=role_id))
        self.db.flush()
