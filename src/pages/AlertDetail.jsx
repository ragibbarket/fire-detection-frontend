import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAlert, getFireStations, notifyFireStation, verifyAlert, resolveAlert } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import socket from "../api/socket";

export default function AlertDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [stations, setStations] = useState([]);
  const [notifying, setNotifying] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAlert(id).then(setAlert).catch(() => setError("Alert not found"));

    const onUpdate = (updated) => {
      if (updated._id === id) setAlert(updated);
    };
    socket.on("alert:verified", onUpdate);
    socket.on("alert:notified", onUpdate);
    socket.on("alert:resolved", onUpdate);
    return () => {
      socket.off("alert:verified", onUpdate);
      socket.off("alert:notified", onUpdate);
      socket.off("alert:resolved", onUpdate);
    };
  }, [id]);

  useEffect(() => {
    if (alert?.status === "verified_fire" && alert.reading?.latitude) {
      getFireStations(alert.reading.latitude, alert.reading.longitude).then(setStations);
    } else if (alert?.status === "verified_fire") {
      getFireStations().then(setStations);
    }
  }, [alert?.status]);

  async function handleVerify(decision) {
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyAlert(alert._id, decision);
      setAlert(result.alert);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record verification");
    } finally {
      setVerifying(false);
    }
  }

  async function handleNotify(stationId) {
    setNotifying(stationId);
    setError(null);
    try {
      const result = await notifyFireStation(stationId, alert._id);
      setAlert(result.alert);
      if (result.waLink) {
        window.open(result.waLink, "_blank"); // opens WhatsApp with the message pre-filled
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to notify station");
    } finally {
      setNotifying(null);
    }
  }

  async function handleResolve() {
    setResolving(true);
    setError(null);
    try {
      const result = await resolveAlert(alert._id);
      setAlert(result.alert);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resolve alert");
    } finally {
      setResolving(false);
    }
  }

  if (error && !alert) return <p style={{ color: "var(--ember)" }}>{error}</p>;
  if (!alert) return <p style={{ color: "var(--text-secondary)" }}>Loading...</p>;

  const reading = alert.reading || {};
  const isFirePrediction = alert.mlPrediction === "fire";

  return (
    <div>
      <Link to="/alerts" style={{ fontSize: 13, color: "var(--text-secondary)" }}>&larr; Back to alerts</Link>
      <h1 className="page-title" style={{ marginTop: 12 }}>Alert detail</h1>
      <div style={{ marginBottom: 24 }}>
        <StatusBadge status={alert.status} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Device</span>
          <span className="mono">{reading.deviceId}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ML prediction</span>
          <span className={`badge ${isFirePrediction ? "badge-danger" : "badge-success"}`}>
            {alert.mlPrediction} ({Math.round((alert.mlConfidence || 0) * 100)}%)
          </span>
        </div>
        <div className="grid-2" style={{ marginTop: 16, marginBottom: 16 }}>
          <div><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Flame</span><p className="mono" style={{ margin: "4px 0" }}>{reading.flameDetected ? "Detected" : "None"}</p></div>
          <div><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Smoke</span><p className="mono" style={{ margin: "4px 0" }}>{reading.smokeValue} ppm</p></div>
          <div><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Temperature</span><p className="mono" style={{ margin: "4px 0" }}>{reading.temperature}&deg;C</p></div>
          <div><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Humidity</span><p className="mono" style={{ margin: "4px 0" }}>{reading.humidity}%</p></div>
        </div>

        {alert.mlReasoning && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>Why the model reached this conclusion</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--text-primary)" }}>{alert.mlReasoning}</p>
          </div>
        )}
      </div>

      {error && <p style={{ color: "var(--ember)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {alert.status === "pending_verification" && (
        <div className="card" style={{ borderColor: "var(--amber)", background: "var(--amber-bg)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--amber)", fontWeight: 500 }}>
            The model flagged this as fire and the local alarm is already sounding. A human must
            still confirm before a fire station is notified over WhatsApp.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>
            Verifying as <strong style={{ color: "var(--text-primary)" }}>{user?.name}</strong> ({user?.email})
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              disabled={verifying}
              onClick={() => handleVerify("confirmed")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Confirm - real fire
            </button>
            <button
              className="btn"
              disabled={verifying}
              onClick={() => handleVerify("false_alarm")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              False alarm
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "10px 0 0" }}>
            The same alert can also be verified from the emailed link on mobile - whichever comes first wins.
          </p>
        </div>
      )}

      {alert.status === "verified_fire" && (
        <>
          <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              The alarm is still sounding on the device. Resolve once the situation is handled.
            </p>
            <button className="btn" disabled={resolving} onClick={handleResolve}>
              {resolving ? "Resolving..." : "Resolve (silence alarm)"}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Notify a fire station</p>
          {stations.map((s) => (
            <div key={s._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{s.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{s.address}</p>
              </div>
              <button className="btn btn-primary" disabled={notifying === s._id} onClick={() => handleNotify(s._id)}>
                {notifying === s._id ? "Opening..." : "Open in WhatsApp"}
              </button>
            </div>
          ))}
        </>
      )}

      {alert.status === "notified" && (
        <>
          <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              The alarm is still sounding on the device. Resolve once the situation is handled.
            </p>
            <button className="btn" disabled={resolving} onClick={handleResolve}>
              {resolving ? "Resolving..." : "Resolve (silence alarm)"}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--green)" }}>
            Fire station notified{alert.notifiedStation ? `: ${alert.notifiedStation.name}` : ""} at{" "}
            {alert.notifiedAt && new Date(alert.notifiedAt).toLocaleString()}.
          </p>
        </>
      )}

      {alert.status === "resolved" && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Resolved at {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleString()} - alarm silenced.
        </p>
      )}

      {alert.status === "false_alarm" && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Marked as a false alarm{alert.verifiedBy ? ` by ${alert.verifiedBy.name || "a human verifier"}` : " by the ML model"} - alarm silenced, no station was notified.
        </p>
      )}
    </div>
  );
}
