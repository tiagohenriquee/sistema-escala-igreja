from dataclasses import dataclass


@dataclass
class WhatsappItem:
    slot_code: str
    slot_label: str
    role_name: str
    member_name: str | None
