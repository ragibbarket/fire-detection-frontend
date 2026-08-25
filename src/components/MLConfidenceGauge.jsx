export default function MLConfidenceGauge({ prediction, confidence, reasoning }) {
  if (!prediction) {
    return (
      <div className="card">
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Waiting for the first reading...</p>
      </div>
    );
  }

  const isFire = prediction === "fire";
  const pct = Math.round((confidence || 0) * 100);
  const color = isFire ? "var(--ember)" : "var(--green)";

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
          Live ML classification <span style={{ color: "var(--text-muted)" }}>(updates every reading)</span>
        </p>
        <span className={`badge ${isFire ? "badge-danger" : "badge-success"}`}>
          {isFire ? "Fire signature" : "No fire signature"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 30, fontWeight: 500, color }}>
          {pct}%
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>confidence</span>
      </div>

      <div style={{ height: 8, background: "var(--surface-raised)", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s ease" }} />
      </div>

      {reasoning && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{reasoning}</p>
      )}
    </div>
  );
}
