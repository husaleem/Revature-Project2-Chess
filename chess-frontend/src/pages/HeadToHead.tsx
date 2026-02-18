import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCcw, Swords } from "lucide-react";
import { usePlayers } from "../hooks/use-players";
import { useTournaments } from "../hooks/use-tournaments";
import { useHeadToHead } from "../hooks/use-head-to-head";

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.9)",
  outline: "none",
};

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

const tableWrap: React.CSSProperties = {
  marginTop: 10,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1.2fr 1fr 1fr 1fr",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1.2fr 1fr 1fr 1fr",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

export default function HeadToHead() {
  const navigate = useNavigate();
  const { data: players, loading: playersLoading, error: playersError } = usePlayers();
  const { data: tournaments } = useTournaments();

  const sortedPlayers = useMemo(() => {
    return (players ?? []).slice().sort((a: any, b: any) => {
      const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
      const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
      return an.localeCompare(bn);
    });
  }, [players]);

  const [playerAId, setPlayerAId] = useState<string | null>(() => {
    const first = sortedPlayers?.[0]?.player_id ? String(sortedPlayers[0].player_id) : null;
    return first;
  });

  const [playerBId, setPlayerBId] = useState<string | null>(() => {
    const second = sortedPlayers?.[1]?.player_id ? String(sortedPlayers[1].player_id) : null;
    return second;
  });

  // If sortedPlayers changes (first load), ensure A/B are initialized
  React.useEffect(() => {
    if (!sortedPlayers || sortedPlayers.length === 0) return;
    if (!playerAId) setPlayerAId(String(sortedPlayers[0].player_id));
    if (!playerBId && sortedPlayers.length > 1) setPlayerBId(String(sortedPlayers[1].player_id));
  }, [sortedPlayers]); // intentionally not depending on playerAId/playerBId to avoid over-resetting

  const { gamesBetween, stats, loading, refreshing, error, refresh } = useHeadToHead(playerAId, playerBId);

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

  const aName = playerAId ? playerNameById.get(playerAId) ?? `Player ${shortId(playerAId)}` : "Player A";
  const bName = playerBId ? playerNameById.get(playerBId) ?? `Player ${shortId(playerBId)}` : "Player B";

  const aWinRate = `${Math.round((stats.aWinRate ?? 0) * 10) / 10}%`;

  if (playersLoading) return <div style={{ padding: 16 }}>Loading players...</div>;
  if (playersError) return <div style={{ padding: 16, color: "salmon" }}>Error: {playersError}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <Swords size={22} />
            Head-to-Head
          </h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Compare two players using match history.
            {refreshing ? <span style={{ marginLeft: 10, opacity: 0.7 }}>Refreshing…</span> : null}
          </div>
        </div>

        <button onClick={refresh} style={btn} disabled={loading || !playerAId || !playerBId || playerAId === playerBId}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Selectors */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, textTransform: "uppercase" }}>Player A</div>
          <select
            value={playerAId ?? ""}
            onChange={(e) => setPlayerAId(e.target.value || null)}
            style={{ ...inputStyle, marginTop: 10, cursor: "pointer", background: "#0b0b0f" }}
          >
            {sortedPlayers.map((p: any) => {
              const id = String(p.player_id);
              const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
              return (
                <option key={id} value={id}>
                  {name} ({shortId(id)})
                </option>
              );
            })}
          </select>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>View detail</div>
            <button
              style={{ ...btn, padding: "8px 10px", background: "transparent" }}
              onClick={() => playerAId && navigate(`/players/${playerAId}`)}
              disabled={!playerAId}
            >
              Open
            </button>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800, textTransform: "uppercase" }}>Player B</div>
          <select
            value={playerBId ?? ""}
            onChange={(e) => setPlayerBId(e.target.value || null)}
            style={{ ...inputStyle, marginTop: 10, cursor: "pointer", background: "#0b0b0f" }}
          >
            {sortedPlayers.map((p: any) => {
              const id = String(p.player_id);
              const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
              return (
                <option key={id} value={id}>
                  {name} ({shortId(id)})
                </option>
              );
            })}
          </select>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>View detail</div>
            <button
              style={{ ...btn, padding: "8px 10px", background: "transparent" }}
              onClick={() => playerBId && navigate(`/players/${playerBId}`)}
              disabled={!playerBId}
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {/* Validation */}
      {playerAId && playerBId && playerAId === playerBId ? (
        <div style={{ marginTop: 12, color: "salmon", fontSize: 13 }}>
          Choose two different players.
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 12, color: "salmon", fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      {/* Metrics */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>TOTAL GAMES</div>
          <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8 }}>{stats.total}</div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{aName.toUpperCase()} WINS</div>
          <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8, color: "rgba(34,197,94,0.95)" }}>
            {stats.aWins}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{bName.toUpperCase()} WINS</div>
          <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8, color: "rgba(248,113,113,0.95)" }}>
            {stats.bWins}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>A WIN RATE</div>
          <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8, color: "rgba(168,85,247,0.95)" }}>
            {aWinRate}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Draws: {stats.draws}
          </div>
        </div>
      </div>

      {/* Games table */}
      <div style={{ marginTop: 14, ...card }}>
        <div style={{ fontSize: 14, fontWeight: 900 }}>
          Games between <span style={{ color: "rgba(168,85,247,0.95)" }}>{aName}</span> and{" "}
          <span style={{ color: "rgba(168,85,247,0.95)" }}>{bName}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
          Showing games from Player A match history filtered to Player B.
        </div>

        <div style={tableWrap}>
          <div style={tableHeader}>
            <div>TOURNAMENT</div>
            <div>PLAYED AT</div>
            <div>WHITE</div>
            <div>BLACK</div>
            <div>RESULT</div>
          </div>

          {loading ? (
            <div style={{ padding: 14 }}>Loading head-to-head...</div>
          ) : gamesBetween.length === 0 ? (
            <div style={{ padding: 14 }}>No head-to-head games found.</div>
          ) : (
            gamesBetween
              .slice()
              .sort((a: any, b: any) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
              .map((g: any) => {
                const tname = tournamentNameById.get(String(g.tournament_id)) ?? `Tournament ${shortId(g.tournament_id)}`;
                const whiteName = playerNameById.get(String(g.player_white_id)) ?? `Player ${shortId(g.player_white_id)}`;
                const blackName = playerNameById.get(String(g.player_black_id)) ?? `Player ${shortId(g.player_black_id)}`;

                return (
                  <div key={String(g.game_id)} style={tableRow}>
                    <div style={{ fontWeight: 900, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tname}
                    </div>
                    <div style={{ fontWeight: 800, opacity: 0.85 }}>{fmtDate(String(g.played_at))}</div>
                    <div style={{ fontWeight: 800, opacity: 0.95 }}>{whiteName}</div>
                    <div style={{ fontWeight: 800, opacity: 0.95 }}>{blackName}</div>
                    <div style={{ fontWeight: 950 }}>{String(g.result ?? "—")}</div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
