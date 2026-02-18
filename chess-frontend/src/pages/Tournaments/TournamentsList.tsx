import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTournaments } from "../../hooks/use-tournaments";
import { api } from "../../api/client";

function getTournamentId(t: any): string {
  return String(t.tournament_id ?? t.id ?? t.tournamentId ?? "");
}

function getTournamentName(t: any): string {
  return String(t.name ?? t.title ?? t.tournament_name ?? "Untitled Tournament");
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

type TournamentStatus = "Upcoming" | "Ongoing" | "Finished";

function parseDateOnly(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

function getTournamentStatus(t: any): TournamentStatus {
  const start = t.start_date ? parseDateOnly(String(t.start_date)) : null;
  const end = t.end_date ? parseDateOnly(String(t.end_date)) : null;

  if (!start || !end) return "Upcoming";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today < start) return "Upcoming";
  if (today > end) return "Finished";
  return "Ongoing";
}

function statusStyles(status: TournamentStatus): React.CSSProperties {
  switch (status) {
    case "Ongoing":
      return {
        background: "rgba(34,197,94,0.15)",
        color: "rgba(34,197,94,0.95)",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    case "Upcoming":
      return {
        background: "rgba(59,130,246,0.15)",
        color: "rgba(59,130,246,0.95)",
        border: "1px solid rgba(59,130,246,0.25)",
      };
    case "Finished":
      return {
        background: "rgba(244,63,94,0.15)",
        color: "rgba(244,63,94,0.95)",
        border: "1px solid rgba(244,63,94,0.25)",
      };
  }
}

export default function TournamentsList() {
  const { data, loading, error } = useTournaments();

  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return data;
    return data.filter((t: any) => normalize(getTournamentName(t)).includes(q));
  }, [data, query]);

  if (loading) return <div style={{ padding: 16 }}>Loading tournaments...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Tournaments</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            {filtered.length} shown • {data.length} total
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          + Create Tournament
        </button>
      </div>

      {/* Search */}
      <div style={{ marginTop: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tournaments by name..."
          style={{
            width: "100%",
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.9)",
            outline: "none",
          }}
        />
      </div>

      {/* List */}
      <div style={{ marginTop: 14 }}>
        {filtered.length === 0 ? (
          <div>No tournaments found.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((t: any) => {
              const id = getTournamentId(t);
              const name = getTournamentName(t);
              const status = getTournamentStatus(t);

              return (
                <Link
                  key={id || name}
                  to={`/tournaments/${id}`}
                  style={{
                    display: "block",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{name}</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 900,
                          ...statusStyles(status),
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background:
                              status === "Ongoing"
                                ? "rgba(34,197,94,0.95)"
                                : status === "Upcoming"
                                ? "rgba(59,130,246,0.95)"
                                : "rgba(244,63,94,0.95)",
                          }}
                        />
                        {status}
                      </span>

                      {/* DELETE TOURNAMENT */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (!id) return alert("Missing tournament id.");
                          const ok = window.confirm(`Delete tournament "${name}"?\n\nThis cannot be undone.`);
                          if (!ok) return;

                          try {
                            // backend: DELETE /tournaments/{tournament_id}
                            await api.del(`/tournaments/${id}`);
                            window.location.reload();
                          } catch (err) {
                            alert("Failed to delete tournament.");
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,0,0,0.30)",
                          background: "rgba(255,0,0,0.10)",
                          color: "rgba(255,120,120,0.95)",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>
                    {t.location ? `📍 ${t.location}` : "📍 —"}{" "}
                    {t.start_date ? `• ${t.start_date}` : ""}{" "}
                    {t.end_date ? `→ ${t.end_date}` : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <CreateTournamentModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => window.location.reload()}
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

function CreateTournamentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!name.trim()) return setErr("Name is required.");
    if (!location.trim()) return setErr("Location is required.");
    if (!startDate) return setErr("Start date is required.");
    if (!endDate) return setErr("End date is required.");

    try {
      setSubmitting(true);

      await api.post("/tournaments", {
        name: name.trim(),
        location: location.trim(),
        start_date: startDate,
        end_date: endDate,
      });

      onCreated();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create tournament.");
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
          <div style={{ fontSize: 18, fontWeight: 900 }}>Create Tournament</div>
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
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Start Date">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="End Date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
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
              {submitting ? "Creating..." : "Create"}
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
