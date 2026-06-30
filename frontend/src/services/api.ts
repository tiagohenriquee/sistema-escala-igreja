import type {
  Availability,
  AvailabilityUpsert,
  Member,
  Role,
  Schedule,
  ScheduleSummary,
  WhatsappPreview,
} from "../types";
import { clearToken, getToken, setToken } from "../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro ao comunicar com a API");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.status === 401) {
      throw new Error("Credenciais inválidas");
    }
    if (!response.ok) {
      throw new Error("Erro ao comunicar com a API");
    }
    const { access_token } = (await response.json()) as { access_token: string };
    setToken(access_token);
    return access_token;
  },

  listMembers: () => request<Member[]>("/members"),
  createMember: (payload: Partial<Member>) =>
    request<Member>("/members", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateMember: (id: number, payload: Partial<Member>) =>
    request<Member>(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  setMemberActive: (id: number, isActive: boolean) =>
    request<Member>(`/members/${id}/active?is_active=${isActive}`, {
      method: "PATCH",
    }),
  replaceMemberRoles: (id: number, roleIds: number[]) =>
    request<void>(`/members/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify(roleIds),
    }),

  listRoles: () => request<Role[]>("/roles"),
  createRole: (payload: Partial<Role>) =>
    request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRole: (id: number, payload: Partial<Role>) =>
    request<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  listAvailabilities: () => request<Availability[]>("/availabilities"),
  upsertAvailabilities: (memberId: number, items: AvailabilityUpsert[]) =>
    request<void>(`/availabilities/member/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  generateSchedule: (weekStartDate: string) =>
    request<Schedule>("/schedules/generate", {
      method: "POST",
      body: JSON.stringify({ week_start_date: weekStartDate }),
    }),
  listSchedules: () => request<ScheduleSummary[]>("/schedules"),
  getSchedule: (id: number) => request<Schedule>(`/schedules/${id}`),
  updateSchedule: (id: number, items: Schedule["items"]) =>
    request<Schedule>(`/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
  approveSchedule: (id: number) =>
    request<Schedule>(`/schedules/${id}/approve`, { method: "POST" }),
  whatsappPreview: (id: number) =>
    request<WhatsappPreview>(`/schedules/${id}/whatsapp-preview`),
};
