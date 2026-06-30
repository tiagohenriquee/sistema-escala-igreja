from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from app.domain.whatsapp.types import WhatsappItem

UNFILLED_LABEL = "NÃO PREENCHIDO"
SEPARATOR = "".join(["━" for _ in range(16)])


def _format_week_range(week_start_date: date) -> str:
    start = week_start_date
    end = week_start_date + timedelta(days=6)
    return f"{start.strftime('%d/%m')} a {end.strftime('%d/%m')}"


def format_whatsapp_message(week_start_date: date, items: list[WhatsappItem]) -> str:
    grouped: dict[str, list[WhatsappItem]] = defaultdict(list)
    slot_meta: dict[str, tuple[int, str]] = {}
    for item in items:
        grouped[item.slot_code].append(item)
        # Last write wins; all items of a slot carry the same order/label.
        slot_meta[item.slot_code] = (item.slot_order, item.slot_label)

    lines: list[str] = []
    lines.append("*ESCALA MÍDIA*")
    lines.append(f"Semana: {_format_week_range(week_start_date)}")
    lines.append(SEPARATOR)
    lines.append("")

    ordered_codes = sorted(grouped, key=lambda code: (slot_meta[code][0], slot_meta[code][1]))
    for slot_code in ordered_codes:
        slot_items = grouped[slot_code]
        label = slot_meta[slot_code][1]
        lines.append(f"📅 *{label}*")
        for item in sorted(slot_items, key=lambda i: (i.role_order, i.role_name)):
            member_name = item.member_name or UNFILLED_LABEL
            lines.append(f"   • {item.role_name}: {member_name}")
        lines.append("")

    lines.append(SEPARATOR)
    lines.append("_Escala gerada automaticamente_")
    lines.append("_Dúvidas? Fale com o líder da mídia_")

    return "\n".join(lines)
