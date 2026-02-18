import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCcw, ArrowLeft, ShieldAlert } from "lucide-react";
import { usePlayers } from "../../hooks/use-players";
import { useTournaments } from "../../hooks/use-tournaments";
import { usePlayerDetail } from "../../hooks/use-player-detail";

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function normalizeWinRatePercent(winRate: number | null | undefined) {
  const v = Number(winRate ?? 0);
  if (!Number.isFinite(v)) return 0;
  if (v > 1) return v; // already percent (50, 100)
  return v * 100; // fraction (0.5 -> 50)
}

function outcomeForPlayer(params: {
  result: string;
  meId: string;
  whiteId: string;
  blackId: string;
}) {
  const { result, meId, whiteId, blackId } = params;

  const r = String(result ?? "").toUpperCase();

  if (!meId || (!whiteId && !blackId)) return "—";
  if (r.includes("DRAW")) return "DRAW";

  const amWhite = meId === whiteId;
  const amBlack = meId === blackId;

  if (!amWhite && !amBlack) return "—";

  const whiteWon = r.includes("WHITE") && (r.includes("WIN") || r.includes("WON"));
  const blackWon = r.includes("BLACK") && (r.includes("WIN") || r.includes("WON"));

  if (amWhite && whiteWon) return "WIN";
  if (amWhite && blackWon) return "LOSS";

  if (amBlack && blackWon) return "WIN";
  if (amBlack && whiteWon) return "LOSS";

  return "—";
}

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const card: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  padding: 12,
};

const grid2: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 12,
};

