import { useMemo } from "react";
import { useTournaments } from "../hooks/use-tournaments";
import { usePlayers } from "../hooks/use-players";
import { useGames } from "../hooks/use-games";
import { Trophy, Users, Swords, Calendar, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

function getTournamentStatus(start_date: string, end_date: string) {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const now = new Date();

  if (now < start) return "planned";
  if (now > end) return "completed";
  return "ongoing";
}

export default function Dashboard() {
  const { data: tournaments, loading: tLoading, error: tError } = useTournaments();
  const { data: players, loading: pLoading, error: pError } = usePlayers();
  const { data: games, loading: gLoading, error: gError } = useGames();

  const loading = tLoading || pLoading || gLoading;
  const error = tError || pError || gError;

  const activeTournaments = useMemo(() => {
    return (tournaments ?? []).filter(t => getTournamentStatus(t.start_date, t.end_date) === "ongoing");
  }, [tournaments]);

  const plannedTournaments = useMemo(() => {
    return (tournaments ?? []).filter(t => getTournamentStatus(t.start_date, t.end_date) === "planned");
  }, [tournaments]);

  // Chart: games per weekday (derived from played_at)
  const activityData = useMemo(() => {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const counts = new Array(7).fill(0);

    for (const g of games ?? []) {
      const d = new Date(g.played_at);
      counts[d.getDay()] += 1;
    }
    return days.map((name, i) => ({ name, games: counts[i] }));
  }, [games]);

  if (loading) return <div style={{ padding: 16 }}>Loading dashboard…</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>Overview of your chess organization.</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={{ border: "1px solid #222", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ opacity: 0.8 }}>Total Players</div>
            <Users size={18} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{players?.length ?? 0}</div>
        </div>

        <div style={{ border: "1px solid #222", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ opacity: 0.8 }}>Active Tournaments</div>
            <Trophy size={18} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeTournaments.length}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{plannedTournaments.length} upcoming</div>
        </div>

        <div style={{ border: "1px solid #222", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ opacity: 0.8 }}>Games Played</div>
            <Swords size={18} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{games?.length ?? 0}</div>
        </div>
      </div>

      {/* Chart + Events */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #222", borderRadius: 12, padding: 16, height: 360 }}>
          <h3 style={{ marginBottom: 12 }}>Game Activity</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="games" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ border: "1px solid #222", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Events</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(tournaments ?? []).slice(0, 5).map(t => (
              <Link key={t.tournament_id} to={`/tournaments/${t.tournament_id}`} style={{ textDecoration: "none" }}>
                <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, display: "flex", gap: 6, alignItems: "center" }}>
                    <Calendar size={14} />
                    {format(new Date(t.start_date), "MMM d, yyyy")}
                  </div>
                </div>
              </Link>
            ))}

            <Link to="/tournaments" style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              View all tournaments <ArrowUpRight size={14} style={{ verticalAlign: "middle" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
