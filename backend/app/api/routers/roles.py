from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models import Role
from app.schemas.role import RoleCreate, RoleOut, RoleUpdate
from app.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db_session)):
    service = RoleService(db)
    return service.list_roles()


@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: Session = Depends(get_db_session)):
    service = RoleService(db)
    role = Role(**payload.model_dump())
    service.create_role(role)
    db.commit()
    db.refresh(role)
    return role


@router.put("/{role_id}", response_model=RoleOut)
def update_role(role_id: int, payload: RoleUpdate, db: Session = Depends(get_db_session)):
    service = RoleService(db)
    role = service.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    service.update_role(role)
    db.commit()
    db.refresh(role)
    return role
