from pydantic import BaseModel, ConfigDict


class AvailabilityBase(BaseModel):
    slot_id: int
    is_available: bool


class AvailabilityCreate(AvailabilityBase):
    member_id: int


class AvailabilityUpdate(AvailabilityBase):
    pass


class AvailabilityOut(AvailabilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int


class AvailabilityUpsert(BaseModel):
    slot_id: int
    is_available: bool


class AvailabilityUpsertRequest(BaseModel):
    items: list[AvailabilityUpsert]
