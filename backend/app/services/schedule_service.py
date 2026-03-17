from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.domain.scheduling import (
    AssignmentRecord,
    MemberConstraints,
    MemberProfile,
    RoleDefinition,
    ScheduleInput,
    SlotDefinition,
    generate_schedule,
)
from app.domain.whatsapp.formatter import format_whatsapp_message
from app.domain.whatsapp.types import WhatsappItem
from app.models import (
    AssignmentHistory,
    Member,
    Schedule,
    ScheduleItem,
    ScheduleStatus,
    SlotRole,
)
from app.repositories.schedule_repo import ScheduleRepository
from app.repositories.slot_repo import SlotRepository


class ScheduleService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ScheduleRepository(db)
        self.slot_repo = SlotRepository(db)
        self.settings = get_settings()

    def list_schedules(self) -> list[Schedule]:
        return self.repo.list()

    def get_schedule(self, schedule_id: int) -> Schedule | None:
        return self.repo.get(schedule_id)

    def _build_input(self, week_start_date: date) -> ScheduleInput:
        slots = self.slot_repo.list_active_with_roles()
        slot_defs: list[SlotDefinition] = []
        for slot in slots:
            role_defs = [
                RoleDefinition(id=slot_role.role.id, name=slot_role.role.name, order=slot_role.order)
                for slot_role in slot.roles
            ]
            slot_defs.append(
                SlotDefinition(
                    id=slot.id,
                    code=slot.code,
                    label=slot.label,
                    day_of_week=slot.day_of_week,
                    order=slot.order,
                    roles=role_defs,
                )
            )
        all_slot_ids = {slot.id for slot in slots}

        stmt = select(Member).options(
            joinedload(Member.roles),
            joinedload(Member.availabilities),
            joinedload(Member.constraints),
        )
        members = self.db.execute(stmt).unique().scalars().all()

        member_profiles: list[MemberProfile] = []
        for member in members:
            role_ids = {member_role.role_id for member_role in member.roles}
            availability = {availability.slot_id: availability.is_available for availability in member.availabilities}
            if not availability:
                availability = {slot_id: True for slot_id in all_slot_ids}
            constraints_model = member.constraints
            if constraints_model is None:
                constraints = MemberConstraints(
                    max_assignments_per_day=1,
                    max_assignments_per_week=2,
                    allow_multiple_roles_same_slot=False,
                )
            else:
                constraints = MemberConstraints(
                    max_assignments_per_day=constraints_model.max_assignments_per_day,
                    max_assignments_per_week=constraints_model.max_assignments_per_week,
                    allow_multiple_roles_same_slot=constraints_model.allow_multiple_roles_same_slot,
                )

            member_profiles.append(
                MemberProfile(
                    id=member.id,
                    name=member.name,
                    is_active=member.is_active,
                    role_ids=role_ids,
                    availability=availability,
                    constraints=constraints,
                )
            )

        history_cutoff = week_start_date - timedelta(days=self.settings.scheduling_history_days)
        history_stmt = select(AssignmentHistory).where(AssignmentHistory.assigned_date >= history_cutoff)
        history_records = list(self.db.scalars(history_stmt))
        history: list[AssignmentRecord] = [
            AssignmentRecord(
                member_id=record.member_id,
                role_id=record.role_id,
                slot_id=record.slot_id,
                assigned_date=record.assigned_date,
            )
            for record in history_records
        ]

        return ScheduleInput(
            week_start_date=week_start_date,
            slots=slot_defs,
            members=member_profiles,
            history=history,
        )

    def generate_schedule(self, week_start_date: date) -> Schedule:
        schedule = Schedule(week_start_date=week_start_date, status=ScheduleStatus.DRAFT)
        self.repo.create(schedule)

        schedule_input = self._build_input(week_start_date)
        result = generate_schedule(schedule_input, seed=self.settings.scheduling_seed)

        items: list[ScheduleItem] = [
            ScheduleItem(
                schedule_id=schedule.id,
                slot_id=item.slot_id,
                role_id=item.role_id,
                member_id=item.member_id,
            )
            for item in result.items
        ]
        self.repo.replace_items(schedule, items)
        return schedule

    def update_schedule_items(self, schedule: Schedule, updates: list[ScheduleItem]) -> Schedule:
        for update in updates:
            if update.id is not None:
                item = self.db.get(ScheduleItem, update.id)
            else:
                stmt = select(ScheduleItem).where(
                    ScheduleItem.schedule_id == schedule.id,
                    ScheduleItem.slot_id == update.slot_id,
                    ScheduleItem.role_id == update.role_id,
                )
                item = self.db.scalars(stmt).first()
            if item is None:
                raise ValueError("Schedule item not found")
            item.slot_id = update.slot_id
            item.role_id = update.role_id
            item.member_id = update.member_id
            self.db.add(item)
        self.db.flush()
        return schedule

    def approve(self, schedule: Schedule) -> Schedule:
        schedule.status = ScheduleStatus.APPROVED
        schedule.approved_at = datetime.utcnow()
        self.db.add(schedule)

        for item in schedule.items:
            if item.member_id is None or item.slot is None:
                continue
            day_offset = item.slot.day_of_week or 0
            assigned_date = schedule.week_start_date + timedelta(days=day_offset)
            self.db.add(
                AssignmentHistory(
                    member_id=item.member_id,
                    role_id=item.role_id,
                    slot_id=item.slot_id,
                    schedule_id=schedule.id,
                    assigned_date=assigned_date,
                )
            )

        self.db.flush()
        return schedule

    def build_whatsapp_preview(self, schedule: Schedule) -> str:
        items: list[WhatsappItem] = []
        for item in schedule.items:
            if item.slot is None or item.role is None:
                continue
            items.append(
                WhatsappItem(
                    slot_code=item.slot.code,
                    slot_label=item.slot.label,
                    role_name=item.role.name,
                    member_name=item.member.name if item.member else None,
                )
            )
        return format_whatsapp_message(schedule.week_start_date, items)

    def get_slot_roles(self) -> list[SlotRole]:
        stmt = select(SlotRole)
        return list(self.db.scalars(stmt))
