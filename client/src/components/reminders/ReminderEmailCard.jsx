import { useState } from "react";
import { updateReminderEmailAPI } from "../../api/reminderEmailAPI";

const T = {
  teal:      "#0f9b8e",
  tealDark:  "#0a7a6e",
  tealLight: "#e6f7f5",
  bg:        "#f0fafa",
  white:     "#ffffff",
  text:      "#0f4a47",
  muted:     "#6b9e9a",
  border:    "#d1e9e7",
};

/**
 * ReminderEmailCard
 *
 * Drop this anywhere in the dashboard (Home page, profile section, etc.)
 * Props:
 *   user          — the current user object (needs user.reminderEmail)
 *   onUserUpdate  — callback(updatedFields) so parent can refresh user state
 */
export default function ReminderEmailCard({ user, onUserUpdate }) {
  const [email,   setEmail]   = useState(user?.reminderEmail || "");
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null);   // { type: "success"|"error", msg }

  const isActive  = Boolean(user?.reminderEmail);
  const isDirty   = email !== (user?.reminderEmail || "");

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await updateReminderEmailAPI(email);
      onUserUpdate?.({ reminderEmail: res.reminderEmail });
      setStatus({ type: "success", msg: res.message });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err?.response?.data?.message || "Failed to save. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await updateReminderEmailAPI("");
      setEmail("");
      onUserUpdate?.({ reminderEmail: null });
      setStatus({ type: "success", msg: res.message });
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to remove. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: T.white, borderRadius: "22px", padding: "28px 30px",
      border: `1.5px solid ${T.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "14px",
          background: isActive ? T.tealLight : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
        }}>
          📧
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800", fontSize: "15px", color: T.text }}>
            Email Reminders
          </div>
          <div style={{ fontSize: "13px", color: T.muted, marginTop: "2px" }}>
            {isActive
              ? `Active — sending to ${user.reminderEmail}`
              : "Off — add an email to receive medication reminders"}
          </div>
        </div>
        {/* Active badge */}
        <div style={{
          padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "700",
          background: isActive ? T.tealLight : "#f1f5f9",
          color: isActive ? T.teal : T.muted,
          flexShrink: 0,
        }}>
          {isActive ? "● Active" : "○ Off"}
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
          placeholder="Enter email for reminders…"
          style={{
            flex: 1, padding: "12px 16px", borderRadius: "12px",
            border: `1.5px solid ${T.border}`, background: T.bg,
            color: T.text, fontSize: "14px", fontFamily: "inherit",
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = T.teal}
          onBlur={(e)  => e.target.style.borderColor = T.border}
        />

        <button
          onClick={handleSave}
          disabled={loading || !email || !isDirty}
          style={{
            padding: "12px 22px", borderRadius: "12px", border: "none",
            background: loading || !email || !isDirty ? "#e2e8f0" : T.teal,
            color: loading || !email || !isDirty ? T.muted : "#fff",
            fontWeight: "700", fontSize: "14px", cursor: loading || !email || !isDirty ? "not-allowed" : "pointer",
            fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          {loading ? "Saving…" : "Save"}
        </button>

        {isActive && (
          <button
            onClick={handleRemove}
            disabled={loading}
            style={{
              padding: "12px 16px", borderRadius: "12px",
              border: "1.5px solid #fecaca", background: "#fff5f5",
              color: "#ef4444", fontWeight: "700", fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", flexShrink: 0, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff5f5"}
          >
            Remove
          </button>
        )}
      </div>

      {/* Status message */}
      {status && (
        <div style={{
          marginTop: "12px", padding: "10px 16px", borderRadius: "10px", fontSize: "13px",
          fontWeight: "600",
          background: status.type === "success" ? T.tealLight : "#fee2e2",
          color:      status.type === "success" ? T.teal      : "#991b1b",
        }}>
          {status.type === "success" ? "✅" : "⛔"} {status.msg}
        </div>
      )}

      {/* Helper text */}
      <p style={{ margin: "14px 0 0", fontSize: "12px", color: T.muted, lineHeight: "1.6" }}>
        You will receive an email at the exact scheduled time of each medication.
        You can use a different email than your login email.
      </p>
    </div>
  );
}
