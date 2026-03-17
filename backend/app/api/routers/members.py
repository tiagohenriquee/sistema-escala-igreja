from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models import Member
from app.schemas.member import MemberCreate, MemberOut, MemberUpdate, MemberWithRolesOut, RoleRef
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberWithRolesOut])
def list_members(db: Session = Depends(get_db_session)):
    service = MemberService(db)
    members = service.list_members_with_roles()
    return [build_member_with_roles(m) for m in members]


@router.post("", response_model=MemberWithRolesOut, status_code=status.HTTP_201_CREATED)
def create_member(payload: MemberCreate, db: Session = Depends(get_db_session)):
    service = MemberService(db)
    member = Member(**payload.model_dump())
    service.create_member(member)
    db.commit()
    member = service.get_member_with_roles(member.id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return build_member_with_roles(member)


@router.get("/{member_id}", response_model=MemberWithRolesOut)
def get_member(member_id: int, db: Session = Depends(get_db_session)):
    service = MemberService(db)
    member = service.get_member_with_roles(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return build_member_with_roles(member)


@router.put("/{member_id}", response_model=MemberWithRolesOut)
def update_member(member_id: int, payload: MemberUpdate, db: Session = Depends(get_db_session)):
    service = MemberService(db)
    member = service.get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    service.update_member(member)
    db.commit()
    member = service.get_member_with_roles(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return build_member_with_roles(member)


@router.patch("/{member_id}/active", response_model=MemberWithRolesOut)
def set_member_active(member_id: int, is_active: bool, db: Session = Depends(get_db_session)):
    service = MemberService(db)
    member = service.get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    service.set_active(member, is_active)
    db.commit()
    member = service.get_member_with_roles(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return build_member_with_roles(member)


@router.put("/{member_id}/roles", status_code=status.HTTP_204_NO_CONTENT)
def replace_member_roles(
    member_id: int,
    role_ids: list[int] = Body(...),
    db: Session = Depends(get_db_session),
):
    service = MemberService(db)
    member = service.get_member(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    service.replace_roles(member, role_ids)
    db.commit()
    return None


def build_member_with_roles(member: Member) -> MemberWithRolesOut:
    base = MemberOut.model_validate(member)
    roles = [RoleRef.model_validate(member_role.role) for member_role in member.roles if member_role.role]
    return MemberWithRolesOut(**base.model_dump(), roles=roles)
