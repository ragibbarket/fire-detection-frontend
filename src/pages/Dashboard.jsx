import { useEffect, useState } from "react";
import { getLatestReadings, getAlerts, labelReading } from "../api/client";
import socket from "../api/socket";
import SensorCard from "../components/SensorCard";
import AlertRow from "../components/AlertRow";
import MLConfidenceGauge from "../components/MLConfidenceGauge";

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labeling, setLabeling] = useState(false);
  const [justLabeled, setJustLabeled] = useState(null); // { readingId, label }

  useEffect(() => {
    async function load() {
      try {
        const [readings, alerts] = await Promise.all([getLatestReadings(1), getAlerts()]);
        setLatest(readings[0] || null);
        setRecentAlerts(alerts.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const onReading = (reading) => {
      setLatest(reading);
      setJustLabeled(null); // new reading arrived, clear the old confirmation
    };
    const onAlert = (alert) => setRecentAlerts((prev) => [alert, ...prev].slice(0, 5));

    socket.on("sensor:reading", onReading);
    socket.on("alert:new", onAlert);
    socket.on("alert:verified", onAlert);
    socket.on("alert:notified", onAlert);

    return () => {
      socket.off("sensor:reading", onReading);
      socket.off("alert:new", onAlert);
      socket.off("alert:verified", onAlert);
      socket.off("alert:notified", onAlert);
    };
  }, []);

  async function handleLabel(label) {
    if (!latest?._id) return;
    setLabeling(true);
    try {
      await labelReading(latest._id, label);
      setJustLabeled({ readingId: latest._id, label });
    } catch (err) {
      console.error("Failed to label reading", err);
    } finally {
      setLabeling(false);
    }
  }

  if (loading) return <p style={{ color: "var(--text-secondary)" }}>Loading...</p>;

  const isAlertState = latest?.mlPrediction === "fire";

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Live readings from the monitored site</p>

      <div
        className="card"
        style={{
          marginBottom: 24,
          background: isAlertState ? "var(--ember-bg)" : "var(--green-bg)",
          borderColor: isAlertState ? "var(--ember)" : "var(--green)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22, color: isAlertState ? "var(--ember)" : "var(--green)" }}>
          {isAlertState ? "\u25B2" : "\u25CF"}
        </span>
        <div>
          <p style={{ margin: 0, fontWeight: 500, color: isAlertState ? "var(--ember)" : "var(--green)" }}>
            {isAlertState ? "Suspicious reading detected" : "Area safe"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
            {latest ? `Last update: ${new Date(latest.createdAt).toLocaleTimeString()}` : "No readings yet"}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Live sensor readings</p>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <SensorCard label="Flame" value={latest?.flameDetected ? "Detected" : "None"} unit="" alert={latest?.flameDetected} />
        <SensorCard label="Smoke" value={latest?.smokeValue ?? "-"} unit="ppm" alert={latest?.smokeValue > 400} />
        <SensorCard label="Temperature" value={latest?.temperature ?? "-"} unit="&deg;C" alert={latest?.temperature > 45} />
        <SensorCard label="Humidity" value={latest?.humidity ?? "-"} unit="%" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <MLConfidenceGauge prediction={latest?.mlPrediction} confidence={latest?.mlConfidence} reasoning={latest?.mlReasoning} />
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500 }}>Testing right now? Label this exact reading</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          If you're physically testing (e.g. holding a lighter to the flame sensor) and the reading above
          doesn't look "suspicious" enough to trigger an alert, you can still teach the model the truth
          directly - this doesn't depend on what the ML predicted or whether an alert was created.
        </p>
        {justLabeled?.readingId === latest?._id ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--green)" }}>
            Labeled as {justLabeled.label === "fire" ? "real fire" : "not fire"} - thanks, this will be used next retrain.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" disabled={labeling || !latest} onClick={() => handleLabel("fire")} style={{ flex: 1, justifyContent: "center", borderColor: "var(--ember)", color: "var(--ember)" }}>
              This IS real fire
            </button>
            <button className="btn" disabled={labeling || !latest} onClick={() => handleLabel("false_alarm")} style={{ flex: 1, justifyContent: "center" }}>
              This is NOT fire
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Recent alerts</p>
      {recentAlerts.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No alerts yet.</p>}
      {recentAlerts.map((a) => (
        <AlertRow key={a._id} alert={a} />
      ))}
    </div>
  );
}
