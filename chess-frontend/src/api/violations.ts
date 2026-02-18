// src/api/violations.ts

export type ViolationRead = {
  violation_id: string;
  player_id: string;
  game_id: string;
  violation_type: string;
  violation_date: string; // ISO datetime
  consequence?: string | null;
};

export type ViolationCreate = {
  player_id: string;
  game_id: string;
  violation_type: string;
  violation_date: string; // ISO datetime
  consequence?: string | null;
};

// Backend ViolationUpdate allows only these fields (player_id/game_id not updatable)
export type ViolationUpdate = {
  violation_type?: string | null;
  violation_date?: string | null; // ISO datetime
  consequence?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Only attach JSON header (safe for GET/DELETE too)
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }

  // Some endpoints might return 204
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const violationsApi = {
  // --- Lists ---
  list: () => http<ViolationRead[]>("/violations/all"),

  listByPlayer: (playerId: string) =>
    http<ViolationRead[]>(`/violations/by-player?player_id=${encodeURIComponent(playerId)}`),

  listByGame: (gameId: string) =>
    http<ViolationRead[]>(`/violations/by-game?game_id=${encodeURIComponent(gameId)}`),

  // --- Single ---
  getById: (violationId: string) =>
    http<ViolationRead>(`/violations/by-id?violation_id=${encodeURIComponent(violationId)}`),

  // --- CRUD ---
  create: (payload: ViolationCreate) =>
    http<ViolationRead>("/violations/add", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (violationId: string, payload: ViolationUpdate) =>
    http<ViolationRead>(`/violations/update?violation_id=${encodeURIComponent(violationId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (violationId: string) =>
    http<{ message: string }>(`/violations/delete?violation_id=${encodeURIComponent(violationId)}`, {
      method: "DELETE",
    }),

  // ✅ Aliases (so other pages/hooks can call the shorter names)
  byPlayer: (playerId: string) =>
    http<ViolationRead[]>(`/violations/by-player?player_id=${encodeURIComponent(playerId)}`),

  byGame: (gameId: string) =>
    http<ViolationRead[]>(`/violations/by-game?game_id=${encodeURIComponent(gameId)}`),

  get: (violationId: string) =>
    http<ViolationRead>(`/violations/by-id?violation_id=${encodeURIComponent(violationId)}`),
};