const tableWrap: React.CSSProperties = {
  marginTop: 10,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

export default function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { summary, history, violations, loading, refreshing, error, refresh } = usePlayerDetail(id);

  // Used only for nice labels (not required)
  const { data: players } = usePlayers();
  const { data: tournaments } = useTournaments();

  const me = String(id ?? "");

  // ✅ hooks must always run — do not put hooks after early returns
  const matchRows = useMemo(() => (history?.match_history ?? []) as any[], [history]);

  const computedStats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const g of matchRows) {
      const whiteId = String(g.player_white_id ?? "");
      const blackId = String(g.player_black_id ?? "");
      const result = String(g.result ?? "");

      const out = outcomeForPlayer({ result, meId: me, whiteId, blackId });

      if (out === "WIN") wins++;
      else if (out === "LOSS") losses++;
      else if (out === "DRAW") draws++;
    }

    const total = matchRows.length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    return { wins, losses, draws, total, winRate };
  }, [matchRows, me]);

  const backendWinRatePct = useMemo(
    () => normalizeWinRatePercent(summary?.win_rate),
    [summary?.win_rate]
  );

  const winRatePctToShow = computedStats.total > 0 ? computedStats.winRate : backendWinRatePct;
  const winRateDisplay = `${Math.round(winRatePctToShow * 10) / 10}%`;

  const playerNameById = useMemo(() => {
    const map = new Map<string, string>();
    (players ?? []).forEach((p: any) => {
      const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
      if (p.player_id) map.set(String(p.player_id), name);
    });
    return map;
  }, [players]);

  const tournamentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (tournaments ?? []).forEach((t: any) => {
      if (t.tournament_id) map.set(String(t.tournament_id), String(t.name ?? "Tournament"));
    });
    return map;
  }, [tournaments]);

  const title = summary ? `${summary.first_name} ${summary.last_name}` : "Player";

  // ✅ early returns AFTER all hooks
  if (loading) return <div style={{ padding: 16 }}>Loading player summary...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ ...btn, background: "transparent" }}>
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 12, marginBottom: 6 }}>{title}</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Player Summary & Performance
            {refreshing ? <span style={{ marginLeft: 10, opacity: 0.7 }}>Refreshing…</span> : null}
          </div>
        </div>

        <button onClick={refresh} style={btn}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={grid2}>
        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, textTransform: "uppercase" }}>Profile</div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <Row label="Name" value={title} />
            <Row label="Title" value={summary?.title ?? "—"} />
            <Row label="Rating" value={summary?.rating ?? "—"} accent />
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, textTransform: "uppercase" }}>Stats</div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <Row label="Total Games" value={computedStats.total || summary?.total_games || 0} />
            <Row label="Games Won" value={computedStats.wins} />
            <Row label="Games Lost" value={computedStats.losses} />
            <Row label="Draws" value={computedStats.draws} />
            <Row label="Win Rate" value={winRateDisplay} accent />
          </div>
        </div>
      </div>

      {/* Match History */}
      <div style={{ marginTop: 14, ...card }}>
        <div style={{ fontSize: 14, fontWeight: 900 }}>Match History</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
          Outcome shown relative to <b>{title}</b>
        </div>

        <div style={tableWrap}>
          <div style={{ ...tableHeader, gridTemplateColumns: "1.2fr 1.2fr 0.8fr 1fr 1fr" }}>
            <div>TOURNAMENT</div>
            <div>PLAYED AT</div>
            <div>OUTCOME</div>
            <div>RESULT (RAW)</div>
            <div>OPPONENT</div>
          </div>

          {matchRows.length === 0 ? (
            <div style={{ padding: 14 }}>No matches found.</div>
          ) : (
            matchRows
              .slice()
              .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
              .map((g) => {
                const tid = String(g.tournament_id ?? "");
                const tournamentLabel = tournamentNameById.get(tid) ?? `Tournament ${shortId(tid)}`;

                const whiteId = String(g.player_white_id ?? "");
                const blackId = String(g.player_black_id ?? "");
                const oppId = whiteId === me ? blackId : whiteId;

                const oppName = playerNameById.get(oppId) ?? `Player ${shortId(oppId)}`;

                const outcome = outcomeForPlayer({
                  result: String(g.result ?? ""),
                  meId: me,
                  whiteId,
                  blackId,
                });

                return (
                  <div
                    key={String(g.game_id)}
                    style={{ ...tableRow, gridTemplateColumns: "1.2fr 1.2fr 0.8fr 1fr 1fr" }}
                  >
                    <div style={{ fontWeight: 900, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tournamentLabel}
                    </div>

                    <div style={{ fontWeight: 800, opacity: 0.85 }}>{fmtDate(String(g.played_at))}</div>

                    <div
                      style={{
                        fontWeight: 950,
                        color:
                          outcome === "WIN"
                            ? "rgba(34,197,94,0.95)"
                            : outcome === "LOSS"
                            ? "rgba(248,113,113,0.95)"
                            : "rgba(168,85,247,0.95)",
                      }}
                    >
                      {outcome}
                    </div>

                    <div style={{ fontWeight: 900, opacity: 0.9 }}>{String(g.result ?? "—")}</div>
                    <div style={{ fontWeight: 800, opacity: 0.9 }}>{oppName}</div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Violations */}
      <div style={{ marginTop: 14, ...card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldAlert size={18} />
          <div style={{ fontSize: 14, fontWeight: 900 }}>Violations</div>
        </div>

        <div style={{ marginTop: 10, ...tableWrap }}>
          <div style={{ ...tableHeader, gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.6fr" }}>
            <div>TYPE</div>
            <div>DATE</div>
            <div>GAME</div>
            <div>CONSEQUENCE</div>
          </div>

          {(violations ?? []).length === 0 ? (
            <div style={{ padding: 14 }}>No violations for this player.</div>
          ) : (
            (violations ?? [])
              .slice()
              .sort((a, b) => new Date(b.violation_date).getTime() - new Date(a.violation_date).getTime())
              .map((v) => (
                <div
                  key={v.violation_id}
                  style={{ ...tableRow, gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.6fr" }}
                >
                  <div style={{ fontWeight: 900 }}>{v.violation_type}</div>
                  <div style={{ fontWeight: 800, opacity: 0.85 }}>{fmtDate(v.violation_date)}</div>
                  <div style={{ fontWeight: 800, opacity: 0.9 }}>{shortId(v.game_id)}</div>
                  <div style={{ opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.consequence ?? "—"}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div
        style={{
          fontWeight: 950,
          color: accent ? "rgba(168,85,247,0.95)" : "rgba(255,255,255,0.92)",
          textAlign: "right",
        }}
      >
        {value}
      </div>
    </div>
  );
}
