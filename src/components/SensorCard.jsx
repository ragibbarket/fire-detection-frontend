export default function SensorCard({ label, value, unit, alert }) {
  return (
    <div
      className="card"
      style={{
        borderColor: alert ? "var(--ember)" : "var(--border)",
        background: alert ? "var(--ember-bg)" : "var(--surface)",
      }}
    >
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>{label}</p>
      <p className="mono" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: alert ? "var(--ember)" : "var(--text-primary)" }}>
        {value}
        <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 4 }}>{unit}</span>
      </p>
    </div>
  );
}
