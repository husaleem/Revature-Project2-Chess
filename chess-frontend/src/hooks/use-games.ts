import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { GameRead } from "../types/game";

export function useGames() {
  const [data, setData] = useState<GameRead[]>([]);
  const [loading, setLoading] = useState(true); // only for initial load
  const [refreshing, setRefreshing] = useState(false); // for button updates
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // IMPORTANT: don't flip loading=true (that causes the jump)
    setRefreshing(true);
    setError(null);

    try {
      const res = await api.get<GameRead[]>("/games/all");
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load games");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<GameRead[]>("/games/all");
        setData(res);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load games");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, refreshing, error, refresh, setData };
}
