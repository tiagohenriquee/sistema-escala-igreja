from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.availability import AvailabilityOut, AvailabilityUpsertRequest
from app.services.availability_service import AvailabilityService
from app.services.member_service import MemberService

router = APIRouter(prefix="/availabilities", tags=["availabilities"])


@router.get("", response_model=list[AvailabilityOut])
def list_availabilities(db: Session = Depends(get_db_session)):
    service = AvailabilityService(db)
    return service.list_all()


@router.put("/member/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def upsert_availabilities(
    member_id: int,
    payload: AvailabilityUpsertRequest,
    db: Session = Depends(get_db_session),
):
    member_service = MemberService(db)
    member = member_service.get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    service = AvailabilityService(db)
    for item in payload.items:
        service.upsert(member_id, item.slot_id, item.is_available)
    db.commit()
    return None
