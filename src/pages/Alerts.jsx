import { useEffect, useState } from "react";
import { getAlerts } from "../api/client";
import socket from "../api/socket";
import AlertRow from "../components/AlertRow";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "verified_fire", label: "Verified fire" },
  { key: "pending_verification", label: "Awaiting verification" },
  { key: "false_alarm", label: "False alarm" },
  { key: "notified", label: "Notified" },
  { key: "resolved", label: "Resolved" },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));

    const prepend = (alert) =>
      setAlerts((prev) => {
        const withoutOld = prev.filter((a) => a._id !== alert._id);
        return [alert, ...withoutOld];
      });

    socket.on("alert:new", prepend);
    socket.on("alert:verified", prepend);
    socket.on("alert:notified", prepend);
    socket.on("alert:resolved", prepend);

    return () => {
      socket.off("alert:new", prepend);
      socket.off("alert:verified", prepend);
      socket.off("alert:notified", prepend);
      socket.off("alert:resolved", prepend);
    };
  }, []);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);

  return (
    <div>
      <h1 className="page-title">Alerts</h1>
      <p className="page-subtitle">Full alert history across all devices</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className="btn"
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? "var(--surface-raised)" : "transparent",
              borderColor: filter === f.key ? "var(--border-strong)" : "var(--border)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Loading...</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No alerts match this filter.</p>}
      {filtered.map((a) => (
        <AlertRow key={a._id} alert={a} />
      ))}
    </div>
  );
}
