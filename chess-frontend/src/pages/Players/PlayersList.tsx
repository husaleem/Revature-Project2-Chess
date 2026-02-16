import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import type { PlayerRead } from "../../types/player";

export default function PlayersList() {
  const [players, setPlayers] = useState<PlayerRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get<PlayerRead[]>("/players/all");
        setPlayers(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load players");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return players;
    return players.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
    );
  }, [players, q]);

  if (loading) return <div style={{ padding: 16 }}>Loading players…</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Players</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search players..."
        style={{ padding: 8, width: 280, margin: "12px 0" }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.player_id}>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                {p.first_name} {p.last_name}
              </td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                {p.rating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}