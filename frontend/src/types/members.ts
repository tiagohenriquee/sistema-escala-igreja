export type Member = {
  id: number;
  name: string;
  phone?: string | null;
  is_active: boolean;
  notes?: string | null;
  roles?: { id: number; name: string }[];
  created_at?: string;
  updated_at?: string;
};
