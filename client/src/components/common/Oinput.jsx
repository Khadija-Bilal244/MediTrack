import { useState } from "react";
import { T } from "../../constants/theme";

export default function OInput({ label, type = "text", value, onChange, placeholder, icon, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      {label && (
        <label style={{ fontSize: "12px", fontWeight: "700", color: T.muted, textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", pointerEvents: "none" }}>{icon}</span>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: icon ? "15px 18px 15px 48px" : "15px 18px",
            border: `2px solid ${error ? T.error : focused ? T.teal : T.border}`,
            borderRadius: "14px", fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
            outline: "none", background: T.white, color: T.text,
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? `0 0 0 4px ${T.teal}18` : "none",
          }}
        />
      </div>
      {error && <p style={{ margin: "6px 0 0", fontSize: "12px", color: T.error, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
}