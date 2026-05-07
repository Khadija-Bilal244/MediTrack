import { useState, useEffect } from "react";
import { predictHeartRiskAPI, getHeartRiskHistoryAPI } from "../../api/heartRiskAPI";

/* ─── colour tokens (matches theme.js) ─────────────────────────────────── */
const T = {
  teal:      "#0f9b8e",
  tealDark:  "#0a7a6e",
  tealLight: "#e6f7f5",
  bg:        "#f0fafa",
  white:     "#ffffff",
  text:      "#0f4a47",
  muted:     "#6b9e9a",
  border:    "#d1e9e7",
  error:     "#ef4444",
};

/* ─── field definitions ─────────────────────────────────────────────────── */
const FIELDS = [
  {
    key: "male", label: "Sex", type: "select",
    options: [{ value: 1, label: "Male" }, { value: 0, label: "Female" }],
    group: "Personal",
  },
  { key: "age",       label: "Age",              type: "number", placeholder: "e.g. 45",    group: "Personal" },
  {
    key: "education", label: "Education Level", type: "select",
    options: [
      { value: 1, label: "1 – Some High School" },
      { value: 2, label: "2 – High School / GED" },
      { value: 3, label: "3 – Some College / Vocational" },
      { value: 4, label: "4 – College Degree +" },
    ],
    group: "Personal",
  },
  {
    key: "currentSmoker", label: "Current Smoker", type: "select",
    options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
    group: "Lifestyle",
  },
  { key: "cigsPerDay",      label: "Cigarettes / Day",    type: "number", placeholder: "0 if non-smoker",  group: "Lifestyle" },
  {
    key: "BPMeds", label: "On Blood Pressure Medication", type: "select",
    options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
    group: "Medical History",
  },
  {
    key: "prevalentStroke", label: "Previous Stroke", type: "select",
    options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
    group: "Medical History",
  },
  {
    key: "prevalentHyp", label: "Hypertension", type: "select",
    options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
    group: "Medical History",
  },
  {
    key: "diabetes", label: "Diabetes", type: "select",
    options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
    group: "Medical History",
  },
  { key: "totChol",   label: "Total Cholesterol (mg/dL)",  type: "number", placeholder: "e.g. 200", group: "Clinical Measurements" },
  { key: "sysBP",     label: "Systolic BP (mmHg)",         type: "number", placeholder: "e.g. 120", group: "Clinical Measurements" },
  { key: "diaBP",     label: "Diastolic BP (mmHg)",        type: "number", placeholder: "e.g. 80",  group: "Clinical Measurements" },
  { key: "BMI",       label: "BMI",                        type: "number", placeholder: "e.g. 24.5", group: "Clinical Measurements" },
  { key: "heartRate", label: "Resting Heart Rate (bpm)",   type: "number", placeholder: "e.g. 72",  group: "Clinical Measurements" },
  { key: "glucose",   label: "Glucose Level (mg/dL)",      type: "number", placeholder: "e.g. 85",  group: "Clinical Measurements" },
];

const GROUPS = ["Personal", "Lifestyle", "Medical History", "Clinical Measurements"];

const EMPTY_FORM = Object.fromEntries(FIELDS.map(f => [f.key, ""]));

