from sqlalchemy.orm import Session

from app.models import Role
from app.repositories.role_repo import RoleRepository


class RoleService:
    def __init__(self, db: Session) -> None:
        self.repo = RoleRepository(db)

    def list_roles(self) -> list[Role]:
        return self.repo.list()

    def get_role(self, role_id: int) -> Role | None:
        return self.repo.get(role_id)

    def create_role(self, role: Role) -> Role:
        return self.repo.create(role)

    def update_role(self, role: Role) -> Role:
        return self.repo.update(role)
