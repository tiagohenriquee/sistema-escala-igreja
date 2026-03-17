from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.models import ServiceSlot, SlotRole
from app.repositories.base import BaseRepository


class SlotRepository(BaseRepository):
    def list_active_with_roles(self) -> list[ServiceSlot]:
        stmt = (
            select(ServiceSlot)
            .options(joinedload(ServiceSlot.roles).joinedload(SlotRole.role))
            .where(ServiceSlot.is_active.is_(True))
            .order_by(ServiceSlot.order)
        )
        return self.db.execute(stmt).unique().scalars().all()
