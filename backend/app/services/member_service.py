from sqlalchemy.orm import Session

from app.models import Member
from app.repositories.member_repo import MemberRepository


class MemberService:
    def __init__(self, db: Session) -> None:
        self.repo = MemberRepository(db)

    def list_members(self) -> list[Member]:
        return self.repo.list()

    def get_member(self, member_id: int) -> Member | None:
        return self.repo.get(member_id)

    def list_members_with_roles(self) -> list[Member]:
        return self.repo.list_with_roles()

    def get_member_with_roles(self, member_id: int) -> Member | None:
        return self.repo.get_with_roles(member_id)

    def create_member(self, member: Member) -> Member:
        return self.repo.create(member)

    def update_member(self, member: Member) -> Member:
        return self.repo.update(member)

    def set_active(self, member: Member, is_active: bool) -> Member:
        return self.repo.set_active(member, is_active)

    def replace_roles(self, member: Member, role_ids: list[int]) -> None:
        self.repo.replace_roles(member, role_ids)
