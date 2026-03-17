export type Availability = {
  id: number;
  member_id: number;
  slot_id: number;
  is_available: boolean;
};

export type AvailabilityUpsert = {
  slot_id: number;
  is_available: boolean;
};
