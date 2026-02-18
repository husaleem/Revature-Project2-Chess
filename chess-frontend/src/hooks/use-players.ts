import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { PlayerRead } from "../types/player";

export function usePlayers() {
  const [data, setData] = useState<PlayerRead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PlayerRead[]>("/players/search/all")
      .then(setData)
      .catch((e: any) => setError(e?.message ?? "Failed to load players"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
