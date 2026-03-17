from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
import random

from app.domain.scheduling.scoring import compute_score
from app.domain.scheduling.types import (
    AssignmentRecord,
    MemberProfile,
    ScheduleInput,
    ScheduleItemAssignment,
    ScheduleResult,
)


DEFAULT_HISTORY_WINDOW_DAYS = 56


def _build_history_stats(
    history: list[AssignmentRecord],
    week_start_date: date,
    history_window_days: int,
) -> tuple[dict[int, int], dict[int, date]]:
    cutoff = week_start_date - timedelta(days=history_window_days)
    recent_count_by_member: dict[int, int] = defaultdict(int)
    last_date_by_member: dict[int, date] = {}

    for record in history:
        if record.assigned_date < cutoff:
            continue
        recent_count_by_member[record.member_id] += 1
        last = last_date_by_member.get(record.member_id)
        if last is None or record.assigned_date > last:
            last_date_by_member[record.member_id] = record.assigned_date

    return recent_count_by_member, last_date_by_member


def _is_member_available(member: MemberProfile, slot_id: int) -> bool:
    return member.availability.get(slot_id, False)


def generate_schedule(
    schedule_input: ScheduleInput,
    *,
    seed: int | None = None,
    history_window_days: int = DEFAULT_HISTORY_WINDOW_DAYS,
) -> ScheduleResult:
    randomizer = random.Random(seed)

    recent_count_by_member, last_date_by_member = _build_history_stats(
        schedule_input.history, schedule_input.week_start_date, history_window_days
    )

    week_count: dict[int, int] = defaultdict(int)
    day_count: dict[int, dict[int, int]] = defaultdict(lambda: defaultdict(int))
    slot_count: dict[int, dict[int, int]] = defaultdict(lambda: defaultdict(int))

    items: list[ScheduleItemAssignment] = []

    members = [m for m in schedule_input.members if m.is_active]

    for slot in sorted(schedule_input.slots, key=lambda s: s.order):
        day_key = slot.day_of_week if slot.day_of_week is not None else slot.id
        for role in sorted(slot.roles, key=lambda r: r.order):
            candidates: list[tuple[float, int]] = []
            for member in members:
                if role.id not in member.role_ids:
                    continue
                if not _is_member_available(member, slot.id):
                    continue

                constraints = member.constraints
                if week_count[member.id] >= constraints.max_assignments_per_week:
                    continue
                if day_count[member.id][day_key] >= constraints.max_assignments_per_day:
                    continue
                if not constraints.allow_multiple_roles_same_slot and slot_count[member.id][slot.id] >= 1:
                    continue

                score = compute_score(
                    member_id=member.id,
                    recent_count=recent_count_by_member.get(member.id, 0),
                    last_assigned=last_date_by_member.get(member.id),
                    week_count=week_count[member.id],
                    day_count=day_count[member.id][day_key],
                    slot_count=slot_count[member.id][slot.id],
                    week_start_date=schedule_input.week_start_date,
                    randomizer=randomizer,
                )
                candidates.append((score, member.id))

            if candidates:
                _, selected_id = min(candidates, key=lambda item: item[0])
                items.append(
                    ScheduleItemAssignment(slot_id=slot.id, role_id=role.id, member_id=selected_id)
                )
                week_count[selected_id] += 1
                day_count[selected_id][day_key] += 1
                slot_count[selected_id][slot.id] += 1
            else:
                items.append(
                    ScheduleItemAssignment(slot_id=slot.id, role_id=role.id, member_id=None)
                )

    return ScheduleResult(items=items)
