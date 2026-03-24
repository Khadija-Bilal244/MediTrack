import { useState } from "react";
import { T } from "../../constants/theme";

export default function OBtn({ label, onClick, disabled, loading, style: extra }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "16px", border: "none", borderRadius: "14px",
        fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        background: (disabled || loading) ? "#b2d8d5" : hover ? T.tealDark : T.teal,
        color: T.white,
        boxShadow: (disabled || loading) ? "none" : hover ? "0 8px 24px rgba(15,155,142,0.4)" : "0 4px 14px rgba(15,155,142,0.3)",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        ...extra,
      }}
    >
      {loading && (
        <span style={{ width: "18px", height: "18px", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
      )}
      {label}
    </button>
  );
}