import { useState, useEffect } from "react";
import { getPatientDataAPI, getPatientReportsAPI } from "../api/caregiverAPI";

const TABS = [
  { id: "overview", label: "Overview",    icon: "🏠" },
  { id: "meds",     label: "Medications", icon: "💊" },
  { id: "reports",  label: "Reports",     icon: "📊" },
];

const severityColor = (s) =>
  s === "Mild"     ? { bg: "#dcfce7", color: "#166534" } :
  s === "Moderate" ? { bg: "#fef3c7", color: "#92400e" } :
                     { bg: "#fee2e2", color: "#991b1b" };

// Calculate days remaining for fixed-duration meds
const getDaysRemaining = (med) => {
  if (med.ongoing || !med.durationDays || !med.startDate) return null;
  const start = new Date(med.startDate);
  start.setHours(0, 0, 0, 0);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + Number(med.durationDays));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getDaysStyle = (days) => {
  if (days <= 3) return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
  if (days <= 7) return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
  return             { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
};

export default function CaregiverDashboard({ caregiver, patient, meds, onSignOut }) {
  const [activeTab, setActiveTab]     = useState("overview");
  const [now, setNow]                 = useState(new Date());
  const [patientInfo, setPatientInfo] = useState(patient);
  const [patientMeds, setPatientMeds] = useState(meds || []);
  const [reports, setReports]         = useState(null);
  const [loading, setLoading]         = useState(true);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Sync props
  useEffect(() => {
    setPatientInfo(patient);
    setPatientMeds(meds || []);
  }, [patient, meds]);

  // Fetch patient data + refresh every 30s
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await getPatientDataAPI();
        if (res.patient)     setPatientInfo(res.patient);
        if (res.medications) setPatientMeds(res.medications);
      } catch (err) {
        console.error("Failed to refresh patient data:", err);
      } finally {
        setLoading(false);
      }
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch reports when reports tab opened
  useEffect(() => {
    if (activeTab !== "reports") return;
    const fetchReports = async () => {
      try {
        const res = await getPatientReportsAPI();
        setReports(res.reports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };
    fetchReports();
  }, [activeTab]);

  const parseMedTime = (timeStr) => {
    if (!timeStr) return new Date();
    const [timePart, period] = timeStr.trim().split(" ");
    let [hours, minutes]     = timePart.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const isMissed          = (med) => !med.taken && (now - parseMedTime(med.time)) / 60000 >= 30;
  const wasMissedButTaken = (med) =>  med.taken && (now - parseMedTime(med.time)) / 60000 >= 30;

  const takenMeds    = patientMeds.filter(m => m.taken);
  const missedMeds   = patientMeds.filter(isMissed);
  const adherencePct = patientMeds.length > 0
    ? Math.round((takenMeds.length / patientMeds.length) * 100)
    : 0;

  const cgInitials = caregiver?.name
    ? caregiver.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "CG";

  const ptInitials = patientInfo
    ? ((patientInfo.firstName?.[0] || "") + (patientInfo.lastName?.[0] || "")).toUpperCase()
    : "PT";

  const textPrimary   = "#0f4a47";
  const textSecondary = "#6b9e9a";
  const cardBg        = "#fff";
  const bgColor       = "#f0fafa";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #e6f7f5", borderTopColor: "#0f9b8e", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "15px", fontWeight: "600", color: textSecondary }}>Loading patient data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: bgColor }}>

      {/* ── Sidebar ── */}
      <aside className="mt-sidebar">
        <div className="mt-sidebar-logo" style={{ padding: "28px 20px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "20px" }}>➕</span>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: "800" }}>MediTrack</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "10px 14px", marginTop: "12px" }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>
              Caregiver Portal
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#fff" }}>
                {cgInitials}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ color: "#fff", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {caregiver?.name || "Caregiver"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>
                  {caregiver?.role || "Caregiver"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-sidebar-nav" style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
          {TABS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                data-active={active ? "true" : "false"}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "18px 16px", marginBottom: "4px", borderRadius: "14px", border: "none", cursor: "pointer", background: active ? "rgba(255,255,255,0.18)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: active ? "700" : "500", fontSize: "15px", fontFamily: "inherit", textAlign: "left" }}
              >
                <span style={{ fontSize: "15px" }}>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-sidebar-progress" style={{ padding: "16px", flexShrink: 0 }}>
          <button
            onClick={onSignOut}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontFamily: "inherit", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="mt-main" style={{ overflowY: "auto", boxSizing: "border-box" }}>

        {/* Header */}
        <div className="mt-header">
          <div>
            <h1 className="mt-header-title" style={{ color: textPrimary, margin: 0 }}>
              {activeTab === "overview" ? `Welcome, ${caregiver?.name?.split(" ")[0] || "Caregiver"}! 👋`
                : activeTab === "meds"  ? "Medications"
                : "Reports"}
            </h1>
            <p className="mt-header-sub" style={{ color: textSecondary, marginTop: "6px" }}>
              Caregiver view for {patientInfo?.firstName || "—"} {patientInfo?.lastName || ""}
            </p>
          </div>

          {/* Patient badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: cardBg, borderRadius: "16px", padding: "12px 18px", border: "1.5px solid #e6f7f5", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#0f9b8e,#0a7a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "15px" }}>
              {ptInitials}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "800", color: textPrimary }}>
                {patientInfo?.firstName || "—"} {patientInfo?.lastName || ""}
              </div>
              <div style={{ fontSize: "11px", color: textSecondary }}>
                {patientInfo?.gender || "—"} · Age {patientInfo?.age || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Patient profile card */}
            <div style={{ background: cardBg, borderRadius: "22px", padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg,#0f9b8e,#0a7a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "20px", flexShrink: 0 }}>
                {ptInitials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "18px", fontWeight: "800", color: textPrimary }}>
                  {patientInfo?.firstName || "—"} {patientInfo?.lastName || ""}
                </div>
                <div style={{ fontSize: "13px", color: textSecondary, marginTop: "4px" }}>
                  {patientInfo?.email || "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { icon: patientInfo?.gender === "Male" ? "👨" : patientInfo?.gender === "Female" ? "👩" : "🧑", label: patientInfo?.gender || "—" },
                  { icon: "🎂", label: `Age ${patientInfo?.age || "—"}` },
                  { icon: "✅", label: "Active Patient" },
                ].map(p => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "99px", background: "#e6f7f5", border: "1.5px solid #b2e0dc", fontSize: "13px", fontWeight: "600", color: textPrimary }}>
                    {p.icon} {p.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div className="mt-stats-grid">
              {[
                { icon: "💊", label: "Total Meds",  value: patientMeds.length, sub: "Active today",           color: "#0f9b8e", bg: "#e6f7f5" },
                { icon: "✅", label: "Taken",        value: takenMeds.length,   sub: `${adherencePct}% adherence`, color: "#16a34a", bg: "#dcfce7" },
                { icon: "⚠️", label: "Overdue",      value: missedMeds.length,  sub: missedMeds.length === 0 ? "All on track" : "Need attention", color: missedMeds.length === 0 ? "#16a34a" : "#f97316", bg: missedMeds.length === 0 ? "#dcfce7" : "#fff4ed" },
              ].map(s => (
                <div key={s.label} style={{ background: cardBg, borderRadius: "18px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{s.icon}</div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: textSecondary }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: "900", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: textSecondary, marginTop: "5px" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Missed alerts */}
            {missedMeds.length > 0 ? (
              <div style={{ background: "#fff4ed", borderRadius: "20px", padding: "22px", border: "1.5px solid #fed7aa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#9a3412" }}>Missed Dose Alerts</div>
                    <div style={{ fontSize: "12px", color: "#c2410c" }}>
                      {missedMeds.length} medication{missedMeds.length !== 1 ? "s" : ""} overdue by 30+ min
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {missedMeds.map(m => {
                    const minsLate = Math.floor((now - parseMedTime(m.time)) / 60000);
                    return (
                      <div key={m._id || m.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", borderRadius: "14px", padding: "14px 16px", border: "1.5px solid #fed7aa" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: (m.color || "#0f9b8e") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>💊</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#9a3412" }}>
                            {m.name} <span style={{ fontWeight: "500" }}>{m.dosage}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#c2410c", marginTop: "2px" }}>
                            Due {m.time} · {minsLate} min late
                          </div>
                        </div>
                        <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#fee2e2", color: "#991b1b", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                          Overdue
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ background: "#f0fdf4", borderRadius: "18px", padding: "18px 22px", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✅</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534" }}>All doses on track</div>
                  <div style={{ fontSize: "12px", color: "#15803d", marginTop: "2px" }}>
                    {patientInfo?.firstName || "Patient"} has taken all medications due so far today.
                  </div>
                </div>
              </div>
            )}

            {/* Late but taken */}
            {patientMeds.filter(wasMissedButTaken).length > 0 && (
              <div style={{ background: cardBg, borderRadius: "18px", padding: "18px 22px", border: "1.5px solid #e6f7f5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: textSecondary, marginBottom: "12px" }}>✅ Taken late today</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {patientMeds.filter(wasMissedButTaken).map(m => {
                    const minsLate = Math.floor((now - parseMedTime(m.time)) / 60000);
                    return (
                      <div key={m._id || m.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "12px", background: "#f8fffe", border: "1px solid #e6f7f5" }}>
                        <span style={{ fontSize: "16px" }}>✅</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: textPrimary }}>{m.name} {m.dosage}</span>
                          <span style={{ fontSize: "11px", color: textSecondary, marginLeft: "8px" }}>
                            scheduled {m.time} · {minsLate} min late
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {patientMeds.length === 0 && (
              <div style={{ background: cardBg, borderRadius: "18px", padding: "40px", textAlign: "center", border: "1.5px solid #e8f5f3" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>💊</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: textPrimary, marginBottom: "6px" }}>No medications scheduled</div>
                <div style={{ fontSize: "13px", color: textSecondary }}>
                  {patientInfo?.firstName || "The patient"} has no medications added yet.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MEDICATIONS ══ */}
        {activeTab === "meds" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            <div style={{ background: "#e6f7f5", borderRadius: "14px", padding: "14px 18px", border: "1.5px solid #b2e0dc", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>ℹ️</span>
              <span style={{ fontSize: "13px", color: "#0a7a6e", fontWeight: "600" }}>
                Read-only view. Contact {patientInfo?.firstName || "the patient"} to make changes.
              </span>
            </div>

            {patientMeds.length === 0 ? (
              <div style={{ background: cardBg, borderRadius: "18px", padding: "48px", textAlign: "center", border: "1.5px solid #e8f5f3" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>💊</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: textPrimary }}>No medications found</div>
                <div style={{ fontSize: "13px", color: textSecondary, marginTop: "6px" }}>
                  {patientInfo?.firstName || "The patient"} has not added any medications yet.
                </div>
              </div>
            ) : (
              patientMeds.map(m => {
                const missed      = isMissed(m);
                const lateTaken   = wasMissedButTaken(m);
                const daysLeft    = getDaysRemaining(m);
                const daysStyle   = daysLeft !== null ? getDaysStyle(daysLeft) : null;

                const statusBg    = m.taken ? "#dcfce7" : missed ? "#fee2e2" : "#f0fafa";
                const statusColor = m.taken ? "#166534" : missed ? "#991b1b" : "#6b9e9a";
                const statusLabel = m.taken
                  ? (lateTaken ? "✓ Taken (late)" : "✓ Taken")
                  : missed ? "✗ Overdue" : "⏳ Pending";

                return (
                  <div
                    key={m._id || m.id}
                    style={{ background: cardBg, borderRadius: "18px", padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: `1.5px solid ${daysLeft !== null && daysLeft <= 3 ? "#fecaca" : missed ? "#fecaca" : "#e8f5f3"}` }}
                  >
                    {/* Top row — icon, name, status badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: (m.color || "#0f9b8e") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `2px solid ${(m.color || "#0f9b8e")}33` }}>
                        💊
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: textPrimary }}>{m.name}</div>
                        <div style={{ fontSize: "12px", color: textSecondary, marginTop: "3px" }}>
                          {m.dosage} · 🕐 {m.time}
                          {m.notes && <span style={{ marginLeft: "8px" }}>· {m.notes}</span>}
                        </div>
                      </div>
                      <span style={{ padding: "5px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: "700", background: statusBg, color: statusColor, flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Bottom row — duration badge */}
                    {(m.ongoing || daysLeft !== null) && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0fafa" }}>
                        {m.ongoing ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "10px", background: "#e6f7f5", border: "1px solid #b2e4df" }}>
                            <span style={{ fontSize: "12px" }}>∞</span>
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
                              of {m.durationDays}d course
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ REPORTS ══ */}
        {activeTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!reports ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", border: "4px solid #e6f7f5", borderTopColor: "#0f9b8e", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "14px", color: textSecondary }}>Loading reports...</div>
                </div>
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="mt-stats-grid">
                  {[
                    {
                      label: "Today's Adherence",
                      value: `${reports.todayRate}%`,
                      sub:   `${reports.todayTaken} of ${reports.todayTotal} doses taken`,
                      icon:  "📈",
                      color: reports.todayRate >= 80 ? "#16a34a" : reports.todayRate >= 60 ? "#d97706" : "#ef4444",
                      bg:    reports.todayRate >= 80 ? "#dcfce7" : reports.todayRate >= 60 ? "#fef3c7" : "#fee2e2",
                    },
                    {
                      label: "7-Day Adherence",
                      value: `${reports.weekRate}%`,
                      sub:   `${reports.weekTaken} taken · ${reports.weekMissed} missed`,
                      icon:  "📅",
                      color: reports.weekRate >= 80 ? "#16a34a" : reports.weekRate >= 60 ? "#d97706" : "#ef4444",
                      bg:    reports.weekRate >= 80 ? "#dcfce7" : reports.weekRate >= 60 ? "#fef3c7" : "#fee2e2",
                    },
                    {
                      label: "Side Effects",
                      value: reports.sideEffectCount,
                      sub:   "Total reported",
                      icon:  "⚡",
                      color: reports.sideEffectCount === 0 ? "#16a34a" : "#f97316",
                      bg:    reports.sideEffectCount === 0 ? "#dcfce7" : "#fff4ed",
                    },
                  ].map(s => (
                    <div key={s.label} className="mt-report-stat-card" style={{ background: cardBg, borderRadius: "18px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{s.icon}</div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: textSecondary }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: "32px", fontWeight: "900", color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: "12px", color: textSecondary, marginTop: "6px" }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly bar chart */}
                <div style={{ background: cardBg, borderRadius: "20px", padding: "26px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: textPrimary, marginBottom: "4px" }}>📊 7-Day Adherence Chart</div>
                  <div style={{ fontSize: "12px", color: textSecondary, marginBottom: "20px" }}>
                    Daily breakdown for {patientInfo?.firstName || "patient"}
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", height: "110px", marginBottom: "14px" }}>
                    {(reports.last7Days || []).map(d => {
                      const maxTotal = Math.max(...(reports.last7Days || []).map(x => x.taken + x.missed)) || 1;
                      const takenH   = (d.taken  / maxTotal) * 100;
                      const missedH  = (d.missed / maxTotal) * 100;
                      return (
                        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "90px", gap: "2px" }}>
                            {d.missed > 0 && <div style={{ width: "100%", height: `${missedH}%`, background: "#fca5a5", borderRadius: "4px 4px 0 0" }} />}
                            {d.taken  > 0 && <div style={{ width: "100%", height: `${takenH}%`,  background: "#0f9b8e", borderRadius: d.missed > 0 ? "0" : "4px 4px 0 0" }} />}
                            {d.taken === 0 && d.missed === 0 && <div style={{ width: "100%", height: "8%", background: "#e6f7f5", borderRadius: "4px" }} />}
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: textSecondary }}>{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #f0fafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "#0f9b8e" }} />
                      <span style={{ fontSize: "12px", color: textSecondary }}>Taken ({reports.weekTaken})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "#fca5a5" }} />
                      <span style={{ fontSize: "12px", color: textSecondary }}>Missed ({reports.weekMissed})</span>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "800", color: reports.weekRate >= 80 ? "#16a34a" : reports.weekRate >= 60 ? "#d97706" : "#ef4444" }}>
                      {reports.weekRate}% weekly rate
                    </div>
                  </div>
                </div>

                {/* Side effects */}
                <div style={{ background: cardBg, borderRadius: "20px", padding: "26px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: textPrimary, marginBottom: "4px" }}>⚡ Side Effects Log</div>
                  <div style={{ fontSize: "12px", color: textSecondary, marginBottom: "20px" }}>
                    All reported side effects for {patientInfo?.firstName || "patient"}
                  </div>
                  {reports.sideEffects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: textSecondary }}>
                      <div style={{ fontSize: "32px", marginBottom: "10px" }}>✅</div>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>No side effects reported</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {reports.sideEffects.map(se => {
                        const sc = severityColor(se.severity);
                        return (
                          <div key={se._id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "14px", background: "#f8fffe", border: "1px solid #e6f7f5" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>⚡</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "14px", fontWeight: "800", color: textPrimary }}>{se.effect}</div>
                              <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>
                                {se.med} · {new Date(se.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            </div>
                            <span style={{ padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "700", background: sc.bg, color: sc.color }}>
                              {se.severity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
