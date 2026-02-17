import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../../api/client";
import { usePlayers } from "../../hooks/use-players";
import { useSkillLevels } from "../../hooks/use-skill-levels";

function initials(first?: string, last?: string) {
  const a = (first?.[0] ?? "").toUpperCase();
  const b = (last?.[0] ?? "").toUpperCase();
  return (a + b) || "P";
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

type SortKey = "rating_desc" | "rating_asc" | "name_asc" | "name_desc";

// Keep this local & simple to avoid type import issues
type SkillLevelLike = {
  title: string;
  rating_lower_bound: number;
  rating_upper_bound: number;
};

function getRankLabelFallback(rating?: number) {
  const r = Number(rating ?? 0);
  if (rating == null) return "—";
  if (!Number.isFinite(r)) return "—";
  if (r >= 2500) return "Grandmaster";
  if (r >= 2400) return "International Master";
  if (r >= 2200) return "Master";
  if (r >= 2000) return "Expert";
  return "Class Player";
}

function getTagline(rating?: number) {
  const r = Number(rating ?? 0);
  if (rating == null) return "No rating info";
  if (!Number.isFinite(r)) return "No rating info";
  if (r >= 2700) return "Elite contender";
  if (r >= 2500) return "Top-level competitor";
  if (r >= 2200) return "Tournament regular";
  return "Rising talent";
}

/**
 * Uses real /skill-levels ranges to pick a title.
 * If levels aren’t loaded or rating doesn’t fit any range, falls back.
 *
 * Matching uses SQL BETWEEN semantics:
 *   lower <= rating <= upper
 */
function getSkillTitleFromRating(
  rating?: number,
  levels?: SkillLevelLike[] | null
) {
  if (rating == null) return "—";
  const r = Number(rating);
  if (!Number.isFinite(r)) return "—";

  if (!levels || levels.length === 0) return getRankLabelFallback(rating);

  const match = levels.find(
    (s) =>
      r >= Number(s.rating_lower_bound) && r <= Number(s.rating_upper_bound)
  );

  return match?.title ?? getRankLabelFallback(rating);
}

/** Small badge label (keeps it short) */
function shortBadge(label: string) {
  const s = label.trim();
  if (!s) return "—";
  // If it's one word, take first 2–3 letters; else take initials
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map((p) => p[0].toUpperCase()).slice(0, 3).join("");
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

export default function PlayersList() {
  const { data, loading, error } = usePlayers();
  const { data: skillLevels } = useSkillLevels();

  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [sort, setSort] = useState<SortKey>("rating_desc");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query);
    const base = (data ?? []).filter((p: any) => {
      if (!q) return true;
      const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
      return normalize(full).includes(q);
    });

    const byName = (p: any) =>
      normalize(`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim());
    const byRating = (p: any) => Number(p.rating ?? 0);

    return [...base].sort((a: any, b: any) => {
      switch (sort) {
        case "rating_desc":
          return byRating(b) - byRating(a);
        case "rating_asc":
          return byRating(a) - byRating(b);
        case "name_asc":
          return byName(a).localeCompare(byName(b));
        case "name_desc":
          return byName(b).localeCompare(byName(a));
        default:
          return 0;
      }
    });
  }, [data, query, sort]);

  if (loading) return <div style={{ padding: 16 }}>Loading players...</div>;
  if (error)
    return (
      <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>
    );

  return (
    <div style={{ padding: 16 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Players
          </h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Directory of all registered chess players.
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
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
          + Add Player
        </button>
      </div>

      {/* Search + Filter */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
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

        <div style={{ position: "relative" }}>
          <button
            type="button"
            title="Sort / Filter"
            onClick={() => setShowFilter((v) => !v)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.85)",
              cursor: "pointer",
            }}
          >
            ⛃
          </button>

          {showFilter && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 52,
                width: 220,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#0b0b0f",
                padding: 10,
                zIndex: 20,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                Sort players
              </div>

              <FilterItem
                active={sort === "rating_desc"}
                label="Rating (High → Low)"
                onClick={() => {
                  setSort("rating_desc");
                  setShowFilter(false);
                }}
              />
              <FilterItem
                active={sort === "rating_asc"}
                label="Rating (Low → High)"
                onClick={() => {
                  setSort("rating_asc");
                  setShowFilter(false);
                }}
              />
              <FilterItem
                active={sort === "name_asc"}
                label="Name (A → Z)"
                onClick={() => {
                  setSort("name_asc");
                  setShowFilter(false);
                }}
              />
              <FilterItem
                active={sort === "name_desc"}
                label="Name (Z → A)"
                onClick={() => {
                  setSort("name_desc");
                  setShowFilter(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{ marginTop: 16 }}>
        {filtered.length === 0 ? (
          <div>No players found.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((p: any) => {
              const fullName =
                `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
                "Unnamed Player";
              const rating = p.rating ?? "—";
              const playerId = String(p.player_id ?? "");

              const rankTitle = getSkillTitleFromRating(
                p.rating,
                (skillLevels as any) ?? null
              );

              return (
                <div
                  key={playerId || fullName}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        fontWeight: 900,
                      }}
                    >
                      {initials(p.first_name, p.last_name)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {fullName}
                      </div>
                      <div style={{ opacity: 0.65, fontSize: 12, marginTop: 2 }}>
                        {playerId ? `ID: ${playerId.slice(0, 8)}…` : ""}
                      </div>
                    </div>

                    {/* Badge: now based on real rank title */}
                    <span
                      title={rankTitle}
                      style={{
                        marginLeft: "auto",
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 900,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {shortBadge(rankTitle)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>RATING</div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          marginTop: 4,
                          color: "rgba(168,85,247,0.95)",
                        }}
                      >
                        {rating}
                      </div>
                    </div>

                    <div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>RANK</div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          marginTop: 8,
                        }}
                      >
                        {rankTitle}
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 12 }}>
                    {getTagline(p.rating)}
                  </div>

                  {/* Footer: bottom-right trash */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 14,
                    }}
                  >
                    <button
                      title="Delete player"
                      onClick={async () => {
                        if (!playerId) return alert("Missing player id.");
                        const ok = window.confirm(
                          `Delete player "${fullName}"?\n\nThis cannot be undone.`
                        );
                        if (!ok) return;

                        try {
                          await api.del(`/players/remove?player_id=${playerId}`);
                          window.location.reload();
                        } catch (err) {
                          alert("Failed to delete player.");
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
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isAddOpen && (
        <AddPlayerModal
          onClose={() => setIsAddOpen(false)}
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
        {JSON.stringify({ players: data, skill_levels: skillLevels }, null, 2)}
      </pre>
    </div>
  );
}

function FilterItem({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        color: "rgba(255,255,255,0.9)",
        cursor: "pointer",
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      {label}
    </button>
  );
}

function AddPlayerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rating, setRating] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!firstName.trim()) return setErr("First name is required.");
    if (!lastName.trim()) return setErr("Last name is required.");
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum)) return setErr("Rating must be a number.");

    try {
      setSubmitting(true);

      await api.post("/players/add", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        rating: ratingNum,
      });

      onCreated();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add player.");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900 }}>Add Player</div>
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
          <Field label="First Name">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Last Name">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Rating">
            <input
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={inputStyle}
              inputMode="numeric"
              placeholder="e.g., 2450"
            />
          </Field>

          {err && <div style={{ color: "salmon", fontSize: 13 }}>{err}</div>}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 4,
            }}
          >
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
              {submitting ? "Adding..." : "Add Player"}
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
