// Tipos do sistema de escala

export interface Member {
  id: number;
  name: string;
  phone?: string | null;
  is_active: boolean;
  notes?: string | null;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface Availability {
  id: number;
  member_id: number;
  slot_id: number;
  is_available: boolean;
}

export interface ScheduleItem {
  id: number;
  slot_id: number;
  role_id: number;
  member_id?: number | null;
  member?: Member;
  role?: Role;
}

export interface Schedule {
  id: number;
  week_start_date: string;
  status: "draft" | "approved" | "sent";
  generated_at: string;
  approved_at?: string | null;
  sent_at?: string | null;
  items: ScheduleItem[];
}

export const SLOTS = {
  1: { id: 1, name: "Quarta-feira", shortName: "QUA" },
  2: { id: 2, name: "Domingo / EBD", shortName: "DOM EBD" },
  3: { id: 3, name: "Domingo / 1º Culto", shortName: "DOM 1º" },
  4: { id: 4, name: "Domingo / 2º Culto", shortName: "DOM 2º" },
} as const;

export type SlotId = keyof typeof SLOTS;

export const SLOT_LIST = Object.values(SLOTS);
