import { useEffect, useState } from "react";
import { getMembers, inviteMember, removeMember } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Members() {
  const { myDevice, myRole, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isOwner = myRole === "owner";
  const MAX_USERS = 5;

  useEffect(() => {
    if (!myDevice) return;
    load();
  }, [myDevice]);

  async function load() {
    setLoading(true);
    try {
      const list = await getMembers(myDevice);
      setMembers(list);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setInviting(true);
    try {
      await inviteMember(myDevice, inviteEmail);
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId, name) {
    if (!window.confirm(`Remove ${name} from this device? This is permanent - they'll need a new invite to rejoin.`)) {
      return;
    }
    setError(null);
    setRemovingId(userId);
    try {
      await removeMember(myDevice, userId);
      setMembers((prev) => prev.filter((m) => m.user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  }

  if (!myDevice) {
    return <p style={{ color: "var(--text-secondary)" }}>You're not linked to any device yet.</p>;
  }

  return (
    <div>
      <h1 className="page-title">Team</h1>
      <p className="page-subtitle">
        Everyone here can verify alerts and notify fire stations. Only the owner can invite or remove people.
      </p>

      {error && <p style={{ color: "var(--ember)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 12 }}>{success}</p>}

      {isOwner && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 500 }}>
            Invite someone ({members.length}/{MAX_USERS} slots used)
          </p>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: 10 }}>
            <input
              type="email"
              required
              placeholder="their.email@gmail.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={members.length >= MAX_USERS}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 8,
                background: "var(--surface-raised)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            />
            <button className="btn btn-primary" disabled={inviting || members.length >= MAX_USERS} type="submit">
              {inviting ? "Sending..." : "Invite"}
            </button>
          </form>
          {members.length >= MAX_USERS && (
            <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 8 }}>
              Maximum of {MAX_USERS} active users reached. Remove someone to free a slot.
            </p>
          )}
        </div>
      )}

      {loading && <p style={{ color: "var(--text-secondary)" }}>Loading...</p>}

      {!loading &&
        members.map((m) => (
          <div key={m._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                {m.user.name} {m.user.email === user?.email && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(you)</span>}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{m.user.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge ${m.role === "owner" ? "badge-info" : "badge-success"}`}>{m.role}</span>
              {isOwner && m.role !== "owner" && (
                <button
                  className="btn"
                  disabled={removingId === m.user._id}
                  onClick={() => handleRemove(m.user._id, m.user.name)}
                  style={{ borderColor: "var(--ember)", color: "var(--ember)" }}
                >
                  {removingId === m.user._id ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
