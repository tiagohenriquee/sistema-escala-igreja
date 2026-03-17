from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.models import Schedule, ScheduleItem
from app.repositories.base import BaseRepository


class ScheduleRepository(BaseRepository):
    def list(self) -> list[Schedule]:
        stmt = select(Schedule).order_by(Schedule.week_start_date.desc())
        return list(self.db.scalars(stmt))

    def get(self, schedule_id: int) -> Schedule | None:
        stmt = (
            select(Schedule)
            .options(
                joinedload(Schedule.items).joinedload(ScheduleItem.member),
                joinedload(Schedule.items).joinedload(ScheduleItem.role),
                joinedload(Schedule.items).joinedload(ScheduleItem.slot),
            )
            .where(Schedule.id == schedule_id)
        )
        return self.db.execute(stmt).unique().scalars().first()

    def create(self, schedule: Schedule) -> Schedule:
        self.db.add(schedule)
        self.db.flush()
        return schedule

    def replace_items(self, schedule: Schedule, items: list[ScheduleItem]) -> None:
        self.db.query(ScheduleItem).filter(ScheduleItem.schedule_id == schedule.id).delete()
        for item in items:
            self.db.add(item)
        self.db.flush()
