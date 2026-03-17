from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from app.domain.whatsapp.types import WhatsappItem

UNFILLED_LABEL = "NÃO PREENCHIDO"
SEPARATOR = "".join(["━" for _ in range(16)])

SLOT_ORDER = [
    "WEDNESDAY",
    "SUNDAY_EBD",
    "SUNDAY_FIRST_SERVICE",
    "SUNDAY_SECOND_SERVICE",
]

SLOT_LABELS = {
    "WEDNESDAY": "Quarta-feira",
    "SUNDAY_EBD": "Domingo / EBD",
    "SUNDAY_FIRST_SERVICE": "Domingo / 1º Culto",
    "SUNDAY_SECOND_SERVICE": "Domingo / 2º Culto",
}

ROLE_ORDER = {
    "Sonoplasta": 1,
    "Videomaker": 2,
    "Storymaker": 3,
    "Fotos": 4,
}


def _format_week_range(week_start_date: date) -> str:
    start = week_start_date
    end = week_start_date + timedelta(days=6)
    return f"{start.strftime('%d/%m')} a {end.strftime('%d/%m')}"


def format_whatsapp_message(week_start_date: date, items: list[WhatsappItem]) -> str:
    grouped: dict[str, list[WhatsappItem]] = defaultdict(list)
    for item in items:
        grouped[item.slot_code].append(item)

    lines: list[str] = []
    lines.append("*ESCALA MÍDIA*")
    lines.append(f"Semana: {_format_week_range(week_start_date)}")
    lines.append(SEPARATOR)
    lines.append("")

    for slot_code in SLOT_ORDER:
        slot_items = grouped.get(slot_code, [])
        if not slot_items:
            continue

        label = SLOT_LABELS.get(slot_code, slot_items[0].slot_label)
        lines.append(f"📅 *{label}*")
        for item in sorted(slot_items, key=lambda i: ROLE_ORDER.get(i.role_name, 99)):
            member_name = item.member_name or UNFILLED_LABEL
            lines.append(f"   • {item.role_name}: {member_name}")
        lines.append("")

    lines.append(SEPARATOR)
    lines.append("_Escala gerada automaticamente_")
    lines.append("_Dúvidas? Fale com o líder da mídia_")

    return "\n".join(lines)
