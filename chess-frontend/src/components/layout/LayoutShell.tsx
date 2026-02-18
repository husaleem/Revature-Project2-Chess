import { NavLink, Outlet } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.70)",
  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
});

export default function LayoutShell() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
        background: "#06070b", // matches reference feel
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid rgba(255,255,255,0.10)",
          background: "#0b0b0f",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", marginBottom: 16 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              display: "grid",
              placeItems: "center",
              fontSize: 16,
            }}
          >
            ♜
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>ChessOS</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <NavLink to="/" end style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/analytics" style={linkStyle}>Analytics</NavLink>

          <NavLink to="/tournaments" style={linkStyle}>Tournaments</NavLink>
          <NavLink to="/players" style={linkStyle}>Players</NavLink>
          <NavLink to="/games" style={linkStyle}>Games</NavLink>
          <NavLink to="/head-to-head" style={linkStyle}>Head-to-Head</NavLink>
          <NavLink to="/standings" style={linkStyle}>Standings</NavLink>
          <NavLink to="/skill-levels" style={linkStyle}>Skill Levels</NavLink>
          <NavLink to="/mentorship" style={linkStyle}>Mentorship</NavLink>
          <NavLink to="/violations" style={linkStyle}>Violations</NavLink>
        </nav>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>System Online</span>
          </div>
        </div>
      </aside>

      <main style={{ padding: 32 }}>
        <Outlet />
      </main>
    </div>
  );
}
