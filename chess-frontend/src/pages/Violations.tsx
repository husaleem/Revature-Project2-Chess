// src/pages/Violations.tsx
import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useViolations } from "../hooks/use-violations";
import {
  violationsApi,
  type ViolationCreate,
  type ViolationRead,
  type ViolationUpdate,
} from "../api/violations";
import { usePlayers } from "../hooks/use-players";
import { useGames } from "../hooks/use-games";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

/**
 * ✅ UI FIX: textbox overlap
 * - boxSizing: "border-box"
 * - display: "block"
 * - minWidth: 0 (so grid children shrink correctly)
 */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.9)",
  outline: "none",
  boxSizing: "border-box",
  display: "block",
  minWidth: 0,
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontWeight: 800,
};

const iconBtn = (tone: "neutral" | "danger" = "neutral"): React.CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: 10,
  border:
    tone === "danger"
      ? "1px solid rgba(255,0,0,0.35)"
      : "1px solid rgba(255,255,255,0.12)",
  background:
    tone === "danger" ? "rgba(255,0,0,0.10)" : "rgba(255,255,255,0.06)",
  color:
    tone === "danger" ? "rgba(255,120,120,0.95)" : "rgba(255,255,255,0.85)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
});

const tableWrapStyle: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  overflow: "hidden",
};

const tableHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1.2fr 1.3fr 1.8fr 2.2fr 110px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1.2fr 1.3fr 1.8fr 2.2fr 110px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

function badgeStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  };
}

// Trends strip styles
const statsGridStyle: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const statCardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  minWidth: 0,
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const statValueStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 20,
  fontWeight: 950,
};

const statSubStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  opacity: 0.75,
  lineHeight: 1.4,
};

function gameLabel(g: any, playerNameById: Map<string, string>) {
  const tid = g.tournament_id ? shortId(String(g.tournament_id)) : "—";
  const played = g.played_at ? fmtDate(String(g.played_at)) : "";
  const w =
    playerNameById.get(String(g.player_white_id)) ?? `W:${shortId(String(g.player_white_id))}`;
  const b =
    playerNameById.get(String(g.player_black_id)) ?? `B:${shortId(String(g.player_black_id))}`;
  return `T:${tid} • ${w} vs ${b}${played ? ` • ${played}` : ""}`;
}

