import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { TournamentRead } from "../types/tournament";

export function useTournament(id: string | undefined) {
  const [data, setData] = useState<TournamentRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing tournament id");
      return;
    }

    setLoading(true);
    setError(null);

    api.get<TournamentRead>(`/tournaments/${id}`)
      .then(setData)
      .catch((e: any) => setError(e?.message ?? "Failed to load tournament"))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
