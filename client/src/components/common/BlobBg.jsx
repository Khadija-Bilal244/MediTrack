import { T } from "../../constants/theme";

export default function BlobBg() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-160px", right: "-160px", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,155,142,0.18) 0%, transparent 70%)", animation: "floatA 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-120px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", animation: "floatB 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "50%", left: "20%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,155,142,0.07) 0%, transparent 70%)", animation: "floatA 12s ease-in-out infinite 3s" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.06 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={T.teal} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
