from pydantic import BaseModel, ConfigDict


class SlotRoleRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class SlotBase(BaseModel):
    label: str
    day_of_week: int | None = None
    order: int = 0
    is_active: bool = True


class SlotCreate(SlotBase):
    role_ids: list[int] = []


class SlotUpdate(BaseModel):
    label: str | None = None
    day_of_week: int | None = None
    order: int | None = None
    is_active: bool | None = None
    role_ids: list[int] | None = None


class SlotOut(SlotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    roles: list[SlotRoleRef] = []
