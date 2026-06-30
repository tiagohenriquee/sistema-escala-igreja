export interface Slot {
  id: number;
  code: string;
  label: string;
  day_of_week: number | null;
  order: number;
  is_active: boolean;
  roles: { id: number; name: string }[];
}

export interface SlotPayload {
  label: string;
  day_of_week: number | null;
  order: number;
  is_active: boolean;
  role_ids: number[];
}
