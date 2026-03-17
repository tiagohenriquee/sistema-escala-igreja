from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models import ScheduleItem
from app.schemas.schedule import (
    ScheduleGenerateRequest,
    ScheduleOut,
    ScheduleSummaryOut,
    ScheduleUpdateRequest,
)
from app.schemas.whatsapp import WhatsappPreview
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.post("/generate", response_model=ScheduleOut, status_code=status.HTTP_201_CREATED)
def generate_schedule(payload: ScheduleGenerateRequest, db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    schedule = service.generate_schedule(payload.week_start_date)
    db.commit()
    db.refresh(schedule)
    schedule = service.get_schedule(schedule.id)
    return schedule


@router.get("", response_model=list[ScheduleSummaryOut])
def list_schedules(db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    return service.list_schedules()


@router.get("/{schedule_id}", response_model=ScheduleOut)
def get_schedule(schedule_id: int, db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    schedule = service.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleOut)
def update_schedule(schedule_id: int, payload: ScheduleUpdateRequest, db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    schedule = service.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    updates = [
        ScheduleItem(
            id=item.id,
            schedule_id=schedule.id,
            slot_id=item.slot_id,
            role_id=item.role_id,
            member_id=item.member_id,
        )
        for item in payload.items
    ]
    service.update_schedule_items(schedule, updates)
    db.commit()
    schedule = service.get_schedule(schedule.id)
    return schedule


@router.post("/{schedule_id}/approve", response_model=ScheduleOut)
def approve_schedule(schedule_id: int, db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    schedule = service.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    service.approve(schedule)
    db.commit()
    schedule = service.get_schedule(schedule.id)
    return schedule


@router.get("/{schedule_id}/whatsapp-preview", response_model=WhatsappPreview)
def whatsapp_preview(schedule_id: int, db: Session = Depends(get_db_session)):
    service = ScheduleService(db)
    schedule = service.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    message = service.build_whatsapp_preview(schedule)
    return WhatsappPreview(schedule_id=schedule.id, message=message)
