// src/hooks/use-analytics.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { relationsApi, type PlayerTopStats, type PlayerSummary } from "../api/relations";

export function useAnalytics() {
  const [topPlayers, setTopPlayers] = useState<PlayerTopStats[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<PlayerSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopPlayers = useCallback(async (isRefresh: boolean) => {
    setError(null);
    isRefresh ? setRefreshing(true) : setLoading(true);

    try {
      const rows = await relationsApi.topPlayers();
      setTopPlayers(rows ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics.");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopPlayers(false);
  }, [loadTopPlayers]);

  const refresh = useCallback(async () => {
    const y = window.scrollY;
    await loadTopPlayers(true);
    window.scrollTo(0, y);
  }, [loadTopPlayers]);

  const loadSummary = useCallback(async (playerId: string) => {
    try {
      setSelectedPlayerId(playerId);
      const summary = await relationsApi.playerSummaryById(playerId);
      setSelectedSummary(summary);
    } catch (e) {
      // keep silent; page shows summary only if it works
      setSelectedSummary(null);
    }
  }, []);

  const metrics = useMemo(() => {
    const rows = topPlayers ?? [];

    const byRating = [...rows].sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity));
    const byWinLoss = [...rows].sort((a, b) => (b.winLoss ?? -Infinity) - (a.winLoss ?? -Infinity));
    const byOpp = [...rows].sort((a, b) => (b.avgOppRating ?? -Infinity) - (a.avgOppRating ?? -Infinity));

    const topRated = byRating[0] ?? null;
    const bestWinLoss = byWinLoss[0] ?? null;
    const toughestSchedule = byOpp[0] ?? null;

    return { topRated, bestWinLoss, toughestSchedule };
  }, [topPlayers]);

  return {
    topPlayers,
    metrics,
    selectedPlayerId,
    selectedSummary,
    loadSummary,
    loading,
    refreshing,
    error,
    refresh,
  };
}
