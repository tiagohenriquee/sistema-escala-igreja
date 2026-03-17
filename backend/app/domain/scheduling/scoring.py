from __future__ import annotations

from datetime import date
import random


def compute_score(
    *,
    member_id: int,
    recent_count: int,
    last_assigned: date | None,
    week_count: int,
    day_count: int,
    slot_count: int,
    week_start_date: date,
    randomizer: random.Random,
) -> float:
    if last_assigned is None:
        recency_penalty = 0
    else:
        days_since = (week_start_date - last_assigned).days
        if days_since < 0:
            days_since = 0
        recency_penalty = max(0, 30 - days_since)

    noise = randomizer.random()

    return (
        recent_count * 10
        + recency_penalty
        + week_count * 5
        + day_count * 3
        + slot_count * 2
        + noise
    )
