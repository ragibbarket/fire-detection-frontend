import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: "\u25A3" },
  { to: "/alerts", label: "Alerts", icon: "\u25B2" },
  { to: "/members", label: "Team", icon: "\u25CF" },
];

export default function Nav() {
  const [connected, setConnected] = useState(socket.connected);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      style={{
        width: 220,
        borderRight: "1px solid var(--border)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 24px" }}>
        <span style={{ color: "var(--ember)", fontSize: 18 }}>&#9679;</span>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Fire guard</span>
      </div>

      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === "/"}
          style={({ isActive }) => ({
            padding: "9px 10px",
            borderRadius: 8,
            fontSize: 14,
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            background: isActive ? "var(--surface-raised)" : "transparent",
          })}
        >
          {l.label}
        </NavLink>
      ))}

      <div style={{ marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 8px 12px", fontSize: 12, color: "var(--text-muted)" }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: connected ? "var(--green)" : "var(--ember)",
            }}
          />
          {connected ? "Live" : "Disconnected"}
        </div>

        {user && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, padding: "12px 8px 0" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{user.name}</p>
            <p style={{ margin: "2px 0 8px", fontSize: 11, color: "var(--text-muted)" }}>{user.email}</p>
            <button className="btn" onClick={handleLogout} style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 10px" }}>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
