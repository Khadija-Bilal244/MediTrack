import { T } from "../constants/theme";
import OBtn from "../components/common/OBtn";

export default function ProfileDisplay({ user, onEnterApp }) {
  const genderIcon = user.gender === "Male" ? "👨" : user.gender === "Female" ? "👩" : "🧑";
  const initials   = (user.firstName[0] || "") + (user.lastName[0] || "");

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", overflow: "auto" }}>
      <div style={{ position: "fixed", inset: 0, background: `linear-gradient(145deg, ${T.tealDark} 0%, ${T.teal} 55%, #1dd4c6 100%)`, zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
        {[320, 520, 720].map((s, i) => (
          <div key={s} style={{ position: "absolute", top: "50%", left: "50%", width: `${s}px`, height: `${s}px`, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", transform: "translate(-50%,-50%)", animation: `floatA ${7 + i * 2}s ease-in-out infinite ${i * 1.5}s` }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "460px", margin: "40px 24px", background: "rgba(255,255,255,0.96)", borderRadius: "28px", padding: "52px 44px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", backdropFilter: "blur(20px)", textAlign: "center" }}>
        <div className="scale-in" style={{ width: "76px", height: "76px", borderRadius: "24px", background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 24px", boxShadow: "0 12px 36px rgba(15,155,142,0.45)", color: "#fff", fontWeight: "900" }}>✓</div>

        <div className="fade-up-1">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: "900", color: T.text, margin: "0 0 8px" }}>You're all set!</h1>
          <p style={{ fontSize: "15px", color: T.muted, margin: "0 0 36px" }}>Here's your profile summary</p>
        </div>

        <div className="fade-up-2" style={{ width: "100px", height: "100px", borderRadius: "30px", background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "800", color: "#fff", margin: "0 auto 20px", boxShadow: "0 12px 36px rgba(15,155,142,0.45)" }}>
          {initials}
        </div>

        <div className="fade-up-2" style={{ marginBottom: "28px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "900", color: T.text, margin: "0 0 6px" }}>{user.firstName} {user.lastName}</h2>
          <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>{user.email}</p>
        </div>

        <div className="fade-up-3" style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "36px", flexWrap: "wrap" }}>
          {[{ icon: genderIcon, label: user.gender }, { icon: "🎂", label: `Age ${user.age}` }, { icon: "✅", label: "Active" }].map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", borderRadius: "99px", background: T.tealLight, border: `1.5px solid ${T.teal}30`, fontSize: "14px", fontWeight: "600", color: T.text }}>
              {p.icon} {p.label}
            </div>
          ))}
        </div>

        <div className="fade-up-4">
          <OBtn label="Go to Dashboard →" onClick={onEnterApp} />
        </div>
      </div>
    </div>
  );
}