from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Role, ServiceSlot, SlotRole


class SlotService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_slots(self) -> list[ServiceSlot]:
        stmt = (
            select(ServiceSlot)
            .options(joinedload(ServiceSlot.roles).joinedload(SlotRole.role))
            .order_by(ServiceSlot.order, ServiceSlot.id)
        )
        return self.db.execute(stmt).unique().scalars().all()

    def get(self, slot_id: int) -> ServiceSlot | None:
        stmt = (
            select(ServiceSlot)
            .options(joinedload(ServiceSlot.roles).joinedload(SlotRole.role))
            .where(ServiceSlot.id == slot_id)
        )
        return self.db.execute(stmt).unique().scalars().first()

    def _slugify(self, label: str) -> str:
        slug = re.sub(r"[^A-Za-z0-9]+", "_", label).strip("_").upper()
        return slug or "DIA"

    def _unique_code(self, base: str, exclude_id: int | None = None) -> str:
        stmt = select(ServiceSlot.code)
        if exclude_id is not None:
            stmt = stmt.where(ServiceSlot.id != exclude_id)
        existing = set(self.db.scalars(stmt))
        if base not in existing:
            return base
        suffix = 2
        while f"{base}_{suffix}" in existing:
            suffix += 1
        return f"{base}_{suffix}"

    def _replace_roles(self, slot: ServiceSlot, role_ids: list[int]) -> None:
        self.db.query(SlotRole).filter(SlotRole.slot_id == slot.id).delete()
        valid_ids = set(self.db.scalars(select(Role.id).where(Role.id.in_(role_ids))))
        for order, role_id in enumerate(role_ids):
            if role_id in valid_ids:
                self.db.add(SlotRole(slot_id=slot.id, role_id=role_id, order=order))

    def create_slot(
        self,
        *,
        label: str,
        day_of_week: int | None,
        order: int,
        is_active: bool,
        role_ids: list[int],
    ) -> ServiceSlot:
        slot = ServiceSlot(
            code=self._unique_code(self._slugify(label)),
            label=label,
            day_of_week=day_of_week,
            order=order,
            is_active=is_active,
        )
        self.db.add(slot)
        self.db.flush()
        self._replace_roles(slot, role_ids)
        self.db.flush()
        return slot

    def update_slot(
        self,
        slot: ServiceSlot,
        *,
        label: str | None = None,
        day_of_week: int | None = None,
        order: int | None = None,
        is_active: bool | None = None,
        role_ids: list[int] | None = None,
    ) -> ServiceSlot:
        if label is not None:
            slot.label = label
        if day_of_week is not None:
            slot.day_of_week = day_of_week
        if order is not None:
            slot.order = order
        if is_active is not None:
            slot.is_active = is_active
        self.db.add(slot)
        if role_ids is not None:
            self._replace_roles(slot, role_ids)
        self.db.flush()
        return slot

    def delete_slot(self, slot: ServiceSlot) -> None:
        # Cascades remove the slot's roles, availabilities, schedule items and history.
        self.db.delete(slot)
        self.db.flush()
