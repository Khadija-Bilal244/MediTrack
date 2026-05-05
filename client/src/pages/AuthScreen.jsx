import { useState } from "react";
import { T } from "../constants/theme";
import OInput from "../components/common/OInput";
import OBtn   from "../components/common/OBtn";
import { loginAPI } from "../api/authAPI";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.includes("@"))
      e.email = "Please enter a valid email address.";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (mode === "signup" && form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        // Real API login
        const res = await loginAPI({ email: form.email, password: form.password });
        localStorage.setItem("token", res.token);
        localStorage.setItem("user",  JSON.stringify(res.user));
        onAuth({
          email:    form.email,
          isSignup: false,
          userData: res.user,
        });
      } else {
        // Signup — pass email + password forward to PersonalInfoScreen
        // Actual API call happens after personal info is collected
        onAuth({
          email:    form.email,
          password: form.password,
          isSignup: true,
        });
      }
    } catch (err) {
      setErrors({
        email: err.response?.data?.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", overflow: "auto" }}>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, background: `linear-gradient(145deg, ${T.tealDark} 0%, ${T.teal} 55%, #1dd4c6 100%)`, zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
        {[320, 520, 720].map((s, i) => (
          <div key={s} style={{ position: "absolute", top: "50%", left: "50%", width: `${s}px`, height: `${s}px`, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", transform: "translate(-50%,-50%)", animation: `floatA ${7 + i * 2}s ease-in-out infinite ${i * 1.5}s` }} />
        ))}
      </div>

      {/* Card */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "480px", margin: "40px 24px", background: "rgba(255,255,255,0.96)", borderRadius: "28px", padding: "48px 44px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", backdropFilter: "blur(20px)" }}>

        {/* Logo */}
        <div className="fade-up-1" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "36px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 14px rgba(15,155,142,0.4)" }}>
            ➕
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "900", color: T.text, letterSpacing: "-0.5px" }}>
            MediTrack
          </span>
        </div>

        {/* Toggle */}
        <div className="fade-up-1" style={{ display: "flex", background: T.bg, borderRadius: "14px", padding: "5px", marginBottom: "32px" }}>
          {["login", "signup"].map(m => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErrors({});
                setForm({ email: "", password: "", confirmPassword: "" });
              }}
              style={{ flex: 1, padding: "11px", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "700", background: mode === m ? T.teal : "transparent", color: mode === m ? T.white : T.muted, boxShadow: mode === m ? "0 4px 14px rgba(15,155,142,0.35)" : "none", transition: "all 0.22s" }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="fade-up-2" style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: "900", color: T.text, margin: "0 0 8px" }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ fontSize: "14px", color: T.muted, margin: 0 }}>
            {isSignup
              ? "Start managing your medications smarter."
              : "Sign in to continue to your dashboard."}
          </p>
        </div>

        {/* Form */}
        <div className="fade-up-3">
          <OInput
            label="Email address"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@email.com"
            icon="✉️"
            error={errors.email}
          />
          <OInput
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            icon="🔒"
            error={errors.password}
          />
          {isSignup && (
            <OInput
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="••••••••"
              icon="🔒"
              error={errors.confirmPassword}
            />
          )}
          {!isSignup && (
            <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", color: T.teal, fontWeight: "600", cursor: "pointer" }}>
                Forgot password?
              </span>
            </div>
          )}
          <OBtn
            label={isSignup ? "Continue →" : "Sign In"}
            onClick={submit}
            loading={loading}
          />
        </div>

        {/* Footer */}
        <div className="fade-up-5" style={{ marginTop: "24px", fontSize: "12px", color: T.muted, textAlign: "center" }}>
          By continuing you agree to our{" "}
          <span style={{ color: T.teal, fontWeight: "600" }}>Terms</span> and{" "}
          <span style={{ color: T.teal, fontWeight: "600" }}>Privacy Policy</span>
        </div>

      </div>
    </div>
  );
}
