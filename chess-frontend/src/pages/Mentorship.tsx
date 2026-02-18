import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useMentorships } from "../hooks/use-mentorships";
import { usePlayers } from "../hooks/use-players";
import { mentorshipsApi } from "../api/mentorships";
import type { MentorshipRead } from "../api/mentorships";
import type { PlayerRead } from "../types/player";
import MentorshipGraph from "../components/mentorship/MentorshipGraph";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}…` : "—";
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

const primaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontWeight: 800,
};

const dangerBtnIcon: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid rgba(255,0,0,0.35)",
  background: "rgba(255,0,0,0.10)",
  color: "rgba(255,120,120,0.95)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const tableWrapStyle: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  overflow: "hidden",
};

const tableHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 2fr 1fr 1fr 86px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 2fr 1fr 1fr 86px",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

type ViewMode = "table" | "tree";

export default function Mentorship() {
  const { data, loading, refreshing, error, refresh } = useMentorships();
  const { data: players, loading: playersLoading, error: playersError } = usePlayers();

  const [query, setQuery] = useState("");
  const [mentorFilter, setMentorFilter] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("table");

  const idToName = useMemo(() => {
    const map = new Map<string, string>();
    (players ?? []).forEach((p: PlayerRead) => {
      const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
      if (p.player_id) map.set(String(p.player_id), full);
    });
    return map;
  }, [players]);

  const rows = useMemo(() => {
    const q = normalize(query);
    const base = (data ?? []) as MentorshipRead[];

    const filteredByMentor =
      mentorFilter === "ALL" ? base : base.filter((r) => String(r.mentor_id) === mentorFilter);

    if (!q) return filteredByMentor;

    return filteredByMentor.filter((r) => {
      const mentorName = idToName.get(String(r.mentor_id)) ?? "";
      const playerName = idToName.get(String(r.player_id)) ?? "";
      return (
        normalize(mentorName).includes(q) ||
        normalize(playerName).includes(q) ||
        normalize(String(r.mentor_id)).includes(q) ||
        normalize(String(r.player_id)).includes(q)
      );
    });
  }, [data, query, mentorFilter, idToName]);

  if (loading) return <div style={{ padding: 16 }}>Loading mentorships...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  const totalMentorships = (data ?? []).length;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Mentorship</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Manage mentor → mentee relationships.
            {refreshing ? <span style={{ marginLeft: 10, opacity: 0.7 }}>Refreshing…</span> : null}
            <span style={{ marginLeft: 10, opacity: 0.7 }}>• {totalMentorships} total</span>
          </div>

          {playersError ? (
            <div style={{ marginTop: 6, fontSize: 12, color: "salmon" }}>
              Players lookup failed — showing IDs only.
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={() => setView("table")}
            style={{
              ...primaryBtn,
              background: view === "table" ? "rgba(255,255,255,0.10)" : primaryBtn.background,
            }}
          >
            Table
          </button>

          <button
            onClick={() => setView("tree")}
            style={{
              ...primaryBtn,
              background: view === "tree" ? "rgba(255,255,255,0.10)" : primaryBtn.background,
            }}
          >
            Tree
          </button>

          <button onClick={refresh} style={primaryBtn}>
            Refresh
          </button>

          <button onClick={() => setIsAddOpen(true)} style={primaryBtn}>
            + Add Mentorship
          </button>
        </div>
      </div>

      {/* Controls: only show when in TABLE mode */}
      {view === "table" && (
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mentor / mentee..."
            style={{ ...inputStyle, flex: 1, minWidth: 240 }}
          />

          <select
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            disabled={playersLoading}
            style={{
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#0b0b0f",
              color: "rgba(255,255,255,0.92)",
              outline: "none",
              cursor: "pointer",
              minWidth: 240,
            }}
          >
            <option value="ALL">All mentors</option>

            {(players ?? [])
              .slice()
              .sort((a: PlayerRead, b: PlayerRead) => {
                const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
                const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
                return an.localeCompare(bn);
              })
              .map((p: PlayerRead) => {
                const id = String(p.player_id ?? "");
                const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed Player";
                return (
                  <option key={id} value={id}>
                    {name} ({shortId(id)})
                  </option>
                );
              })}
          </select>
        </div>
      )}

      {/* MAIN VIEW */}
      {view === "tree" ? (
        // ✅ IMPORTANT: ReactFlow needs an explicit height somewhere above it
        <div
          style={{
            marginTop: 14,
            height: "70vh",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            overflow: "hidden",
          }}
        >
          {totalMentorships === 0 ? (
            <div style={{ padding: 14 }}>
              No mentorships found. Add a few relationships to see the mentor tree.
            </div>
          ) : (
            <MentorshipGraph
              players={(players ?? []) as PlayerRead[]}
              mentorships={(data ?? []) as MentorshipRead[]}
            />
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div style={tableWrapStyle}>
          <div style={tableHeaderStyle}>
            <div>MENTOR</div>
            <div>MENTEE</div>
            <div>MENTOR ID</div>
            <div>MENTEE ID</div>
            <div style={{ textAlign: "right" }}>ACTIONS</div>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: 14 }}>No mentorships found.</div>
          ) : (
            rows.map((r, idx) => {
              const mentorId = String(r.mentor_id);
              const playerId = String(r.player_id);

              const mentorName = idToName.get(mentorId) ?? "Unknown Mentor";
              const playerName = idToName.get(playerId) ?? "Unknown Player";

              return (
                <div key={`${mentorId}-${playerId}-${idx}`} style={tableRowStyle}>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {mentorName}
                  </div>

                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {playerName}
                  </div>

                  <div style={{ fontWeight: 800, opacity: 0.85 }}>{shortId(mentorId)}</div>
                  <div style={{ fontWeight: 800, opacity: 0.85 }}>{shortId(playerId)}</div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      title="Delete mentorship"
                      style={dangerBtnIcon}
                      onClick={async () => {
                        const ok = window.confirm(
                          `Delete mentorship?\n\nMentor: ${mentorName}\nMentee: ${playerName}\n\nThis cannot be undone.`
                        );
                        if (!ok) return;

                        try {
                          await mentorshipsApi.remove(playerId, mentorId);
                          refresh();
                        } catch (e: any) {
                          alert(e?.message ?? "Failed to delete mentorship.");
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
      )}

      {isAddOpen && (
        <AddMentorshipModal
          players={(players ?? []) as PlayerRead[]}
          idToName={idToName}
          onClose={() => setIsAddOpen(false)}
          onCreated={async () => {
            setIsAddOpen(false);
            refresh();
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
        {JSON.stringify({ view, mentorshipCount: totalMentorships, rowsShown: rows.length }, null, 2)}
      </pre>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
      {children}
    </label>
  );
}

function AddMentorshipModal({
  players,
  idToName,
  onClose,
  onCreated,
}: {
  players: PlayerRead[];
  idToName: Map<string, string>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mentorId, setMentorId] = useState<string>(String(players?.[0]?.player_id ?? ""));
  const [playerId, setPlayerId] = useState<string>(String(players?.[0]?.player_id ?? ""));
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sortedPlayers = useMemo(() => {
    return (players ?? [])
      .slice()
      .sort((a, b) => {
        const an = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim();
        const bn = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
        return an.localeCompare(bn);
      });
  }, [players]);

  async function submit() {
    setErr(null);

    if (!mentorId) return setErr("Mentor is required.");
    if (!playerId) return setErr("Mentee is required.");
    if (mentorId === playerId) return setErr("Mentor and mentee cannot be the same player.");

    try {
      setSubmitting(true);
      await mentorshipsApi.create({ mentor_id: mentorId, player_id: playerId });
      onCreated();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create mentorship.");
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
          width: "min(560px, 100%)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#0b0b0f",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Add Mentorship</div>
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
          <Field label="Mentor">
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              style={{
                ...inputStyle,
                background: "#0b0b0f",
                cursor: "pointer",
              }}
            >
              {sortedPlayers.map((p) => {
                const id = String(p.player_id);
                const name = idToName.get(id) ?? "Unnamed Player";
                return (
                  <option key={id} value={id}>
                    {name} ({shortId(id)})
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Mentee">
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              style={{
                ...inputStyle,
                background: "#0b0b0f",
                cursor: "pointer",
              }}
            >
              {sortedPlayers.map((p) => {
                const id = String(p.player_id);
                const name = idToName.get(id) ?? "Unnamed Player";
                return (
                  <option key={id} value={id}>
                    {name} ({shortId(id)})
                  </option>
                );
              })}
            </select>
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
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
