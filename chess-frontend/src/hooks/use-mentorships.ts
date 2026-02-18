import { useCallback, useEffect, useState } from "react";
import { mentorshipsApi } from "../api/mentorships";
import type { MentorshipRead } from "../api/mentorships";

export function useMentorships() {
  const [data, setData] = useState<MentorshipRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const rows = await mentorshipsApi.list();

      // Stable ordering (mentor_id then player_id) so UI doesn't jump
      rows.sort((a, b) => {
        const m = String(a.mentor_id).localeCompare(String(b.mentor_id));
        if (m !== 0) return m;
        return String(a.player_id).localeCompare(String(b.player_id));
      });

      setData(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load mentorships");
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

  return { data, setData, loading, refreshing, error, refresh };
}
