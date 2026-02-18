import React, { useMemo } from "react";
import { RefreshCcw, Trophy, TrendingUp, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAnalytics } from "../hooks/use-analytics";

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

function fullName(p?: { first_name?: string; last_name?: string }) {
  const n = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
  return n || "Unnamed Player";
}

const pageWrap: React.CSSProperties = { padding: 16 };

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const h1Style: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginBottom: 6 };
const subStyle: React.CSSProperties = { opacity: 0.75, fontSize: 13 };

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

const cardGrid: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const card: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  minWidth: 0,
};

const cardLabel: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const cardValue: React.CSSProperties = { marginTop: 6, fontSize: 22, fontWeight: 950 };
const cardSub: React.CSSProperties = { marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.4 };

const panel: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  minWidth: 0,
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
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr 120px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr 120px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

export default function Analytics() {
  const {
    topPlayers,
    metrics,
    selectedSummary,
    loadSummary,
    loading,
    refreshing,
    error,
    refresh,
  } = useAnalytics();

  const chartData = useMemo(() => {
    const rows = [...(topPlayers ?? [])]
      .sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity))
      .slice(0, 10);

    return rows.map((p) => ({
      name: fullName(p),
      rating: p.rating ?? 0,
    }));
  }, [topPlayers]);

  if (loading) return <div style={{ padding: 16 }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={pageWrap}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Analytics</h1>
          <div style={subStyle}>
            Insights powered by <span style={{ fontWeight: 900 }}>/relations</span>.
            {refreshing ? <span style={{ marginLeft: 10, opacity: 0.7 }}>Refreshing…</span> : null}
          </div>
        </div>

        <button onClick={refresh} style={btn}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div style={cardGrid}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={cardLabel}>Top Rated</div>
              <div style={cardValue}>{metrics.topRated ? fullName(metrics.topRated) : "—"}</div>
              <div style={cardSub}>
                Rating: <span style={{ fontWeight: 900 }}>{metrics.topRated?.rating ?? "—"}</span>
              </div>
            </div>
            <div style={{ opacity: 0.9 }}>
              <Trophy />
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={cardLabel}>Best Win/Loss</div>
              <div style={cardValue}>{metrics.bestWinLoss ? fullName(metrics.bestWinLoss) : "—"}</div>
              <div style={cardSub}>
                Win/Loss: <span style={{ fontWeight: 900 }}>{metrics.bestWinLoss?.winLoss ?? "—"}</span> • Draw%:{" "}
                <span style={{ fontWeight: 900 }}>{metrics.bestWinLoss?.drawPercent ?? 0}</span>
              </div>
            </div>
            <div style={{ opacity: 0.9 }}>
              <TrendingUp />
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={cardLabel}>Toughest Schedule</div>
              <div style={cardValue}>{metrics.toughestSchedule ? fullName(metrics.toughestSchedule) : "—"}</div>
              <div style={cardSub}>
                Avg Opp Rating: <span style={{ fontWeight: 900 }}>{metrics.toughestSchedule?.avgOppRating ?? "—"}</span>
              </div>
            </div>
            <div style={{ opacity: 0.9 }}>
              <Shield />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={panel}>
        <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Top Players by Rating</div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              {/* ✅ Purple gradient */}
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.55} />
                </linearGradient>

                {/* optional glow */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0f",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "rgba(255,255,255,0.9)",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.85)" }}
              />

              <Bar dataKey="rating" fill="url(#purpleGradient)" filter="url(#glow)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table + “Inspect Player” */}
      <div style={panel}>
        <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Top Players (Stats)</div>

        <div style={tableWrap}>
          <div style={tableHeader}>
            <div>PLAYER</div>
            <div>RATING</div>
            <div>WIN/LOSS</div>
            <div>AVG OPP</div>
            <div style={{ textAlign: "right" }}>ACTIONS</div>
          </div>

          {(topPlayers ?? []).length === 0 ? (
            <div style={{ padding: 14 }}>No top players returned.</div>
          ) : (
            [...topPlayers]
              .sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity))
              .map((p) => (
                <div key={p.player_id} style={tableRow}>
                  <div style={{ fontWeight: 900, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fullName(p)} <span style={{ opacity: 0.55, fontWeight: 800 }}>({shortId(p.player_id)})</span>
                  </div>
                  <div style={{ fontWeight: 900 }}>{p.rating ?? "—"}</div>
                  <div style={{ fontWeight: 900 }}>{p.winLoss ?? "—"}</div>
                  <div style={{ fontWeight: 900 }}>{p.avgOppRating ?? "—"}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button style={btn} onClick={() => loadSummary(p.player_id)}>
                      Inspect
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {selectedSummary && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.02)",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 14 }}>
              Player Summary: {selectedSummary.first_name} {selectedSummary.last_name}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span>
                <span style={{ opacity: 0.7 }}>Rating:</span> <b>{selectedSummary.rating}</b>
              </span>
              <span>
                <span style={{ opacity: 0.7 }}>Title:</span> <b>{selectedSummary.title}</b>
              </span>
              <span>
                <span style={{ opacity: 0.7 }}>Total Games:</span> <b>{selectedSummary.total_games}</b>
              </span>
              <span>
                <span style={{ opacity: 0.7 }}>Win Rate:</span> <b>{selectedSummary.win_rate}</b>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