export default function Violations() {
  const { data, loading, refreshing, error, refresh } = useViolations();
  const { data: players } = usePlayers();
  const { data: games } = useGames();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [playerFilter, setPlayerFilter] = useState<string>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<ViolationRead | null>(null);

  const playerNameById = useMemo(() => {
    const map = new Map<string, string>();
    (players ?? []).forEach((p: any) => {
      const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
      if (p.player_id) map.set(String(p.player_id), full);
    });
    return map;
  }, [players]);

  const gameLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (games ?? []).forEach((g: any) => {
      const id = String(g.game_id ?? g.id ?? "");
      if (!id) return;
      map.set(id, gameLabel(g, playerNameById));
    });
    return map;
  }, [games, playerNameById]);

  const distinctTypes = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((v) => set.add(v.violation_type));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const rows = useMemo(() => {
    const q = normalize(query);
    const base = (data ?? []) as ViolationRead[];

    const filteredType =
      typeFilter === "ALL" ? base : base.filter((v) => v.violation_type === typeFilter);

    const filteredPlayer =
      playerFilter === "ALL"
        ? filteredType
        : filteredType.filter((v) => String(v.player_id) === String(playerFilter));

    if (!q) return filteredPlayer;

    return filteredPlayer.filter((v) => {
      const playerName = playerNameById.get(String(v.player_id)) ?? "";
      const gameLbl = gameLabelById.get(String(v.game_id)) ?? "";
      return (
        normalize(v.violation_type).includes(q) ||
        normalize(playerName).includes(q) ||
        normalize(gameLbl).includes(q) ||
        normalize(v.consequence ?? "").includes(q) ||
        normalize(String(v.player_id)).includes(q) ||
        normalize(String(v.game_id)).includes(q)
      );
    });
  }, [data, query, typeFilter, playerFilter, playerNameById, gameLabelById]);

  const sortedPlayers = useMemo(() => {
    return (players ?? []).slice().sort((a: any, b: any) => {
      const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
      const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
      return an.localeCompare(bn);
    });
  }, [players]);

  const stats = useMemo(() => {
    const all = (data ?? []) as ViolationRead[];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const withinDays = (v: ViolationRead, days: number) => {
      const t = new Date(v.violation_date).getTime();
      if (Number.isNaN(t)) return false;
      return now - t <= days * day;
    };

    const last7 = all.filter((v) => withinDays(v, 7)).length;
    const last30 = all.filter((v) => withinDays(v, 30)).length;

    const typeCounts = new Map<string, number>();
    for (const v of all) {
      typeCounts.set(v.violation_type, (typeCounts.get(v.violation_type) ?? 0) + 1);
    }
    const topTypes = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const playerCounts = new Map<string, number>();
    for (const v of all) {
      const pid = String(v.player_id);
      playerCounts.set(pid, (playerCounts.get(pid) ?? 0) + 1);
    }
    const topPlayer = Array.from(playerCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      total: all.length,
      last7,
      last30,
      topTypes,
      topPlayer: topPlayer ? { playerId: topPlayer[0], count: topPlayer[1] } : null,
    };
  }, [data]);

  if (loading) return <div style={{ padding: 16 }}>Loading violations...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Violations</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Track rule violations across games.
            {refreshing ? <span style={{ marginLeft: 10, opacity: 0.7 }}>Refreshing…</span> : null}
            <span style={{ marginLeft: 10, opacity: 0.7 }}>• {rows.length} shown</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={refresh} style={primaryBtn}>
            Refresh
          </button>

          <button onClick={() => setIsCreateOpen(true)} style={primaryBtn}>
            + Add Violation
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by player, type, game, consequence..."
          style={{ ...inputStyle, flex: 1, minWidth: 260 }}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ ...inputStyle, background: "#0b0b0f", cursor: "pointer", minWidth: 220 }}
        >
          <option value="ALL">All types</option>
          {distinctTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
          style={{ ...inputStyle, background: "#0b0b0f", cursor: "pointer", minWidth: 240 }}
        >
          <option value="ALL">All players</option>
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
      </div>

      {/* Trends strip */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Total Violations</div>
          <div style={statValueStyle}>{stats.total}</div>
          <div style={statSubStyle}>All time</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Last 7 Days</div>
          <div style={statValueStyle}>{stats.last7}</div>
          <div style={statSubStyle}>Recent activity</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Last 30 Days</div>
          <div style={statValueStyle}>{stats.last30}</div>
          <div style={statSubStyle}>Monthly trend</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Top Types</div>
          <div style={statSubStyle}>
            {stats.topTypes.length === 0 ? (
              <span>No data</span>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {stats.topTypes.map(([t, c]) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      fontWeight: 800,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t}
                    </span>
                    <span style={{ opacity: 0.85 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {stats.topPlayer ? (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Most flagged:{" "}
              <span style={{ fontWeight: 900 }}>
                {playerNameById.get(stats.topPlayer.playerId) ?? shortId(stats.topPlayer.playerId)}
              </span>{" "}
              <span style={{ opacity: 0.85 }}>({stats.topPlayer.count})</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div style={tableWrapStyle}>
        <div style={tableHeaderStyle}>
          <div>TYPE</div>
          <div>PLAYER</div>
          <div>GAME</div>
          <div>DATE</div>
          <div>CONSEQUENCE</div>
          <div style={{ textAlign: "right" }}>ACTIONS</div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 14 }}>No violations found.</div>
        ) : (
          rows.map((v) => {
            const playerName =
              playerNameById.get(String(v.player_id)) ?? `Player ${shortId(v.player_id)}`;
            const gameLbl = gameLabelById.get(String(v.game_id)) ?? `Game ${shortId(v.game_id)}`;

            return (
              <div key={v.violation_id} style={tableRowStyle}>
                <div style={{ minWidth: 0 }}>
                  <span style={badgeStyle()} title={v.violation_type}>
                    {v.violation_type}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {playerName}
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    opacity: 0.9,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {gameLbl}
                </div>

                <div style={{ fontWeight: 800, opacity: 0.85 }}>{fmtDate(v.violation_date)}</div>

                <div
                  style={{
                    opacity: 0.85,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {v.consequence ?? "—"}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button title="Edit violation" style={iconBtn("neutral")} onClick={() => setEditRow(v)}>
                    <Pencil size={16} />
                  </button>

                  <button
                    title="Delete violation"
                    style={iconBtn("danger")}
                    onClick={async () => {
                      const ok = window.confirm(
                        `Delete this violation?\n\nType: ${v.violation_type}\nPlayer: ${playerName}\n\nThis cannot be undone.`
                      );
                      if (!ok) return;

                      try {
                        await violationsApi.remove(v.violation_id);
                        refresh();
                      } catch (e: any) {
                        alert(e?.message ?? "Failed to delete violation.");
                      }
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
        <ViolationCreateModal
          players={(players ?? []) as any[]}
          games={(games ?? []) as any[]}
          playerNameById={playerNameById}
          onClose={() => setIsCreateOpen(false)}
          onCreated={async () => {
            setIsCreateOpen(false);
            refresh();
          }}
        />
      )}

      {editRow && (
        <ViolationEditModal
          row={editRow}
          playerName={playerNameById.get(String(editRow.player_id)) ?? shortId(editRow.player_id)}
          gameLabel={gameLabelById.get(String(editRow.game_id)) ?? shortId(editRow.game_id)}
          onClose={() => setEditRow(null)}
          onSaved={async () => {
            setEditRow(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
      {children}
    </label>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          width: "min(720px, 100%)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#0b0b0f",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
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

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

function ViolationCreateModal({
  players,
  games,
  playerNameById,
  onClose,
  onCreated,
}: {
  players: any[];
  games: any[];
  playerNameById: Map<string, string>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const sortedPlayers = useMemo(() => {
    return (players ?? []).slice().sort((a, b) => {
      const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
      const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
      return an.localeCompare(bn);
    });
  }, [players]);

  const sortedGames = useMemo(() => {
    return (games ?? []).slice().sort((a: any, b: any) => {
      const ad = new Date(a.played_at ?? 0).getTime();
      const bd = new Date(b.played_at ?? 0).getTime();
      return bd - ad;
    });
  }, [games]);

  const [form, setForm] = useState<ViolationCreate>(() => ({
    player_id: String(sortedPlayers?.[0]?.player_id ?? ""),
    game_id: String(sortedGames?.[0]?.game_id ?? ""),
    violation_type: "",
    violation_date: new Date().toISOString(),
    consequence: "",
  }));

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    const type = form.violation_type.trim();
    if (!form.player_id) return setErr("Player is required.");
    if (!form.game_id) return setErr("Game is required.");
    if (!type) return setErr("Violation type is required.");

    const dt = new Date(form.violation_date);
    if (Number.isNaN(dt.getTime())) return setErr("Violation date must be a valid date/time.");

    try {
      setSubmitting(true);

      await violationsApi.create({
        player_id: form.player_id,
        game_id: form.game_id,
        violation_type: type,
        violation_date: new Date(form.violation_date).toISOString(),
        consequence: form.consequence?.trim() || null,
      });

      onCreated();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add violation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Add Violation" onClose={onClose}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="Player">
          <select
            value={form.player_id}
            onChange={(e) => setForm((prev) => ({ ...prev, player_id: e.target.value }))}
            style={{ ...inputStyle, background: "#0b0b0f", cursor: "pointer" }}
          >
            {sortedPlayers.map((p) => {
              const id = String(p.player_id);
              const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
              return (
                <option key={id} value={id}>
                  {name} ({shortId(id)})
                </option>
              );
            })}
          </select>
        </Field>

        <Field label="Game">
          <select
            value={form.game_id}
            onChange={(e) => setForm((prev) => ({ ...prev, game_id: e.target.value }))}
            style={{ ...inputStyle, background: "#0b0b0f", cursor: "pointer" }}
          >
            {sortedGames.map((g: any) => {
              const id = String(g.game_id);
              return (
                <option key={id} value={id}>
                  {gameLabel(g, playerNameById)} ({shortId(id)})
                </option>
              );
            })}
          </select>
        </Field>

        {/* ✅ UI FIX: minWidth:0 and box sizing prevent overlap */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 10 }}>
          <Field label="Violation Type">
            <input
              value={form.violation_type}
              onChange={(e) => setForm((prev) => ({ ...prev, violation_type: e.target.value }))}
              style={inputStyle}
              placeholder="e.g., Illegal Move"
            />
          </Field>

          <Field label="Violation Date/Time (ISO)">
            <input
              value={form.violation_date}
              onChange={(e) => setForm((prev) => ({ ...prev, violation_date: e.target.value }))}
              style={inputStyle}
              placeholder={new Date().toISOString()}
            />
          </Field>
        </div>

        <Field label="Consequence (optional)">
          <input
            value={form.consequence ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, consequence: e.target.value }))}
            style={inputStyle}
            placeholder="e.g., Warning issued"
          />
        </Field>

        {err && <div style={{ color: "salmon", fontSize: 13 }}>{err}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{ ...primaryBtn, background: "transparent", color: "rgba(255,255,255,0.75)" }}
            disabled={submitting}
          >
            Cancel
          </button>

          <button onClick={submit} style={primaryBtn} disabled={submitting}>
            {submitting ? "Adding..." : "Add Violation"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ViolationEditModal({
  row,
  playerName,
  gameLabel,
  onClose,
  onSaved,
}: {
  row: ViolationRead;
  playerName: string;
  gameLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ViolationUpdate>(() => ({
    violation_type: row.violation_type,
    violation_date: row.violation_date,
    consequence: row.consequence ?? "",
  }));

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    const type = (form.violation_type ?? "").trim();
    if (!type) return setErr("Violation type is required.");

    const dt = new Date(form.violation_date ?? "");
    if (Number.isNaN(dt.getTime())) return setErr("Violation date must be a valid date/time.");

    try {
      setSubmitting(true);

      await violationsApi.update(row.violation_id, {
        violation_type: type,
        violation_date: new Date(form.violation_date ?? "").toISOString(),
        consequence: (form.consequence ?? "").trim() || null,
      });

      onSaved();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update violation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Edit Violation" onClose={onClose}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Player (locked)</div>
          <div style={{ fontWeight: 900 }}>{playerName}</div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Game (locked)</div>
          <div style={{ fontWeight: 800, opacity: 0.9 }}>{gameLabel}</div>
        </div>

        {/* ✅ UI FIX: minmax(0, ...) stops inputs overlapping inside grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 10 }}>
          <Field label="Violation Type">
            <input
              value={String(form.violation_type ?? "")}
              onChange={(e) => setForm((p) => ({ ...p, violation_type: e.target.value }))}
              style={inputStyle}
            />
          </Field>

          <Field label="Violation Date/Time (ISO)">
            <input
              value={String(form.violation_date ?? "")}
              onChange={(e) => setForm((p) => ({ ...p, violation_date: e.target.value }))}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Consequence (optional)">
          <input
            value={String(form.consequence ?? "")}
            onChange={(e) => setForm((p) => ({ ...p, consequence: e.target.value }))}
            style={inputStyle}
          />
        </Field>

        {err && <div style={{ color: "salmon", fontSize: 13 }}>{err}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{ ...primaryBtn, background: "transparent", color: "rgba(255,255,255,0.75)" }}
            disabled={submitting}
          >
            Cancel
          </button>

          <button onClick={submit} style={primaryBtn} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
