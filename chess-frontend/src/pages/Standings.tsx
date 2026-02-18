import React, { useMemo, useState } from "react";
import { useStandings } from "../hooks/use-standings";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

type SortKey = "rating_desc" | "rating_asc" | "wins_desc" | "games_desc" | "name_asc";

export default function Standings() {
  const { data, loading, refreshing, error, refresh } = useStandings();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("wins_desc");

  const rows = useMemo(() => {
    const q = normalize(query);

    // normalize unknown backend keys safely
    const mapped = (data ?? []).map((r: any) => {
      const first = r.first_name ?? r.firstName ?? "";
      const last = r.last_name ?? r.lastName ?? "";
      const full_name = `${first} ${last}`.trim() || r.name || "Unknown Player";

      return {
        ...r,
        full_name,
        rating: Number(r.rating ?? 0),
        wins: Number(r.wins ?? r.win_count ?? r.wins_count ?? 0),
        losses: Number(r.losses ?? r.loss_count ?? 0),
        draws: Number(r.draws ?? r.draw_count ?? 0),
        games: Number(r.games ?? r.game_count ?? r.total_games ?? 0),
      };
    });

    const filtered = !q
      ? mapped
      : mapped.filter((r: any) => normalize(r.full_name).includes(q));

    const byName = (a: any, b: any) => normalize(a.full_name).localeCompare(normalize(b.full_name));

    return [...filtered].sort((a: any, b: any) => {
      switch (sort) {
        case "rating_desc":
          return b.rating - a.rating;
        case "rating_asc":
          return a.rating - b.rating;
        case "wins_desc":
          return b.wins - a.wins;
        case "games_desc":
          return b.games - a.games;
        case "name_asc":
          return byName(a, b);
        default:
          return 0;
      }
    });
  }, [data, query, sort]);

  if (loading) return <div style={{ padding: 16 }}>Loading standings...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Standings</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Player summary across games (wins / losses / draws / totals).
          </div>

          {refreshing && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Refreshing…
            </div>
          )}
        </div>

        <button
          onClick={refresh}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search player name..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.9)",
            outline: "none",
          }}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0b0b0f",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="wins_desc">Wins (High → Low)</option>
          <option value="games_desc">Games (High → Low)</option>
          <option value="rating_desc">Rating (High → Low)</option>
          <option value="rating_asc">Rating (Low → High)</option>
          <option value="name_asc">Name (A → Z)</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: 12,
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            fontSize: 12,
            opacity: 0.75,
            fontWeight: 800,
          }}
        >
          <div>PLAYER</div>
          <div>RATING</div>
          <div>WINS</div>
          <div>LOSSES</div>
          <div>DRAWS</div>
          <div>GAMES</div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 14 }}>No standings found.</div>
        ) : (
          rows.map((r: any, idx: number) => (
            <div
              key={r.player_id ?? r.id ?? `${r.full_name}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                gap: 12,
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.full_name}
              </div>

              <div style={{ fontWeight: 900 }}>{r.rating || "—"}</div>
              <div style={{ fontWeight: 800 }}>{r.wins}</div>
              <div style={{ fontWeight: 800, opacity: 0.85 }}>{r.losses}</div>
              <div style={{ fontWeight: 800, opacity: 0.85 }}>{r.draws}</div>
              <div style={{ fontWeight: 900 }}>{r.games}</div>
            </div>
          ))
        )}
      </div>

      {/* Debug (remove later) */}
      <pre
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
