import { useState } from "react";
import { addMedicationAPI, removeMedicationAPI } from "../../api/medicationAPI";

// Calculate days remaining
const getDaysRemaining = (med) => {
  if (med.ongoing || !med.durationDays || !med.startDate) return null;
  const start = new Date(med.startDate);
  start.setHours(0, 0, 0, 0);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + Number(med.durationDays));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function Medications({ meds, setMeds }) {
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "", durationDays: "", ongoing: false, notes: "" });
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", border: "2px solid #d1e9e7", borderRadius: "14px", padding: "14px 18px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0f4a47", background: "#f8fffe", boxSizing: "border-box" };
  const labelStyle = { fontSize: "14px", fontWeight: "700", color: "#0f4a47", display: "block", marginBottom: "8px" };

  const saveMed = async () => {
    if (!newMed.name || !newMed.dosage || !newMed.time) return;
    if (!newMed.ongoing && !newMed.durationDays) return;
    setLoading(true);
    try {
      const colors = ["#0f9b8e", "#6366f1", "#f97316", "#ec4899", "#14b8a6"];
      const res = await addMedicationAPI({
        name:         newMed.name,
        dosage:       newMed.dosage,
        time:         newMed.time,
        notes:        newMed.notes,
        durationDays: newMed.ongoing ? null : Number(newMed.durationDays),
        ongoing:      newMed.ongoing,
        color:        colors[Math.floor(Math.random() * colors.length)],
      });
      setMeds(prev => [...prev, res.data]);
      setNewMed({ name: "", dosage: "", time: "", durationDays: "", ongoing: false, notes: "" });
    } catch (err) {
      console.error("Failed to add medication:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeMed = async (id) => {
    try {
      await removeMedicationAPI(id);
      setMeds(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error("Failed to remove medication:", err);
    }
  };

  // Days remaining badge color
  const getDaysStyle = (days) => {
    if (days <= 3)  return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
    if (days <= 7)  return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    return              { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Add form ── */}
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>➕</div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>Add Medication</h2>
            <p style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "2px" }}>Fill in the details and save</p>
          </div>
        </div>

        <div className="mt-med-form-grid">
          <div><label style={labelStyle}>Medication Name</label><input type="text" placeholder="e.g. Metformin" value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Dosage</label><input type="text" placeholder="e.g. 500mg" value={newMed.dosage} onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Time to Take</label><input type="time" value={newMed.time} onChange={e => setNewMed(p => ({ ...p, time: e.target.value }))} style={inputStyle} /></div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Duration</label>
            <div style={{ display: "flex", background: "#f0fafa", borderRadius: "14px", padding: "4px", gap: "4px", marginBottom: "12px", border: "2px solid #d1e9e7" }}>
              {[{ key: false, icon: "📅", label: "Fixed (days)" }, { key: true, icon: "∞", label: "Ongoing" }].map(opt => {
                const active = newMed.ongoing === opt.key;
                return (
                  <button key={String(opt.key)} type="button"
                    onClick={() => setNewMed(p => ({ ...p, ongoing: opt.key, durationDays: "" }))}
                    style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", border: "none", background: active ? "#fff" : "transparent", color: active ? "#0a7a6e" : "#6b9e9a", fontWeight: active ? "700" : "500", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.18s" }}>
                    <span style={{ fontSize: "15px" }}>{opt.icon}</span> {opt.label}
                  </button>
                );
              })}
            </div>

            {!newMed.ongoing ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="number" min="1" placeholder="e.g. 14" value={newMed.durationDays || ""} onChange={e => setNewMed(p => ({ ...p, durationDays: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ fontSize: "14px", color: "#6b9e9a", fontWeight: "600", flexShrink: 0 }}>days</span>
                </div>
                {newMed.durationDays > 0 && (
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#0a7a6e", fontWeight: "600" }}>
                    ⏰ Auto-removed after {newMed.durationDays} day{newMed.durationDays > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: "12px 16px", background: "#e6f7f5", borderRadius: "12px", border: "1.5px solid #b2e4df", fontSize: "13px", color: "#0a7a6e", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>∞</span> This medication will stay active until you remove it manually.
              </div>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea placeholder="e.g. Take with food" value={newMed.notes || ""} onChange={e => setNewMed(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px", maxWidth: "400px" }}>
          <button onClick={() => setNewMed({ name: "", dosage: "", time: "", durationDays: "", ongoing: false, notes: "" })}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #d1e9e7", background: "#fff", fontSize: "14px", fontWeight: "700", color: "#6b9e9a", fontFamily: "inherit", cursor: "pointer" }}>
            Clear
          </button>
          <button onClick={saveMed} disabled={loading}
            style={{ flex: 2, padding: "13px", borderRadius: "12px", border: "none", background: loading ? "#b2d8d5" : "#0f9b8e", fontSize: "14px", fontWeight: "700", color: "#fff", fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : "💾 Save Medication"}
          </button>
        </div>
      </div>

      {/* ── Medication list ── */}
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📋</div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>My Medications</h2>
            <p style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "2px" }}>{meds.length} medication{meds.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {meds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b9e9a" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>💊</div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>No medications added yet</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {meds.map(med => {
              const daysLeft  = getDaysRemaining(med);
              const daysStyle = daysLeft !== null ? getDaysStyle(daysLeft) : null;

              return (
                <div key={med._id || med.id} style={{ padding: "16px 18px", borderRadius: "16px", background: "#f8fffe", border: `1.5px solid ${daysLeft !== null && daysLeft <= 3 ? "#fecaca" : "#e6f7f5"}`, display: "flex", flexDirection: "column", gap: "12px" }}>

                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: med.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>💊</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f4a47" }}>{med.name}</div>
                      <div style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "2px" }}>{med.dosage} · 🕐 {med.time}</div>
                    </div>
                  </div>

                  {/* Duration badge */}
                  {med.ongoing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "10px", background: "#e6f7f5", border: "1px solid #b2e4df" }}>
                      <span style={{ fontSize: "13px" }}>∞</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0a7a6e" }}>Ongoing</span>
                    </div>
                  ) : daysLeft !== null ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", background: daysStyle.bg, border: `1px solid ${daysStyle.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px" }}>
                          {daysLeft <= 3 ? "🔴" : daysLeft <= 7 ? "🟡" : "🟢"}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: daysStyle.color }}>
                          {daysLeft <= 0
                            ? "Expires today"
                            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: daysStyle.color, opacity: 0.75 }}>
                        of {med.durationDays}d course
                      </span>
                    </div>
                  ) : null}

                  {/* Notes */}
                  {med.notes && (
                    <div style={{ fontSize: "12px", color: "#6b9e9a", padding: "8px 12px", background: "#f0fafa", borderRadius: "10px", lineHeight: 1.5 }}>
                      📝 {med.notes}
                    </div>
                  )}

                  {/* Remove button */}
                  <button onClick={() => removeMed(med._id || med.id)}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: "13px", fontWeight: "700", fontFamily: "inherit", cursor: "pointer" }}>
                    🗑 Remove Medication
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}