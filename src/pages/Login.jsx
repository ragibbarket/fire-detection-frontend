import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerOwner } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register-owner"
  const [form, setForm] = useState({ deviceId: "esp32-01", name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await login(form.email, form.password)
          : await registerOwner(form.deviceId, form.name, form.email, form.phone, form.password);
      loginSuccess(result.token, result.user, result.memberships);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ color: "var(--ember)", fontSize: 18 }}>&#9679;</span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Fire guard</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className="btn"
            onClick={() => setMode("login")}
            style={{ flex: 1, justifyContent: "center", background: mode === "login" ? "var(--surface-raised)" : "transparent" }}
          >
            Log in
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setMode("register-owner")}
            style={{ flex: 1, justifyContent: "center", background: mode === "register-owner" ? "var(--surface-raised)" : "transparent" }}
          >
            First-time setup
          </button>
        </div>

        {mode === "register-owner" && (
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
            Only use this once, to register the device's first owner. After that, the owner invites
            everyone else - they should use "Log in" or the link from their invite email.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register-owner" && (
            <>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Device ID</label>
              <input style={{ ...inputStyle, opacity: 0.7, cursor: "not-allowed" }} value={form.deviceId} readOnly required />
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Your name</label>
              <input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </>
          )}

          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Email</label>
          <input type="email" style={inputStyle} value={form.email} onChange={(e) => update("email", e.target.value)} required />

          {mode === "register-owner" && (
            <>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Phone number (for SMS alerts)</label>
              <input
                type="tel"
                style={inputStyle}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                pattern="(\+[1-9][0-9]{7,14}|01[0-9]{9})"
                title="Enter a valid phone number, e.g. 01712345678 or +8801712345678"
                required
              />
            </>
          )}

          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Password</label>
          <input type="password" style={inputStyle} value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />

          {error && <p style={{ color: "var(--ember)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create owner account"}
          </button>
        </form>
      </div>
    </div>
  );
}
