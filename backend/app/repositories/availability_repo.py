from __future__ import annotations

from sqlalchemy import select

from app.models import Availability
from app.repositories.base import BaseRepository


class AvailabilityRepository(BaseRepository):
    def list(self) -> list[Availability]:
        return list(self.db.scalars(select(Availability)))

    def list_by_member(self, member_id: int) -> list[Availability]:
        stmt = select(Availability).where(Availability.member_id == member_id)
        return list(self.db.scalars(stmt))

    def upsert(self, member_id: int, slot_id: int, is_available: bool) -> Availability:
        stmt = select(Availability).where(
            Availability.member_id == member_id,
            Availability.slot_id == slot_id,
        )
        availability = self.db.scalars(stmt).first()
        if availability is None:
            availability = Availability(member_id=member_id, slot_id=slot_id, is_available=is_available)
            self.db.add(availability)
        else:
            availability.is_available = is_available
            self.db.add(availability)
        self.db.flush()
        return availability
