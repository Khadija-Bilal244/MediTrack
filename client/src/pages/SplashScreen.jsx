import { useState, useEffect } from "react";
import { T } from "../constants/theme";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("tagline"), 1200);
    const t2 = setTimeout(() => setPhase("exit"),    3000);
    const t3 = setTimeout(onDone,                    3600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: `linear-gradient(145deg, ${T.tealDark} 0%, ${T.teal} 60%, #1dd4c6 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: phase === "exit" ? 0 : 1, transition: "opacity 0.6s ease" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[320, 480, 640].map((s, i) => (
          <div key={s} style={{ position: "absolute", top: "50%", left: "50%", width: `${s}px`, height: `${s}px`, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", transform: "translate(-50%,-50%)", animation: `floatA ${6 + i * 2}s ease-in-out infinite ${i * 1.5}s` }} />
        ))}
      </div>

      <div className="scale-in" style={{ width: "110px", height: "110px", borderRadius: "32px", background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", marginBottom: "28px", backdropFilter: "blur(12px)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", position: "relative" }}>
        <span style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>➕</span>
        <div style={{ position: "absolute", inset: "-8px", borderRadius: "38px", border: "2px solid rgba(255,255,255,0.35)", animation: "pulse-ring 2s ease-out infinite" }} />
      </div>

      <div className="fade-up-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "44px", fontWeight: "900", color: "#fff", letterSpacing: "-1px" }}>
        Medi<span style={{ fontStyle: "italic", opacity: 0.85 }}>Track</span>
      </div>

      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.75)", marginTop: "12px", opacity: phase !== "logo" ? 1 : 0, transform: phase !== "logo" ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        Your trusted health companion
      </div>

      <div style={{ marginTop: "60px", display: "flex", gap: "8px", opacity: phase === "logo" ? 0 : 1, transition: "opacity 0.4s ease 0.3s" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.6)", animation: `pulse-ring 1.2s ease-out infinite ${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}