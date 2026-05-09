import { useState, useEffect } from "react";
import { sendReminderCodeAPI, verifyReminderCodeAPI, updateReminderEmailAPI } from "../../api/reminderEmailAPI";

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

// ── tiny reusable button ──────────────────────────────────────────────────
const Btn = ({ onClick, disabled, variant = "primary", children, style = {} }) => {
  const base = {
    padding: "11px 22px", borderRadius: "12px", border: "none",
    fontWeight: "700", fontSize: "14px", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", transition: "background 0.15s", flexShrink: 0, ...style,
  };
  const variants = {
    primary: { background: disabled ? "#e2e8f0" : T.teal, color: disabled ? T.muted : "#fff" },
    danger:  { background: "#fff5f5", color: "#ef4444", border: "1.5px solid #fecaca" },
    ghost:   { background: "transparent", color: T.muted, border: `1.5px solid ${T.border}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

export default function ReminderEmailCard({ user, onUserUpdate }) {
  // step: "idle" | "entering_email" | "entering_code" | "active"
  const [step,      setStep]      = useState(user?.reminderEmail ? "active" : "idle");
  const [email,     setEmail]     = useState("");
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [status,    setStatus]    = useState(null);    // { type, msg }
  const [countdown, setCountdown] = useState(0);       // resend cooldown seconds

  // sync if parent user changes (e.g. on login)
  useEffect(() => {
    setStep(user?.reminderEmail ? "active" : "idle");
  }, [user?.reminderEmail]);

  // countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const showStatus = (type, msg) => setStatus({ type, msg });
  const clearStatus = () => setStatus(null);

  // ── Step 1: send OTP ────────────────────────────────────────────────────
  const handleSendCode = async () => {
    if (!email || !email.includes("@")) {
      showStatus("error", "Please enter a valid email address."); return;
    }
    setLoading(true); clearStatus();
    try {
      const res = await sendReminderCodeAPI(email);
      showStatus("success", res.message);
      setStep("entering_code");
      setCountdown(60);   // 60s before resend allowed
    } catch (err) {
      showStatus("error", err?.response?.data?.message || "Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true); clearStatus();
    try {
      const res = await sendReminderCodeAPI(email);
      showStatus("success", res.message);
      setCountdown(60);
    } catch (err) {
      showStatus("error", err?.response?.data?.message || "Failed to resend. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ───────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      showStatus("error", "Please enter the 6-digit code."); return;
    }
    setLoading(true); clearStatus();
    try {
      const res = await verifyReminderCodeAPI(email, code);
      onUserUpdate?.({ reminderEmail: res.reminderEmail });
      setStep("active");
      setCode("");
      showStatus("success", "✅ Email verified and saved!");
    } catch (err) {
      showStatus("error", err?.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Remove email ─────────────────────────────────────────────────────────
  const handleRemove = async () => {
    setLoading(true); clearStatus();
    try {
      await updateReminderEmailAPI("");
      onUserUpdate?.({ reminderEmail: null });
      setStep("idle");
      setEmail("");
      setCode("");
      showStatus("success", "Reminder email removed.");
    } catch (err) {
      showStatus("error", "Failed to remove. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isActive = step === "active";

  return (
    <div style={{
      background: T.white, borderRadius: "22px", padding: "28px 30px",
      border: `1.5px solid ${T.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "14px",
          background: isActive ? T.tealLight : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
        }}>📧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800", fontSize: "15px", color: T.text }}>Email Reminders</div>
          <div style={{ fontSize: "13px", color: T.muted, marginTop: "2px" }}>
            {isActive
              ? `Active — reminders sent to ${user.reminderEmail}`
              : "Verify an email to receive medication reminders"}
          </div>
        </div>
        <div style={{
          padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "700",
          background: isActive ? T.tealLight : "#f1f5f9",
          color: isActive ? T.teal : T.muted, flexShrink: 0,
        }}>
          {isActive ? "● Active" : "○ Off"}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          STEP: IDLE — enter email
      ══════════════════════════════════════════════════ */}
      {step === "idle" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearStatus(); }}
            placeholder="Enter email for reminders…"
            onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: "12px",
              border: `1.5px solid ${T.border}`, background: T.bg,
              color: T.text, fontSize: "14px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => e.target.style.borderColor = T.teal}
            onBlur={(e)  => e.target.style.borderColor = T.border}
          />
          <Btn onClick={handleSendCode} disabled={loading || !email}>
            {loading ? "Sending…" : "Send Code"}
          </Btn>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP: ENTERING CODE — verify OTP
      ══════════════════════════════════════════════════ */}
      {step === "entering_code" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Email being verified */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", background: T.bg, borderRadius: "12px",
            border: `1.5px solid ${T.border}`,
          }}>
            <div style={{ fontSize: "14px", color: T.text }}>
              📨 Code sent to <strong>{email}</strong>
            </div>
            <button
              onClick={() => { setStep("idle"); setCode(""); clearStatus(); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "13px", fontWeight: "600" }}
            >
              Change
            </button>
          </div>

          {/* Code input */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearStatus(); }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: "12px",
                border: `1.5px solid ${T.border}`, background: T.bg,
                color: T.text, fontSize: "18px", fontFamily: "monospace",
                letterSpacing: "6px", fontWeight: "700",
                outline: "none", boxSizing: "border-box", textAlign: "center",
              }}
              onFocus={(e) => e.target.style.borderColor = T.teal}
              onBlur={(e)  => e.target.style.borderColor = T.border}
            />
            <Btn onClick={handleVerify} disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Verify"}
            </Btn>
          </div>

          {/* Resend */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: T.muted }}>Didn't receive it? </span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              style={{
                background: "none", border: "none", cursor: countdown > 0 ? "not-allowed" : "pointer",
                color: countdown > 0 ? T.muted : T.teal, fontSize: "13px",
                fontWeight: "700", fontFamily: "inherit", padding: 0,
              }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP: ACTIVE — email is verified
      ══════════════════════════════════════════════════ */}
      {step === "active" && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            flex: 1, padding: "12px 16px", borderRadius: "12px",
            border: `1.5px solid ${T.tealLight}`, background: T.tealLight,
            fontSize: "14px", color: T.teal, fontWeight: "600",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span>✅</span> {user?.reminderEmail}
          </div>
          <Btn variant="danger" onClick={handleRemove} disabled={loading}>
            {loading ? "Removing…" : "Remove"}
          </Btn>
          <Btn variant="ghost" onClick={() => { setStep("idle"); setEmail(""); clearStatus(); }} disabled={loading}>
            Change
          </Btn>
        </div>
      )}

      {/* ── Status message ── */}
      {status && (
        <div style={{
          marginTop: "14px", padding: "10px 16px", borderRadius: "10px",
          fontSize: "13px", fontWeight: "600",
          background: status.type === "success" ? T.tealLight : "#fee2e2",
          color:      status.type === "success" ? T.teal      : "#991b1b",
        }}>
          {status.msg}
        </div>
      )}

      {/* ── Helper text ── */}
      {step !== "active" && (
        <p style={{ margin: "14px 0 0", fontSize: "12px", color: T.muted, lineHeight: "1.6" }}>
          You will receive a 6-digit code to verify ownership of the email.
          Once verified, reminders will be sent at each medication's scheduled time.
        </p>
      )}
    </div>
  );
}
