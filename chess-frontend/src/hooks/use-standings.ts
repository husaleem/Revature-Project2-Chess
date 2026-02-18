import { useCallback, useEffect, useState } from "react";

type StandingRow = {
  player_id: string;
  first_name: string;
  last_name: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  games: number;
};

type PlayerRead = {
  player_id: string;
  first_name: string;
  last_name: string;
  rating: number;
};

type GameRead = {
  game_id: string;
  tournament_id: string;
  player_white_id: string;
  player_black_id: string;
  result: string; // WinState serialized to string
  played_at: string;
};

// Prefer env base if you have it, fallback to localhost
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function normResult(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

/**
 * Defensive: handles "DRAW", "TIE", "WHITE", "WHITE_WIN", "BLACK_WON", etc.
 * Adjust once you're 100% sure of your WinState values.
 */
function outcome(result: string) {
  const r = normResult(result);

  const draw = r === "draw" || r.includes("draw") || r === "tie";

  // common patterns: "WHITE", "WHITE_WIN", "WHITEWON"
  const whiteWin = r === "white" || (r.includes("white") && (r.includes("win") || r.includes("won")));
  const blackWin = r === "black" || (r.includes("black") && (r.includes("win") || r.includes("won")));

  return { draw, whiteWin, blackWin };
}

export function useStandings() {
  const [data, setData] = useState<StandingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      // ✅ Updated players endpoint
      const [players, games] = await Promise.all([
        getJson<PlayerRead[]>(`${API_BASE}/players/search/all`),
        getJson<GameRead[]>(`${API_BASE}/games/all`),
      ]);

      const map = new Map<string, StandingRow>();

      for (const p of players) {
        map.set(String(p.player_id), {
          player_id: String(p.player_id),
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          rating: Number(p.rating ?? 0),
          wins: 0,
          losses: 0,
          draws: 0,
          games: 0,
        });
      }

      for (const g of games) {
        const whiteId = String(g.player_white_id);
        const blackId = String(g.player_black_id);

        // If a game references a player not in players list, still handle safely
        if (!map.has(whiteId)) {
          map.set(whiteId, {
            player_id: whiteId,
            first_name: "",
            last_name: "",
            rating: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            games: 0,
          });
        }
        if (!map.has(blackId)) {
          map.set(blackId, {
            player_id: blackId,
            first_name: "",
            last_name: "",
            rating: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            games: 0,
          });
        }

        const w = map.get(whiteId)!;
        const b = map.get(blackId)!;

        const { draw, whiteWin, blackWin } = outcome(g.result);

        w.games += 1;
        b.games += 1;

        if (draw) {
          w.draws += 1;
          b.draws += 1;
        } else if (whiteWin) {
          w.wins += 1;
          b.losses += 1;
        } else if (blackWin) {
          b.wins += 1;
          w.losses += 1;
        } else {
          // Unknown result value: count games only (already incremented)
          // You can log once if you want:
          // console.warn("Unknown game result:", g.result);
        }
      }

      setData(Array.from(map.values()));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load standings");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, refresh };
}
