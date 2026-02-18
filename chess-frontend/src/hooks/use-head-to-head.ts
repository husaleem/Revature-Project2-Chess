// src/hooks/use-head-to-head.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { relationsApi, type PlayerMatchHistoryRead, type GameRead } from "../api/relations";

type HeadToHeadStats = {
  total: number;
  aWins: number;
  bWins: number;
  draws: number;
  aWinRate: number; // percent 0..100
};

function outcomeForPlayer(params: {
  result: string;
  meId: string;
  whiteId: string;
  blackId: string;
}) {
  const { result, meId, whiteId, blackId } = params;
  const r = String(result ?? "").toUpperCase();

  if (!meId || (!whiteId && !blackId)) return "—";
  if (r.includes("DRAW")) return "DRAW";

  const amWhite = meId === whiteId;
  const amBlack = meId === blackId;
  if (!amWhite && !amBlack) return "—";

  const whiteWon = r.includes("WHITE") && (r.includes("WIN") || r.includes("WON"));
  const blackWon = r.includes("BLACK") && (r.includes("WIN") || r.includes("WON"));

  if (amWhite && whiteWon) return "WIN";
  if (amWhite && blackWon) return "LOSS";

  if (amBlack && blackWon) return "WIN";
  if (amBlack && whiteWon) return "LOSS";

  return "—";
}

export function useHeadToHead(playerAId: string | null, playerBId: string | null) {
  const [historyA, setHistoryA] = useState<PlayerMatchHistoryRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (!playerAId || !playerBId || playerAId === playerBId) return;

      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      try {
        // Only need A's history; then filter by games where opponent == B
        const a = await relationsApi.playerMatchHistory(playerAId);
        setHistoryA(a);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load head-to-head.");
        setHistoryA(null);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [playerAId, playerBId]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const gamesBetween = useMemo(() => {
    if (!playerAId || !playerBId) return [];
    const base = (historyA?.match_history ?? []) as GameRead[];

    return base.filter((g) => {
      const w = String(g.player_white_id ?? "");
      const b = String(g.player_black_id ?? "");
      const opp = w === playerAId ? b : w;
      return opp === playerBId;
    });
  }, [historyA, playerAId, playerBId]);

  const stats: HeadToHeadStats = useMemo(() => {
    if (!playerAId || !playerBId) return { total: 0, aWins: 0, bWins: 0, draws: 0, aWinRate: 0 };

    let aWins = 0;
    let bWins = 0;
    let draws = 0;

    for (const g of gamesBetween) {
      const whiteId = String(g.player_white_id ?? "");
      const blackId = String(g.player_black_id ?? "");
      const res = String(g.result ?? "");

      const aOutcome = outcomeForPlayer({ result: res, meId: playerAId, whiteId, blackId });

      if (aOutcome === "WIN") aWins++;
      else if (aOutcome === "LOSS") bWins++;
      else if (aOutcome === "DRAW") draws++;
    }

    const total = gamesBetween.length;
    const aWinRate = total > 0 ? (aWins / total) * 100 : 0;

    return { total, aWins, bWins, draws, aWinRate };
  }, [gamesBetween, playerAId, playerBId]);

  const refresh = useCallback(async () => {
    const y = window.scrollY;
    await load(true);
    window.scrollTo(0, y);
  }, [load]);

  return { gamesBetween, stats, historyA, loading, refreshing, error, refresh };
}