/* ─── helpers ───────────────────────────────────────────────────────────── */
const riskColor = (risk) =>
  risk === 1
    ? { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" }
    : { bg: "#dcfce7", color: "#166534", border: "#86efac" };

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{
      width: "22px", height: "22px",
      border: "3px solid rgba(255,255,255,0.35)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function HeartRisk() {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [result,  setResult]  = useState(null);   // latest prediction response
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("form");  // "form" | "history"

  /* load history on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await getHeartRiskHistoryAPI();
        setHistory(res.data || []);
      } catch (_) {
        /* silently ignore — history is non-critical */
      } finally {
        setHistLoading(false);
      }
    })();
  }, []);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await predictHeartRiskAPI(form);
      setResult(res.data);
      setHistory(prev => [res.data, ...prev]);
      setTab("form");   // keep on form tab to show the result banner
      // scroll to top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Prediction failed. Ensure the ML service is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Page header ── */}
      <div style={{
        background: T.white, borderRadius: "22px", padding: "28px 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1.5px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: "#fee2e2", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "28px", flexShrink: 0,
        }}>❤️</div>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: T.text }}>
            Heart Disease Risk Prediction
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: T.muted }}>
            10-year cardiovascular risk assessment powered by machine learning.
            Enter your clinical details below for a personalised prediction.
          </p>
        </div>
      </div>

      {/* ── Result banner (shown after a prediction) ── */}
      {result && (() => {
        const rc = riskColor(result.risk);
        return (
          <div style={{
            background: rc.bg, border: `2px solid ${rc.border}`,
            borderRadius: "20px", padding: "24px 28px",
            display: "flex", alignItems: "center", gap: "20px",
          }}>
            <div style={{ fontSize: "44px" }}>{result.risk === 1 ? "⚠️" : "✅"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "22px", fontWeight: "900", color: rc.color }}>
                {result.label}
              </div>
              <div style={{ fontSize: "14px", color: rc.color, marginTop: "4px", opacity: 0.85 }}>
                {result.risk === 1
                  ? "Based on the provided clinical data, there is an elevated 10-year risk of heart disease. Please consult your healthcare provider."
                  : "Based on the provided clinical data, the 10-year cardiovascular risk appears low. Continue healthy habits!"}
              </div>
              {result.probability !== null && (
                <div style={{
                  marginTop: "12px", display: "inline-block",
                  background: "rgba(0,0,0,0.08)", borderRadius: "99px",
                  padding: "6px 16px", fontSize: "14px", fontWeight: "700", color: rc.color,
                }}>
                  Risk probability: {result.probability}%
                </div>
              )}
            </div>
            <button
              onClick={() => setResult(null)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "20px", color: rc.color, opacity: 0.6, flexShrink: 0,
              }}
            >✕</button>
          </div>
        );
      })()}

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: "#fee2e2", border: "2px solid #fca5a5",
          borderRadius: "16px", padding: "18px 24px",
          display: "flex", gap: "14px", alignItems: "center",
        }}>
          <span style={{ fontSize: "22px" }}>⛔</span>
          <div style={{ flex: 1, color: "#991b1b", fontSize: "14px", fontWeight: "600" }}>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#991b1b" }}
          >✕</button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "8px" }}>
        {["form", "history"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px", borderRadius: "12px",
              border: `1.5px solid ${tab === t ? T.teal : T.border}`,
              background: tab === t ? T.teal : T.white,
              color:      tab === t ? "#fff"  : T.muted,
              fontWeight: "700", fontSize: "14px", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {t === "form" ? "🩺 New Assessment" : `📜 History (${history.length})`}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: FORM
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {GROUPS.map(group => {
            const groupFields = FIELDS.filter(f => f.group === group);
            return (
              <div key={group} style={{
                background: T.white, borderRadius: "22px", padding: "28px 32px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: `1.5px solid ${T.border}`,
              }}>
                <h3 style={{
                  margin: "0 0 20px", fontSize: "15px", fontWeight: "800",
                  color: T.text, display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{
                    width: "32px", height: "32px", borderRadius: "10px",
                    background: T.tealLight, display: "inline-flex",
                    alignItems: "center", justifyContent: "center", fontSize: "16px",
                  }}>
                    {group === "Personal" ? "👤"
                      : group === "Lifestyle" ? "🚬"
                      : group === "Medical History" ? "🏥"
                      : "🔬"}
                  </span>
                  {group}
                </h3>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "16px",
                }}>
                  {groupFields.map(field => (
                    <div key={field.key}>
                      <label style={{
                        display: "block", fontSize: "13px", fontWeight: "700",
                        color: T.muted, marginBottom: "8px",
                      }}>
                        {field.label}
                      </label>

                      {field.type === "select" ? (
                        <select
                          value={form[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          style={{
                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                            border: `1.5px solid ${T.border}`, background: T.bg,
                            color: T.text, fontSize: "14px", fontFamily: "inherit",
                            outline: "none", cursor: "pointer",
                            appearance: "none",
                          }}
                        >
                          <option value="">Select…</option>
                          {field.options.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={form[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          style={{
                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                            border: `1.5px solid ${T.border}`, background: T.bg,
                            color: T.text, fontSize: "14px", fontFamily: "inherit",
                            outline: "none", boxSizing: "border-box",
                          }}
                          onFocus={e  => e.target.style.borderColor = T.teal}
                          onBlur={e   => e.target.style.borderColor = T.border}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "16px 32px", borderRadius: "14px", border: "none",
              background: loading ? T.tealDark : T.teal,
              color: "#fff", fontWeight: "800", fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "12px", transition: "background 0.2s", alignSelf: "flex-start",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.tealDark; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.teal; }}
          >
            {loading ? <><Spinner /> Predicting…</> : "❤️ Predict My Risk"}
          </button>

          {/* Disclaimer */}
          <p style={{
            fontSize: "12px", color: T.muted, marginTop: "-8px",
            padding: "0 4px", lineHeight: "1.6",
          }}>
            ⚠️ <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and
            does not constitute medical advice. Always consult a qualified healthcare professional
            for diagnosis and treatment.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "history" && (
        <div style={{
          background: T.white, borderRadius: "22px", padding: "28px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1.5px solid ${T.border}`,
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "800", color: T.text }}>
            📜 Past Assessments
          </h3>

          {histLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: T.muted }}>
              <div style={{
                width: "36px", height: "36px", border: `3px solid ${T.tealLight}`,
                borderTopColor: T.teal, borderRadius: "50%",
                animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
              }} />
              Loading history…
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.muted }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
              <div style={{ fontWeight: "700", fontSize: "15px" }}>No assessments yet</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>
                Complete the form to run your first prediction.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history.map((item, i) => {
                const rc = riskColor(item.risk);
                return (
                  <div key={item._id || i} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "18px 20px", borderRadius: "16px",
                    background: "#f8fffe", border: `1.5px solid ${T.tealLight}`,
                  }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "14px",
                      background: rc.bg, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "22px", flexShrink: 0,
                    }}>
                      {item.risk === 1 ? "⚠️" : "✅"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "800", fontSize: "15px", color: rc.color }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "12px", color: T.muted, marginTop: "3px" }}>
                        Age {item.age} · BMI {item.BMI} · BP {item.sysBP}/{item.diaBP} mmHg
                        {item.probability !== null && ` · Risk probability: ${item.probability}%`}
                      </div>
                    </div>

                    <div style={{
                      fontSize: "12px", color: T.muted, textAlign: "right", flexShrink: 0,
                    }}>
                      {fmtDate(item.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
