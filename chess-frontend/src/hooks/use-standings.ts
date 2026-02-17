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

// change only if your API runs on a different port
const API_BASE = "http://localhost:8000";

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
 * You can tighten this once you paste your WinState enum values.
 * This version is defensive and won't crash on unknown values.
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

      const [players, games] = await Promise.all([
        getJson<PlayerRead[]>(`${API_BASE}/players/all`),
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

        const white = map.get(whiteId);
        const black = map.get(blackId);
        if (!white || !black) continue;

        white.games += 1;
        black.games += 1;

        const o = outcome(g.result);

        if (o.draw) {
          white.draws += 1;
          black.draws += 1;
        } else if (o.whiteWin && !o.blackWin) {
          white.wins += 1;
          black.losses += 1;
        } else if (o.blackWin && !o.whiteWin) {
          black.wins += 1;
          white.losses += 1;
        } else {
          // unknown WinState value -> do nothing except count games
        }
      }

      setData(Array.from(map.values()));
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
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
