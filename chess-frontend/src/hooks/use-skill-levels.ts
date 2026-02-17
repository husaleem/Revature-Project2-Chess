import { useCallback, useEffect, useState } from "react";
import type { SkillLevelRead } from "../api/skillLevels";
import { skillLevelsApi } from "../api/skillLevels";

export function useSkillLevels() {
  const [data, setData] = useState<SkillLevelRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const rows = await skillLevelsApi.list();
      // stable ordering so UI doesn't jump
      rows.sort(
        (a, b) =>
          b.rating_upper_bound - a.rating_upper_bound ||
          b.rating_lower_bound - a.rating_lower_bound ||
          a.title.localeCompare(b.title)
      );
      setData(rows);
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

  return { data, loading, refreshing, error, refresh, setData };
}
