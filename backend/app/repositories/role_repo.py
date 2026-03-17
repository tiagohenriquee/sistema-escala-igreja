from __future__ import annotations

from sqlalchemy import select

from app.models import Role
from app.repositories.base import BaseRepository


class RoleRepository(BaseRepository):
    def list(self) -> list[Role]:
        return list(self.db.scalars(select(Role).order_by(Role.name)))

    def get(self, role_id: int) -> Role | None:
        return self.db.get(Role, role_id)

    def create(self, role: Role) -> Role:
        self.db.add(role)
        self.db.flush()
        return role

    def update(self, role: Role) -> Role:
        self.db.add(role)
        self.db.flush()
        return role
