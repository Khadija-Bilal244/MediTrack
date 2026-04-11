import { useState } from "react";
import { T } from "../constants/theme";
import { GENDERS } from "../constants/sampleData";
import OInput from "../components/common/OInput";
import OBtn   from "../components/common/OBtn";
import { registerAPI } from "../api/authAPI";

export default function PersonalInfoScreen({ email, password, onComplete }) {
  const [form, setForm]     = useState({ firstName: "", lastName: "", age: "", gender: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set  = (k) => (v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const setE = (k) => (e) => set(k)(e.target.value);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim())  e.lastName  = "Last name is required.";
    const a = parseInt(form.age);
    if (!form.age || isNaN(a) || a < 1 || a > 120) e.age = "Please enter a valid age (1–120).";
    if (!form.gender) e.gender = "Please select a gender.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await registerAPI({
        firstName: form.firstName,
        lastName:  form.lastName,
        email,
        password,
        age:       Number(form.age),
        gender:    form.gender,
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user",  JSON.stringify(res.user));
      onComplete({ ...form, email, userData: res.user });
    } catch (err) {
      setErrors({ firstName: err.response?.data?.message || "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.firstName[0] || "") + (form.lastName[0] || "");
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "Your Name";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", overflow: "auto" }}>
      <div style={{ position: "fixed", inset: 0, background: `linear-gradient(145deg, ${T.tealDark} 0%, ${T.teal} 55%, #1dd4c6 100%)`, zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
        {[300, 500, 700].map((s, i) => (
          <div key={s} style={{ position: "absolute", top: "50%", left: "50%", width: `${s}px`, height: `${s}px`, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", transform: "translate(-50%,-50%)", animation: `floatA ${7 + i * 2}s ease-in-out infinite ${i * 1.5}s` }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "560px", margin: "40px 24px", background: "rgba(255,255,255,0.96)", borderRadius: "28px", padding: "48px 44px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", backdropFilter: "blur(20px)" }}>
        <div className="fade-up-1 ob-info-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>➕</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "900", color: T.text }}>MediTrack</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: s === 3 ? T.teal : T.tealLight, border: `2px solid ${T.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: s === 3 ? "#fff" : T.teal }}>
                  {s < 3 ? "✓" : s}
                </div>
                {s < 3 && <div style={{ width: "20px", height: "2px", background: T.teal, borderRadius: "99px" }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up-1" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ width: "84px", height: "84px", borderRadius: "24px", background: initials ? `linear-gradient(135deg, ${T.teal}, ${T.tealDark})` : T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: initials ? "26px" : "34px", fontWeight: "800", color: initials ? "#fff" : T.muted, transition: "all 0.3s", marginBottom: "12px" }}>
            {initials || "👤"}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "900", color: T.text, margin: "0 0 4px", textAlign: "center" }}>{fullName}</h1>
          <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>{email}</p>
        </div>

        <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <OInput label="First name" value={form.firstName} onChange={setE("firstName")} placeholder="John" icon="✏️" error={errors.firstName} />
          <OInput label="Last name"  value={form.lastName}  onChange={setE("lastName")}  placeholder="Doe"  icon="✏️" error={errors.lastName} />
        </div>

        <div className="fade-up-3">
          <OInput label="Age" type="number" value={form.age} onChange={setE("age")} placeholder="e.g. 45" icon="🎂" error={errors.age} />
        </div>

        <div className="fade-up-3" style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: T.muted, textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: "10px" }}>Gender</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {GENDERS.map(g => {
              const active = form.gender === g;
              return (
                <button key={g} onClick={() => { set("gender")(g); setErrors(p => ({ ...p, gender: "" })); }}
                  style={{ padding: "13px 16px", border: `2px solid ${active ? T.teal : errors.gender ? T.error : T.border}`, borderRadius: "13px", background: active ? T.tealLight : T.white, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: active ? "700" : "500", color: active ? T.teal : errors.gender ? T.error : T.muted, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.18s" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${active ? T.teal : T.border}`, background: active ? T.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {active && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff", display: "block" }} />}
                  </span>
                  {g}
                </button>
              );
            })}
          </div>
          {errors.gender && <p style={{ margin: "6px 0 0", fontSize: "12px", color: T.error }}>{errors.gender}</p>}
        </div>

        {form.firstName && form.age && form.gender && (
          <div className="fade-up-4" style={{ background: T.tealLight, borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", border: `1.5px solid ${T.teal}40` }}>
            <div style={{ fontSize: "26px" }}>{form.gender === "Male" ? "👨" : form.gender === "Female" ? "👩" : "🧑"}</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: T.text }}>{fullName}</div>
              <div style={{ fontSize: "13px", color: T.muted, marginTop: "3px" }}>{form.gender} · Age {form.age}</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: "99px", background: T.teal, color: "#fff", fontSize: "12px", fontWeight: "700" }}>Preview</div>
          </div>
        )}

        <div className="fade-up-5">
          <OBtn label="Complete Setup →" onClick={submit} loading={loading} />
          <p style={{ textAlign: "center", fontSize: "12px", color: T.muted, marginTop: "14px" }}>You can update this information later in your profile settings.</p>
        </div>
      </div>
    </div>
  );
}