// src/hooks/use-player-detail.ts
import { useCallback, useEffect, useState } from "react";
import { relationsApi, type PlayerMatchHistoryRead, type PlayerSummary } from "../api/relations";
import { violationsApi, type ViolationRead } from "../api/violations";

export function usePlayerDetail(playerId: string | undefined) {
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [history, setHistory] = useState<PlayerMatchHistoryRead | null>(null);
  const [violations, setViolations] = useState<ViolationRead[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (!playerId) return;

      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      try {
        const [s, h, v] = await Promise.all([
          relationsApi.playerSummaryById(playerId),
          relationsApi.playerMatchHistory(playerId),
          violationsApi.byPlayer(playerId),
        ]);

        setSummary(s);
        setHistory(h);
        setViolations(v ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load player detail.");
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [playerId]
  );

  useEffect(() => {
    if (!playerId) return;
    load(false);
  }, [playerId, load]);

  const refresh = useCallback(async () => {
    const y = window.scrollY;
    await load(true);
    window.scrollTo(0, y);
  }, [load]);

  return { summary, history, violations, loading, refreshing, error, refresh };
}
