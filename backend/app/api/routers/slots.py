from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models import ServiceSlot
from app.schemas.slot import SlotCreate, SlotOut, SlotRoleRef, SlotUpdate
from app.services.slot_service import SlotService

router = APIRouter(prefix="/slots", tags=["slots"])


def build_slot_out(slot: ServiceSlot) -> SlotOut:
    roles = [SlotRoleRef.model_validate(sr.role) for sr in slot.roles if sr.role]
    return SlotOut(
        id=slot.id,
        code=slot.code,
        label=slot.label,
        day_of_week=slot.day_of_week,
        order=slot.order,
        is_active=slot.is_active,
        roles=roles,
    )


@router.get("", response_model=list[SlotOut])
def list_slots(db: Session = Depends(get_db_session)):
    service = SlotService(db)
    return [build_slot_out(slot) for slot in service.list_slots()]


@router.post("", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(payload: SlotCreate, db: Session = Depends(get_db_session)):
    service = SlotService(db)
    slot = service.create_slot(
        label=payload.label,
        day_of_week=payload.day_of_week,
        order=payload.order,
        is_active=payload.is_active,
        role_ids=payload.role_ids,
    )
    db.commit()
    slot = service.get(slot.id)
    return build_slot_out(slot)


@router.put("/{slot_id}", response_model=SlotOut)
def update_slot(slot_id: int, payload: SlotUpdate, db: Session = Depends(get_db_session)):
    service = SlotService(db)
    slot = service.get(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    service.update_slot(
        slot,
        label=payload.label,
        day_of_week=payload.day_of_week,
        order=payload.order,
        is_active=payload.is_active,
        role_ids=payload.role_ids,
    )
    db.commit()
    slot = service.get(slot_id)
    return build_slot_out(slot)


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slot(slot_id: int, db: Session = Depends(get_db_session)):
    service = SlotService(db)
    slot = service.get(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    service.delete_slot(slot)
    db.commit()
    return None
