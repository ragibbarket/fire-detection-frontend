const STATUS_MAP = {
  pending: { label: "Pending", cls: "badge-info" },
  pending_verification: { label: "Awaiting verification", cls: "badge-warning" },
  verified_fire: { label: "Verified fire", cls: "badge-danger" },
  false_alarm: { label: "False alarm", cls: "badge-warning" },
  notified: { label: "Station notified", cls: "badge-success" },
  resolved: { label: "Resolved", cls: "badge-info" },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, cls: "badge-info" };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
}
