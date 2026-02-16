import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { GameRead } from "../types/game";

export function useGames() {
  const [data, setData] = useState<GameRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<GameRead[]>("/games/all")
      .then(setData)
      .catch((e: any) => setError(e?.message ?? "Failed to load games"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
