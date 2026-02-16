import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { TournamentRead } from "../types/tournament";

export function useTournaments() {
  const [data, setData] = useState<TournamentRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<TournamentRead[]>("/tournaments")
      .then(setData)
      .catch((e: any) => setError(e?.message ?? "Failed to load tournaments"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
