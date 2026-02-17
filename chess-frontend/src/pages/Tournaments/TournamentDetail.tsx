import { Link, useParams } from "react-router-dom";
import { useTournament } from "../../hooks/use-tournament";

export default function TournamentDetail() {
  const { id } = useParams();
  const { data, loading, error } = useTournament(id);

  if (loading) return <div style={{ padding: 16 }}>Loading tournament...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 16 }}>Tournament not found.</div>;

  const tid = (data as any).tournament_id ?? (data as any).id ?? id;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/tournaments" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
        ← Back to tournaments
      </Link>

      <h1 style={{ marginTop: 12, fontSize: 28, fontWeight: 800 }}>
        {(data as any).name ?? (data as any).title ?? "Tournament"}
      </h1>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <Row label="Tournament ID" value={tid} />
        <Row label="Status" value={(data as any).status ?? "—"} />
        <Row label="Start Date" value={(data as any).start_date ?? (data as any).startDate ?? "—"} />
        <Row label="End Date" value={(data as any).end_date ?? (data as any).endDate ?? "—"} />
      </div>

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

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <div style={{ width: 130, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{String(value)}</div>
    </div>
  );
}
