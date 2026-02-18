// src/api/relations.ts

/**
 * =========================
 * Analytics endpoint models
 * =========================
 */

// Used by: GET /relations/most-active-player
export type MostActivePlayer = {
  player_id: string;
  games_played: number;
};

// Used by: GET /relations/hardest-tournament
export type HardestTournament = {
  tournament_id: string;
  tournament_name?: string | null;
  avg_rating?: number | null;
  games_count?: number | null;
};

// Used by: GET /relations/top-players-by-rating?limit=...
export type TopPlayerByRating = {
  player_id: string;
  rating: number;
  full_name?: string | null;
};

// Used by: GET /relations/top-players
export type PlayerTopStats = {
  player_id: string; // UUID as string
  first_name: string;
  last_name: string;

  rating?: number | null;
  winLoss?: number | null;
  drawPercent?: number | null;
  avgOppRating?: number | null;
};

/**
 * =========================
 * Player detail endpoint models
 * =========================
 */

// Used by: GET /relations/player-summary-by-id?player_id=...
export type PlayerSummary = {
  first_name: string;
  last_name: string;
  rating: number;
  title: string;
  total_games: number;
  win_rate: number; // backend float
};

// A single game entry used in match history
export type GameRead = {
  game_id: string;
  tournament_id: string;

  result: string; // WinState enum serialized
  played_at: string; // ISO datetime

  player_white_id: string;
  player_black_id: string;
};

// Used by: GET /relations/player-match-history?player_id=...
export type PlayerMatchHistoryRead = {
  player_id: string;
  first_name: string;
  last_name: string;
  match_history?: GameRead[] | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const relationsApi = {
  /**
   * ============
   * Analytics
   * ============
   */

  // Matches your later version (and your hook use-analytics.ts)
  topPlayers: () => http<PlayerTopStats[]>("/relations/top-players"),

  // Older analytics endpoints (safe to keep)
  mostActivePlayer: () => http<MostActivePlayer>("/relations/most-active-player"),
  hardestTournament: () => http<HardestTournament>("/relations/hardest-tournament"),
  topPlayersByRating: (limit = 10) =>
    http<TopPlayerByRating[]>(`/relations/top-players-by-rating?limit=${encodeURIComponent(limit)}`),

  /**
   * ==================
   * Player Detail
   * ==================
   */

  playerSummaryById: (playerId: string) =>
    http<PlayerSummary>(`/relations/player-summary-by-id?player_id=${encodeURIComponent(playerId)}`),

  playerMatchHistory: (playerId: string) =>
    http<PlayerMatchHistoryRead>(`/relations/player-match-history?player_id=${encodeURIComponent(playerId)}`),
};
