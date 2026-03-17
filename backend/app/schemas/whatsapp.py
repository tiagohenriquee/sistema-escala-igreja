from pydantic import BaseModel


class WhatsappPreview(BaseModel):
    schedule_id: int
    message: str
