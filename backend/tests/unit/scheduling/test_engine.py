from datetime import date

from app.domain.scheduling import (
    AssignmentRecord,
    MemberConstraints,
    MemberProfile,
    RoleDefinition,
    ScheduleInput,
    SlotDefinition,
    generate_schedule,
)


def test_generate_schedule_respects_roles_and_availability():
    slots = [
        SlotDefinition(
            id=1,
            code="WEDNESDAY",
            label="Quarta-feira",
            day_of_week=2,
            order=1,
            roles=[
                RoleDefinition(id=1, name="Sonoplasta", order=1),
                RoleDefinition(id=2, name="Storymaker", order=2),
            ],
        ),
        SlotDefinition(
            id=2,
            code="SUNDAY_EBD",
            label="EBD",
            day_of_week=6,
            order=2,
            roles=[RoleDefinition(id=1, name="Sonoplasta", order=1)],
        ),
    ]

    constraints = MemberConstraints(
        max_assignments_per_day=1,
        max_assignments_per_week=3,
        allow_multiple_roles_same_slot=False,
    )

    members = [
        MemberProfile(
            id=1,
            name="Alice",
            is_active=True,
            role_ids={1},
            availability={1: True, 2: True},
            constraints=constraints,
        ),
        MemberProfile(
            id=2,
            name="Bob",
            is_active=True,
            role_ids={1, 2},
            availability={1: True, 2: False},
            constraints=constraints,
        ),
    ]

    history = [
        AssignmentRecord(member_id=2, role_id=1, slot_id=1, assigned_date=date(2026, 3, 4)),
        AssignmentRecord(member_id=2, role_id=1, slot_id=2, assigned_date=date(2026, 2, 25)),
    ]

    schedule_input = ScheduleInput(
        week_start_date=date(2026, 3, 11),
        slots=slots,
        members=members,
        history=history,
    )

    result = generate_schedule(schedule_input, seed=42)

    by_slot_role = {(item.slot_id, item.role_id): item.member_id for item in result.items}

    assert by_slot_role[(1, 1)] == 1
    assert by_slot_role[(1, 2)] == 2
    assert by_slot_role[(2, 1)] == 1


def test_generate_schedule_marks_unfilled():
    slots = [
        SlotDefinition(
            id=1,
            code="WEDNESDAY",
            label="Quarta-feira",
            day_of_week=2,
            order=1,
            roles=[RoleDefinition(id=1, name="Sonoplasta", order=1)],
        )
    ]

    schedule_input = ScheduleInput(
        week_start_date=date(2026, 3, 11),
        slots=slots,
        members=[],
        history=[],
    )

    result = generate_schedule(schedule_input, seed=1)

    assert result.items[0].member_id is None
