import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvite } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--surface-raised)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-primary)",
    fontSize: 14,
    marginBottom: 12,
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await acceptInvite(token, form.name, form.password);
      loginSuccess(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--ember)" }}>No invite token found in the link. Ask the device owner to resend it.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "var(--ember)", fontSize: 18 }}>&#9679;</span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>You're invited</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
          Set your name and a password to join this device's fire alert team.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Your name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />

          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Choose a password</label>
          <input
            type="password"
            style={inputStyle}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />

          {error && <p style={{ color: "var(--ember)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Joining..." : "Join device"}
          </button>
        </form>
      </div>
    </div>
  );
}
