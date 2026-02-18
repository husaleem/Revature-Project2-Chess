// src/hooks/use-violations.ts
import { useCallback, useEffect, useState } from "react";
import { violationsApi, type ViolationRead } from "../api/violations";

export function useViolations() {
  const [data, setData] = useState<ViolationRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const rows = await violationsApi.list();

      // newest first
      rows.sort((a, b) => {
        const ad = new Date(a.violation_date).getTime();
        const bd = new Date(b.violation_date).getTime();
        return bd - ad;
      });

      setData(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load violations");
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

  return { data, loading, refreshing, error, refresh, setData };
}
