from datetime import date

from app.domain.whatsapp.formatter import format_whatsapp_message
from app.domain.whatsapp.types import WhatsappItem


def test_format_whatsapp_message():
    items = [
        WhatsappItem(
            slot_code="WEDNESDAY",
            slot_label="Quarta-feira",
            role_name="Sonoplasta",
            member_name="Ana",
        ),
        WhatsappItem(
            slot_code="SUNDAY_SECOND_SERVICE",
            slot_label="2º Culto",
            role_name="Videomaker",
            member_name=None,
        ),
    ]

    message = format_whatsapp_message(date(2026, 3, 9), items)

    assert "*ESCALA MÍDIA*" in message
    assert "Semana: 09/03 a 15/03" in message
    assert "📅 *Quarta-feira*" in message
    assert "? Sonoplasta: Ana" in message
    assert "? Videomaker: NÃO PREENCHIDO" in message
