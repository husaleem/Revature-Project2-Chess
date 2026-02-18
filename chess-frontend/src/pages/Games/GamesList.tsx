import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../../api/client";
import { useGames } from "../../hooks/use-games";

type WinState = "WHITE_WIN" | "BLACK_WIN" | "DRAW";
const WIN_STATES: WinState[] = ["WHITE_WIN", "BLACK_WIN", "DRAW"];

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function asStr(v: unknown) {
  return v == null ? "" : String(v);
}

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}…` : "—";
}

function fmtDateTime(v: any) {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

function badgeStyle(result?: string): React.CSSProperties {
  const raw = (result ?? "").trim();
  const r = raw.toUpperCase();

  // Ongoing / unknown result
  if (!raw || r === "ONGOING" || r === "NO RESULT") {
    return {
      border: "1px solid rgba(156,163,175,0.25)",
      background: "rgba(156,163,175,0.12)",
      color: "rgba(229,231,235,0.95)",
    };
  }

  if (r === "WHITE_WIN") {
    return {
      border: "1px solid rgba(34,197,94,0.25)",
      background: "rgba(34,197,94,0.12)",
      color: "rgba(34,197,94,0.95)",
    };
  }
  if (r === "BLACK_WIN") {
    return {
      border: "1px solid rgba(59,130,246,0.25)",
      background: "rgba(59,130,246,0.12)",
      color: "rgba(59,130,246,0.95)",
    };
  }
  if (r === "DRAW") {
    return {
      border: "1px solid rgba(245,158,11,0.25)",
      background: "rgba(245,158,11,0.12)",
      color: "rgba(245,158,11,0.95)",
    };
  }

  return {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.9)",
  };
}

export default function GamesList() {
  const { data, loading, refreshing, error, refresh } = useGames();

  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ✅ Filter + stable sort so cards don't "randomly jump" after refresh
  // Sort order: played_at desc, fallback game_id asc
  const filtered = useMemo(() => {
    const q = normalize(query);
    const list = data ?? [];

    const base = !q
      ? list
      : list.filter((g: any) => {
          const haystack = normalize(
            [g.game_id, g.tournament_id, g.player_white_id, g.player_black_id, g.result, g.played_at]
              .map(asStr)
              .join(" ")
          );
          return haystack.includes(q);
        });

    return [...base].sort((a: any, b: any) => {
      const aT = a.played_at ? new Date(a.played_at).getTime() : 0;
      const bT = b.played_at ? new Date(b.played_at).getTime() : 0;

      if (bT !== aT) return bT - aT;

      const aId = String(a.game_id ?? "");
      const bId = String(b.game_id ?? "");
      return aId.localeCompare(bId);
    });
  }, [data, query]);

  if (loading) return <div style={{ padding: 16 }}>Loading games...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Games</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Create games, update results, and manage tournament match records.
          </div>

          {refreshing && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Refreshing…
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
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
          + Create Game
        </button>
      </div>

      {/* Search */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by game id, tournament id, player id, result..."
          style={{
            flex: 1,
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.9)",
            outline: "none",
          }}
        />
      </div>

      {/* Stacked list (horizontal cards) */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filtered.length === 0 ? (
          <div>No games found.</div>
        ) : (
          filtered.map((g: any) => {
            const gameId = String(g.game_id ?? "");
            const tournamentId = String(g.tournament_id ?? "");
            const whiteId = g.player_white_id ? String(g.player_white_id) : "";
            const blackId = g.player_black_id ? String(g.player_black_id) : "";
            const resultRaw = g.result ? String(g.result) : "";
            const badgeText = resultRaw || "ONGOING";
            const playedAt = g.played_at;

            return (
              <div
                key={gameId || `${tournamentId}-${whiteId}-${blackId}-${badgeText}`}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {/* Row layout */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.2fr 1.2fr 1.2fr 1.2fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {/* Game */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>GAME</div>
                    <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {shortId(gameId)}
                    </div>
                  </div>

                  {/* Tournament */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>TOURNAMENT</div>
                    <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {shortId(tournamentId)}
                    </div>
                  </div>

                  {/* White */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>WHITE</div>
                    <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {whiteId ? shortId(whiteId) : "—"}
                    </div>
                  </div>

                  {/* Black */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>BLACK</div>
                    <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {blackId ? shortId(blackId) : "—"}
                    </div>
                  </div>

                  {/* Played */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>PLAYED AT</div>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {fmtDateTime(playedAt)}
                    </div>
                  </div>

                  {/* Result */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        ...badgeStyle(badgeText),
                      }}
                    >
                      {badgeText}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Quick updates */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {WIN_STATES.map((w) => (
                      <button
                        key={w}
                        onClick={async () => {
                          try {
                            await api.patch(
                              `/games/update/result?game_id=${encodeURIComponent(gameId)}&result=${encodeURIComponent(w)}`
                            );
                            await refresh();
                          } catch {
                            alert("Failed to update result.");
                          }
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.9)",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {w.replace("_", " ")}
                      </button>
                    ))}

                    <button
                      onClick={async () => {
                        const input = window.prompt("Enter played_at datetime (ISO), e.g. 2026-02-17T12:30:00Z");
                        if (!input) return;
                        try {
                          await api.patch(
                            `/games/update/date?game_id=${encodeURIComponent(gameId)}&NewDate=${encodeURIComponent(input)}`
                          );
                          await refresh();
                        } catch {
                          alert("Failed to update played_at.");
                        }
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.9)",
                        cursor: "pointer",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      Set Date
                    </button>

                    <button
                      onClick={async () => {
                        const input = window.prompt("Enter new tournament_id (UUID)");
                        if (!input) return;
                        try {
                          await api.patch(
                            `/games/update/tournament?game_id=${encodeURIComponent(gameId)}&tournament_id=${encodeURIComponent(
                              input
                            )}`
                          );
                          await refresh();
                        } catch {
                          alert("Failed to update tournament_id.");
                        }
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.9)",
                        cursor: "pointer",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      Move Tournament
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    title="Delete game"
                    onClick={async () => {
                      const ok = window.confirm(`Delete this game?\n\nGame ID: ${gameId}\n\nThis cannot be undone.`);
                      if (!ok) return;

                      try {
                        await api.del(`/games/game/delete?game_id=${encodeURIComponent(gameId)}`);
                        await refresh();
                      } catch {
                        alert("Failed to delete game.");
                      }
                    }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid rgba(255,0,0,0.35)",
                      background: "rgba(255,0,0,0.10)",
                      color: "rgba(255,120,120,0.95)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      flex: "0 0 auto",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isCreateOpen && (
        <CreateGameModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={async () => {
            await refresh();
          }}
        />
      )}

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

function CreateGameModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tournamentId, setTournamentId] = useState("");
  const [whiteId, setWhiteId] = useState("");
  const [blackId, setBlackId] = useState("");
  const [result, setResult] = useState<"" | WinState>("");
  const [playedAt, setPlayedAt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!tournamentId.trim()) return setErr("tournament_id is required.");

    const payload: any = {
      tournament_id: tournamentId.trim(),
      player_white_id: whiteId.trim() || null,
      player_black_id: blackId.trim() || null,
      result: result || null,
      played_at: playedAt.trim() || null,
    };

    try {
      setSubmitting(true);
      await api.post<string>("/games/add", payload);
      onCreated();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create game.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 100%)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#0b0b0f",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Create Game</div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <Field label="Tournament ID (UUID) *">
            <input value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="White Player ID (UUID)">
              <input value={whiteId} onChange={(e) => setWhiteId(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Black Player ID (UUID)">
              <input value={blackId} onChange={(e) => setBlackId(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Result">
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                style={{ ...selectStyle, cursor: "pointer" }}
              >
                <option value="">(ongoing)</option>
                {WIN_STATES.map((w) => (
                  <option key={w} value={w} style={{ background: "#0b0b0f", color: "rgba(255,255,255,0.92)" }}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Played At (ISO string or leave blank)">
              <input
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                style={inputStyle}
                placeholder="2026-02-17T12:30:00Z"
              />
            </Field>
          </div>

          {err && <div style={{ color: "salmon", fontSize: 13 }}>{err}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={submitting}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.95)",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              {submitting ? "Creating..." : "Create Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, opacity: 0.75 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.9)",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b0b0f",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};
