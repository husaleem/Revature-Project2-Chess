import React, { useMemo, useState } from "react";
import type { SkillLevelRead as SkillLevel } from "../api/skillLevels";
import { skillLevelsApi } from "../api/skillLevels";

function normalize(s: string) {
  return s.trim().toLowerCase();
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

const dangerBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,0,0,0.30)",
  background: "rgba(255,0,0,0.10)",
  color: "rgba(255,120,120,0.95)",
  cursor: "pointer",
  fontWeight: 900,
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
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  fontWeight: 800,
};

const tableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: 12,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  alignItems: "center",
};

export default function SkillLevels() {
  const [data, setData] = useState<SkillLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<SkillLevel | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);

      const rows = await skillLevelsApi.list();

      // ✅ Always descending by highest upper bound first
      rows.sort(
        (a, b) =>
          b.rating_upper_bound - a.rating_upper_bound ||
          b.rating_lower_bound - a.rating_lower_bound ||
          a.title.localeCompare(b.title)
      );

      setData(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load skill levels.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return data;
    return data.filter((r) => normalize(r.title).includes(q));
  }, [data, query]);

  if (loading) return <div style={{ padding: 16 }}>Loading skill levels...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Skill Levels</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Ordered by upper bound (desc) • {filtered.length} shown • {data.length} total
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={primaryBtn}>
            Refresh
          </button>

          <button onClick={() => setIsCreateOpen(true)} style={primaryBtn}>
            + Create
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginTop: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skill levels by title..."
          style={inputStyle}
        />
      </div>

      {/* Table */}
      <div style={tableWrapStyle}>
        <div style={tableHeaderStyle}>
          <div>TITLE</div>
          <div>LOWER</div>
          <div>UPPER</div>
          <div style={{ textAlign: "right" }}>ACTIONS</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 14 }}>No skill levels found.</div>
        ) : (
          filtered.map((r) => (
            <div key={r.title} style={tableRowStyle}>
              <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.title}
              </div>

              <div style={{ fontWeight: 900 }}>{r.rating_lower_bound}</div>
              <div style={{ fontWeight: 900 }}>{r.rating_upper_bound}</div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => setEditRow(r)}
                  style={{ ...primaryBtn, padding: "6px 10px", fontWeight: 900 }}
                >
                  Edit
                </button>

                <button
                  onClick={async () => {
                    const ok = window.confirm(`Delete skill level "${r.title}"?\n\nThis cannot be undone.`);
                    if (!ok) return;

                    try {
                      await skillLevelsApi.remove(r.title);
                      await load();
                    } catch (err: any) {
                      alert(err?.message ?? "Failed to delete skill level.");
                    }
                  }}
                  style={dangerBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <SkillLevelModal
          title="Create Skill Level"
          initial={{ title: "", rating_lower_bound: 0, rating_upper_bound: 0 }}
          submitLabel="Create"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (payload) => {
            await skillLevelsApi.create(payload);
            await load();
            setIsCreateOpen(false);
          }}
        />
      )}

      {/* Edit modal */}
      {editRow && (
        <SkillLevelModal
          title="Edit Skill Level"
          initial={editRow}
          submitLabel="Save"
          onClose={() => setEditRow(null)}
          onSubmit={async (payload) => {
            // NOTE: update uses original title in the URL
            await skillLevelsApi.update(editRow.title, payload);
            await load();
            setEditRow(null);
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
      {children}
    </label>
  );
}

function SkillLevelModal({
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: SkillLevel;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (payload: SkillLevel) => Promise<void>;
}) {
  const [form, setForm] = useState<SkillLevel>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    const t = form.title.trim();
    if (!t) return setErr("Title is required.");
    if (t.length > 50) return setErr("Title must be 50 characters or less.");

    const lb = Number(form.rating_lower_bound);
    const ub = Number(form.rating_upper_bound);

    if (!Number.isFinite(lb) || lb < 0) return setErr("Lower bound must be a non-negative number.");
    if (!Number.isFinite(ub) || ub < 0) return setErr("Upper bound must be a non-negative number.");
    if (lb > ub) return setErr("Lower bound cannot be greater than upper bound.");

    try {
      setSubmitting(true);
      await onSubmit({ title: t, rating_lower_bound: lb, rating_upper_bound: ub });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save.");
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

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm((p: SkillLevel) => ({ ...p, title: e.target.value }))}
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Rating Lower Bound">
              <input
                value={String(form.rating_lower_bound)}
                onChange={(e) =>
                  setForm((p: SkillLevel) => ({ ...p, rating_lower_bound: Number(e.target.value) }))
                }
                style={inputStyle}
                inputMode="numeric"
              />
            </Field>

            <Field label="Rating Upper Bound">
              <input
                value={String(form.rating_upper_bound)}
                onChange={(e) =>
                  setForm((p: SkillLevel) => ({ ...p, rating_upper_bound: Number(e.target.value) }))
                }
                style={inputStyle}
                inputMode="numeric"
              />
            </Field>
          </div>

          {err && <div style={{ color: "salmon", fontSize: 13 }}>{err}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                ...primaryBtn,
                background: "transparent",
                color: "rgba(255,255,255,0.75)",
              }}
              disabled={submitting}
            >
              Cancel
            </button>

            <button onClick={submit} style={primaryBtn} disabled={submitting}>
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
