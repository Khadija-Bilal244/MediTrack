import { useState, useEffect } from "react";
import { getCaregiversAPI, addCaregiverAPI, removeCaregiverAPI } from "../../api/caregiverAPI";

export default function Caregivers() {
  const [caregivers, setCaregivers]     = useState([]);
  const [newCaregiver, setNewCaregiver] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw]             = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const inputStyle = { width: "100%", border: "2px solid #d1e9e7", borderRadius: "14px", padding: "14px 18px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0f4a47", background: "#f8fffe", boxSizing: "border-box" };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCaregiversAPI();
        setCaregivers(res.data);
      } catch (err) {
        console.error("Failed to fetch caregivers:", err);
      }
    };
    fetch();
  }, []);

  const add = async () => {
    if (!newCaregiver.name.trim())  { setError("Name is required."); return; }
    if (!newCaregiver.email.trim() || !/\S+@\S+\.\S+/.test(newCaregiver.email)) { setError("A valid email is required."); return; }
    if (!newCaregiver.password || newCaregiver.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await addCaregiverAPI(newCaregiver);
      setCaregivers(prev => [...prev, res.data]);
      setNewCaregiver({ name: "", email: "", password: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add caregiver.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await removeCaregiverAPI(id);
      setCaregivers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Failed to remove caregiver:", err);
    }
  };

  const avatarColors    = ["#0f9b8e","#6366f1","#f97316","#ec4899","#14b8a6"];
  const accentGradients = ["linear-gradient(90deg,#0f9b8e,#1dd4c6)","linear-gradient(90deg,#6366f1,#a5b4fc)","linear-gradient(90deg,#f97316,#fbbf24)","linear-gradient(90deg,#ec4899,#f9a8d4)","linear-gradient(90deg,#14b8a6,#5eead4)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* List */}
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👥</div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>Connected Caregivers</h2>
            <p style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "4px" }}>{caregivers.length} caregiver{caregivers.length !== 1 ? "s" : ""} on your care team</p>
          </div>
        </div>
        {caregivers.length === 0 ? (
          <div style={{ padding: "48px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>👥</div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f4a47", marginBottom: "6px" }}>No caregivers yet</div>
            <div style={{ fontSize: "13px", color: "#6b9e9a" }}>Add a caregiver using the form below</div>
          </div>
        ) : (
          <div className="mt-cg-grid">
            {caregivers.map((c, idx) => {
              const ci = c.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={c._id} className="mt-cg-card">
                  <div className="mt-cg-card-accent" style={{ background: accentGradients[idx % 5] }} />
                  <div className="mt-cg-card-body">
                    <div className="mt-cg-card-top">
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: avatarColors[idx % 5], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "18px", flexShrink: 0 }}>{ci}</div>
                      <div className="mt-cg-card-info">
                        <div className="mt-cg-card-name">{c.name}</div>
                        <div className="mt-cg-card-role">🏷️ {c.role}</div>
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#dcfce7", color: "#166534", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>✓ Active</span>
                    </div>
                    <div className="mt-cg-card-meta">
                      <div className="mt-cg-card-meta-row"><span>✉️</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span></div>
                    </div>
                  </div>
                  <div className="mt-cg-card-footer">
                    <button onClick={() => remove(c._id)} className="mt-cg-remove-btn">🗑 Remove Caregiver</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add form */}
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid #f0fafa" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "15px", background: "linear-gradient(135deg,#0f9b8e,#0a7a6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>➕</div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>Add New Caregiver</h2>
            <p style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "3px" }}>Connect a caregiver to your account</p>
          </div>
        </div>
        <div className="mt-cg-form-grid">
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>👤</span>
              <input type="text" placeholder="e.g. Sarah Johnson" value={newCaregiver.name} onChange={e => { setNewCaregiver(p => ({ ...p, name: e.target.value })); setError(""); }} style={{ ...inputStyle, paddingLeft: "44px" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>✉️</span>
              <input type="email" placeholder="e.g. sarah@email.com" value={newCaregiver.email} onChange={e => { setNewCaregiver(p => ({ ...p, email: e.target.value })); setError(""); }} style={{ ...inputStyle, paddingLeft: "44px" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔒</span>
              <input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={newCaregiver.password} onChange={e => { setNewCaregiver(p => ({ ...p, password: e.target.value })); setError(""); }} style={{ ...inputStyle, paddingLeft: "44px", paddingRight: "52px" }} />
              <button onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b9e9a", padding: 0 }}>{showPw ? "🙈" : "👁️"}</button>
            </div>
          </div>
        </div>
        {error && (
          <div style={{ background: "#fee2e2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#991b1b", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
            <span>⚠️</span> {error}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", maxWidth: "400px" }}>
          <button onClick={() => { setNewCaregiver({ name: "", email: "", password: "" }); setError(""); }} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #d1e9e7", background: "transparent", fontSize: "14px", fontWeight: "700", color: "#6b9e9a", fontFamily: "inherit", cursor: "pointer" }}>Clear</button>
          <button onClick={add} disabled={loading} style={{ flex: 2, padding: "13px", borderRadius: "12px", border: "none", background: loading ? "#b2d8d5" : "linear-gradient(135deg,#0f9b8e,#0a7a6e)", fontSize: "14px", fontWeight: "700", color: "#fff", fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Adding..." : "+ Add Caregiver"}
          </button>
        </div>
      </div>
    </div>
  );
}
