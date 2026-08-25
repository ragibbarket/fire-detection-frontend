import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function AlertRow({ alert }) {
  const reading = alert.reading || {};
  return (
    <Link
      to={`/alerts/${alert._id}`}
      className="card"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{reading.deviceId || "Unknown device"}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          {new Date(alert.createdAt).toLocaleString()} &middot; {reading.temperature}&deg;C &middot; smoke {reading.smokeValue}
          {alert.mlConfidence != null && ` \u00b7 ${Math.round(alert.mlConfidence * 100)}% confidence`}
        </p>
      </div>
      <StatusBadge status={alert.status} />
    </Link>
  );
}
