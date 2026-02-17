import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTournament } from "../../hooks/use-tournament";
import { useGamesByTournament } from "../../hooks/use-games-by-tournament";

type TabKey = "overview" | "games";

export default function TournamentDetail() {
  const { id } = useParams();

  const tournament = useTournament(id);
  const games = useGamesByTournament(id);

  const [tab, setTab] = useState<TabKey>("overview");

  if (tournament.loading) return <div style={{ padding: 16 }}>Loading tournament...</div>;
  if (tournament.error) return <div style={{ padding: 16, color: "salmon" }}>Error: {tournament.error}</div>;
  if (!tournament.data) return <div style={{ padding: 16 }}>Tournament not found.</div>;

  const t = tournament.data as any;

  return (
    <div style={{ padding: 16 }}>
      <Link
        to="/tournaments"
        style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}
      >
        ← Back to tournaments
      </Link>

      <h1 style={{ marginTop: 12, fontSize: 28, fontWeight: 800 }}>
        {t.name ?? "Tournament"}
      </h1>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <Row label="Tournament ID" value={t.tournament_id ?? id} />
        <Row label="Location" value={t.location ?? "—"} />
        <Row label="Start Date" value={t.start_date ?? "—"} />
        <Row label="End Date" value={t.end_date ?? "—"} />
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabButton>

        <TabButton active={tab === "games"} onClick={() => setTab("games")}>
          Games
        </TabButton>

        <TabButton active={false} disabled>
          Standings (soon)
        </TabButton>
      </div>

      <div style={{ marginTop: 14 }}>
        {tab === "games" ? (
          <GamesPanel
            tournamentId={t.tournament_id ?? id}
            loading={games.loading}
            error={games.error}
            games={games.data}
          />
        ) : (
          <div style={{ opacity: 0.85 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Overview</div>
            <div style={{ opacity: 0.8 }}>
              This tab will hold summary stats (players count, rounds, current leader) once the standings endpoint is added.
            </div>
          </div>
        )}
      </div>

      {/* Debug: keep for now */}
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
        {JSON.stringify(tournament.data, null, 2)}
      </pre>
    </div>
  );
}

function GamesPanel({
  tournamentId,
  loading,
  error,
  games,
}: {
  tournamentId: string;
  loading: boolean;
  error: string | null;
  games: any[];
}) {
  if (loading) return <div>Loading games...</div>;
  if (error) return <div style={{ color: "salmon" }}>Error loading games: {error}</div>;

  if (!games?.length) {
    return <div>No games found for this tournament.</div>;
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 12,
          fontWeight: 700,
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        Games ({games.length})
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", opacity: 0.75 }}>
            <th style={{ padding: 12 }}>Game ID</th>
            <th style={{ padding: 12 }}>White</th>
            <th style={{ padding: 12 }}>Black</th>
            <th style={{ padding: 12 }}>Result</th>
            <th style={{ padding: 12 }}>Played At</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g: any) => (
            <tr
              key={g.game_id ?? g.id}
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {String(g.game_id ?? g.id)}
              </td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {g.player_white_id ?? "—"}
              </td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {g.player_black_id ?? "—"}
              </td>
              <td style={{ padding: 12 }}>{g.result ?? "—"}</td>
              <td style={{ padding: 12 }}>{g.played_at ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Debug games payload (optional) */}
      <details style={{ padding: 12, opacity: 0.9 }}>
        <summary style={{ cursor: "pointer" }}>Debug games JSON</summary>
        <pre style={{ marginTop: 10, fontSize: 12, overflow: "auto" }}>
          {JSON.stringify({ tournamentId, games }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <div style={{ width: 130, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{String(value)}</div>
    </div>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(255,255,255,0.10)" : "transparent",
        color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
