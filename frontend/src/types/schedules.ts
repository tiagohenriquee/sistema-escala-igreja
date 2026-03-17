export type ScheduleItem = {
  id: number;
  slot_id: number;
  role_id: number;
  member_id?: number | null;
};

export type Schedule = {
  id: number;
  week_start_date: string;
  status: string;
  generated_at: string;
  approved_at?: string | null;
  sent_at?: string | null;
  items: ScheduleItem[];
};

export type ScheduleSummary = Omit<Schedule, "items">;

export type WhatsappPreview = {
  schedule_id: number;
  message: string;
};
