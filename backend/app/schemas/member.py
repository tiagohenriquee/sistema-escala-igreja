from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MemberBase(BaseModel):
    name: str
    phone: str | None = None
    is_active: bool = True
    notes: str | None = None


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    is_active: bool | None = None
    notes: str | None = None


class MemberOut(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class RoleRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class MemberWithRolesOut(MemberOut):
    roles: list[RoleRef] = []
