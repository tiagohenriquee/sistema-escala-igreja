from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ScheduleGenerateRequest(BaseModel):
    week_start_date: date


class ScheduleItemBase(BaseModel):
    slot_id: int
    role_id: int
    member_id: int | None = None


class ScheduleItemUpdate(ScheduleItemBase):
    id: int | None = None


class ScheduleItemOut(ScheduleItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ScheduleBase(BaseModel):
    week_start_date: date
    status: str
    generated_at: datetime
    approved_at: datetime | None = None
    sent_at: datetime | None = None


class ScheduleSummaryOut(ScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ScheduleOut(ScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    items: list[ScheduleItemOut]


class ScheduleUpdateRequest(BaseModel):
    items: list[ScheduleItemUpdate]
