from sqlalchemy.orm import Session

from app.models import Availability
from app.repositories.availability_repo import AvailabilityRepository


class AvailabilityService:
    def __init__(self, db: Session) -> None:
        self.repo = AvailabilityRepository(db)

    def list_all(self) -> list[Availability]:
        return self.repo.list()

    def list_by_member(self, member_id: int) -> list[Availability]:
        return self.repo.list_by_member(member_id)

    def upsert(self, member_id: int, slot_id: int, is_available: bool) -> Availability:
        return self.repo.upsert(member_id, slot_id, is_available)
