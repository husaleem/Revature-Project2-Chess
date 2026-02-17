import { Link } from "react-router-dom";
import { useTournaments } from "../../hooks/use-tournaments";

function getTournamentId(t: any): string {
  return String(t.tournament_id ?? t.id ?? t.tournamentId ?? "");
}

function getTournamentName(t: any): string {
  return String(t.name ?? t.title ?? t.tournament_name ?? "Untitled Tournament");
}

export default function TournamentsList() {
  const { data, loading, error } = useTournaments();

  if (loading) return <div style={{ padding: 16 }}>Loading tournaments...</div>;
  if (error) return <div style={{ padding: 16, color: "salmon" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Tournaments</h1>

      {data.length === 0 ? (
        <div>No tournaments found.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data.map((t: any) => {
            const id = getTournamentId(t);
            const name = getTournamentName(t);

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
                <div style={{ fontWeight: 700 }}>{name}</div>
                <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                  Status: {t.status ?? "—"}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Debug so we can see the exact list payload */}
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
