import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { GameRead } from "../types/game";

export function useGamesByTournament(tournamentId: string | undefined) {
  const [data, setData] = useState<GameRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      setError("Missing tournament id");
      return;
    }

    setLoading(true);
    setError(null);

    api.get<GameRead[]>(`/games/tournament?tournament_id=${tournamentId}`)
      .then((res) => setData(Array.isArray(res) ? res : []))
      .catch((e: any) => setError(e?.message ?? "Failed to load games"))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  return { data, loading, error };
}
