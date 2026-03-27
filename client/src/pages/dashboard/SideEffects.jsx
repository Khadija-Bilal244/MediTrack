import { useState, useEffect } from "react";
import { getSideEffectsAPI, logSideEffectAPI, deleteSideEffectAPI } from "../../api/sideEffectAPI";

const severityColor = (s) =>
  s === "Mild"     ? { bg: "#dcfce7", color: "#166534" } :
  s === "Moderate" ? { bg: "#fef3c7", color: "#92400e" } :
                     { bg: "#fee2e2", color: "#991b1b" };

export default function SideEffects({ meds }) {
  const [list, setList]           = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEffect, setNewEffect] = useState({ med: "", effect: "", severity: "Mild" });
  const [loading, setLoading]     = useState(false);

  const inputStyle = {
    width:        "100%",
    border:       "2px solid #d1e9e7",
    borderRadius: "14px",
    padding:      "14px 18px",
    fontSize:     "15px",
    outline:      "none",
    fontFamily:   "inherit",
    color:        "#0f4a47",
    background:   "#f8fffe",
    boxSizing:    "border-box",
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await getSideEffectsAPI();
        setList(res.data);
      } catch (err) {
        console.error("Failed to fetch side effects:", err);
      }
    };
    fetchList();
  }, []);

  const save = async () => {
    if (!newEffect.med || !newEffect.effect) return;
    setLoading(true);
    try {
      const res = await logSideEffectAPI(newEffect);
      setList(prev => [res.data, ...prev]);
      setNewEffect({ med: "", effect: "", severity: "Mild" });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to log side effect:", err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteSideEffectAPI(id);
      setList(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error("Failed to delete side effect:", err);
    }
  };

  return (
    <div>

      {/* Log button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: "16px", padding: "16px 32px", fontSize: "15px", fontWeight: "700", fontFamily: "inherit", cursor: "pointer" }}
        >
          + Log a Side Effect
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9bbcba" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚡</div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>No side effects logged yet</div>
          </div>
        )}

        {list.map(se => {
          const sc = severityColor(se.severity);
          return (
            <div
              key={se._id}
              style={{ background: "#fff", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
            >
              {/* Icon */}
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                ⚡
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f4a47" }}>{se.effect}</div>
                <div style={{ fontSize: "13px", color: "#6b9e9a", marginTop: "4px", wordBreak: "break-word" }}>
                  {se.med} · {new Date(se.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {/* Severity badge */}
              <span style={{ padding: "8px 20px", borderRadius: "99px", fontSize: "13px", fontWeight: "700", background: sc.bg, color: sc.color, flexShrink: 0 }}>
                {se.severity}
              </span>

              {/* Delete button — fixed size box so it never overflows */}
              <button
                onClick={() => remove(se._id)}
                style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1.5px solid #fecaca", background: "#fff5f5", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div
            className="mt-modal-box"
            style={{ width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f4a47", marginBottom: "28px" }}>
              Log a Side Effect
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Medication */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Which Medication?
                </label>
                <select
                  value={newEffect.med}
                  onChange={e => setNewEffect(p => ({ ...p, med: e.target.value }))}
                  style={{ ...inputStyle, appearance: "auto" }}
                >
                  <option value="">Select a medication</option>
                  {meds.map(m => (
                    <option key={m._id || m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Effect */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  What did you feel?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nausea, Dizziness, Headache"
                  value={newEffect.effect}
                  onChange={e => setNewEffect(p => ({ ...p, effect: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Severity */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b9e9a", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  How severe was it?
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Mild", "Moderate", "Severe"].map(s => {
                    const sc     = severityColor(s);
                    const active = newEffect.severity === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setNewEffect(p => ({ ...p, severity: s }))}
                        style={{ flex: 1, padding: "14px 8px", borderRadius: "14px", border: `3px solid ${active ? sc.color : "transparent"}`, background: sc.bg, color: sc.color, fontFamily: "inherit", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s" }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button
                onClick={() => { setShowModal(false); setNewEffect({ med: "", effect: "", severity: "Mild" }); }}
                style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "2px solid #d1e9e7", background: "#fff", fontSize: "15px", fontWeight: "700", color: "#6b9e9a", fontFamily: "inherit", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                style={{ flex: 1, padding: "15px", borderRadius: "14px", border: "none", background: loading ? "#b2d8d5" : "#f97316", fontSize: "15px", fontWeight: "700", color: "#fff", fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
