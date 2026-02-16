import { NavLink, Outlet } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "white",
  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
});

export default function LayoutShell() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#0b0b0f" }}>
      <aside style={{ borderRight: "1px solid #1f1f26", padding: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16, color: "white" }}>
          Chess Admin
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/tournaments" style={linkStyle}>Tournaments</NavLink>
          <NavLink to="/players" style={linkStyle}>Players</NavLink>
          <NavLink to="/games" style={linkStyle}>Games</NavLink>
          <NavLink to="/standings" style={linkStyle}>Standings</NavLink>
          <NavLink to="/skill-levels" style={linkStyle}>Skill Levels</NavLink>
          <NavLink to="/mentorship" style={linkStyle}>Mentorship</NavLink>
          <NavLink to="/violations" style={linkStyle}>Violations</NavLink>
        </nav>
      </aside>

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
