import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTournament } from "../../hooks/use-tournament";
import { useGamesByTournament } from "../../hooks/use-games-by-tournament";
import { api } from "../../api/client";

type TabKey = "overview" | "games";

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

export default function TournamentDetail() {
  const { id } = useParams();
  const tournament = useTournament(id);
  const gamesHook: any = useGamesByTournament(id);

  const [tab, setTab] = useState<TabKey>("overview");
  const [generating, setGenerating] = useState(false);

  const games = gamesHook?.data ?? [];
  const gamesLoading = !!gamesHook?.loading;
  const gamesError = gamesHook?.error ?? null;

  const tournamentId = useMemo(() => {
    const t = tournament.data as any;
    return String(t?.tournament_id ?? id ?? "");
  }, [tournament.data, id]);

  async function generateBracket() {
    if (!tournamentId) return alert("Missing tournament id.");
    const ok = window.confirm(
      "Generate bracket for this tournament?\n\nThis will create scheduled games (result/played_at empty) based on current players."
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const msg = await api.get<string>(`/games/generate-tournament-bracket/${encodeURIComponent(tournamentId)}`);
      alert(typeof msg === "string" ? msg : "Bracket generated.");

      // Prefer hook refresh if it exists
      if (typeof gamesHook?.refresh === "function") {
        await gamesHook.refresh();
      } else {
        window.location.reload();
      }
    } catch (e: any) {
      alert(e?.message ?? "Failed to generate bracket.");
    } finally {
      setGenerating(false);
    }
  }

  if (tournament.loading) return <div style={{ padding: 16 }}>Loading tournament...</div>;
  if (tournament.error) return <div style={{ padding: 16, color: "salmon" }}>Error: {tournament.error}</div>;
  if (!tournament.data) return <div style={{ padding: 16 }}>Tournament not found.</div>;

  const t = tournament.data as any;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/tournaments" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
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
      <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabButton>

        <TabButton active={tab === "games"} onClick={() => setTab("games")}>
          Games
        </TabButton>

        <TabButton active={false} disabled>
          Standings (soon)
        </TabButton>

        {/* Quick action: generate bracket (only if on games tab) */}
        {tab === "games" && (
          <button
            disabled={generating || gamesLoading || (games?.length ?? 0) > 0}
            onClick={generateBracket}
            style={{
              marginLeft: "auto",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: (games?.length ?? 0) > 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.10)",
              color: (games?.length ?? 0) > 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
              cursor: (games?.length ?? 0) > 0 ? "not-allowed" : "pointer",
              fontWeight: 900,
            }}
            title={(games?.length ?? 0) > 0 ? "Games already exist for this tournament" : "Generate scheduled games"}
          >
            {generating ? "Generating..." : "Generate Bracket"}
          </button>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        {tab === "games" ? (
          <GamesPanel
            tournamentId={tournamentId}
            loading={gamesLoading}
            error={gamesError}
            games={games}
          />
        ) : (
          <div style={{ opacity: 0.85 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Overview</div>
            <div style={{ opacity: 0.8 }}>
              This tab can hold summary stats later (players count, rounds, current leader).
            </div>
          </div>
        )}
      </div>

      {/* Debug */}
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
        {JSON.stringify({ tournament: tournament.data, games }, null, 2)}
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
    return (
      <div style={{ opacity: 0.85 }}>
        No games found for this tournament yet. Click <b>Generate Bracket</b> to create scheduled games.
      </div>
    );
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
      <div style={{ padding: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
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
            <tr key={g.game_id ?? g.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {shortId(String(g.game_id ?? g.id))}
              </td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {shortId(String(g.player_white_id ?? ""))}
              </td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {shortId(String(g.player_black_id ?? ""))}
              </td>
              <td style={{ padding: 12 }}>{g.result ?? "SCHEDULED"}</td>
              <td style={{ padding: 12 }}>{g.played_at ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
