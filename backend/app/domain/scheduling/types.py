from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class RoleDefinition:
    id: int
    name: str
    order: int


@dataclass(frozen=True)
class SlotDefinition:
    id: int
    code: str
    label: str
    day_of_week: int | None
    order: int
    roles: list[RoleDefinition]


@dataclass(frozen=True)
class MemberConstraints:
    max_assignments_per_day: int
    max_assignments_per_week: int
    allow_multiple_roles_same_slot: bool


@dataclass(frozen=True)
class MemberProfile:
    id: int
    name: str
    is_active: bool
    role_ids: set[int]
    availability: dict[int, bool]
    constraints: MemberConstraints


@dataclass(frozen=True)
class AssignmentRecord:
    member_id: int
    role_id: int
    slot_id: int
    assigned_date: date


@dataclass(frozen=True)
class ScheduleItemAssignment:
    slot_id: int
    role_id: int
    member_id: int | None


@dataclass(frozen=True)
class ScheduleInput:
    week_start_date: date
    slots: list[SlotDefinition]
    members: list[MemberProfile]
    history: list[AssignmentRecord]


@dataclass(frozen=True)
class ScheduleResult:
    items: list[ScheduleItemAssignment]
