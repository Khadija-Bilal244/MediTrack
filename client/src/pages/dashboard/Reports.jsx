import { useState, useEffect } from "react";
import { getPatientReportsAPI } from "../../api/medicationAPI";

const severityColor = (s) =>
  s === "Mild"     ? { bg: "#dcfce7", color: "#166534" } :
  s === "Moderate" ? { bg: "#fef3c7", color: "#92400e" } :
                     { bg: "#fee2e2", color: "#991b1b" };

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getPatientReportsAPI();
        setReports(res.reports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const textPrimary   = "#0f4a47";
  const textSecondary = "#6b9e9a";
  const cardBg        = "#fff";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #e6f7f5", borderTopColor: "#0f9b8e", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: "14px", color: textSecondary }}>Loading your reports...</div>
        </div>
      </div>
    );
  }

  if (!reports) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: textSecondary }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
        <div style={{ fontSize: "15px", fontWeight: "700" }}>No report data available yet</div>
        <div style={{ fontSize: "13px", marginTop: "6px" }}>
          Add medications and start tracking to see your stats here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* 4 stat cards */}
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
      <div style={{ background: cardBg, borderRadius: "22px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
        <h2 style={{ fontSize: "17px", fontWeight: "800", color: textPrimary, margin: "0 0 4px" }}>
          📅 7-Day Adherence
        </h2>
        <p style={{ fontSize: "13px", color: textSecondary, margin: "0 0 24px" }}>
          Your daily taken vs missed breakdown
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", height: "120px", marginBottom: "16px" }}>
          {(reports.last7Days || []).map(d => {
            const maxTotal = Math.max(...(reports.last7Days || []).map(x => x.taken + x.missed)) || 1;
            const takenH   = (d.taken  / maxTotal) * 100;
            const missedH  = (d.missed / maxTotal) * 100;
            return (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100px", gap: "2px" }}>
                  {d.missed > 0 && (
                    <div style={{ width: "100%", height: `${missedH}%`, background: "#fca5a5", borderRadius: "4px 4px 0 0" }} />
                  )}
                  {d.taken > 0 && (
                    <div style={{ width: "100%", height: `${takenH}%`, background: "#0f9b8e", borderRadius: d.missed > 0 ? "0" : "4px 4px 0 0" }} />
                  )}
                  {d.taken === 0 && d.missed === 0 && (
                    <div style={{ width: "100%", height: "6%", background: "#e6f7f5", borderRadius: "4px" }} />
                  )}
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: textSecondary }}>{d.day}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1.5px solid #f0fafa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#0f9b8e" }} />
            <span style={{ fontSize: "13px", color: textSecondary }}>Taken ({reports.weekTaken})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#fca5a5" }} />
            <span style={{ fontSize: "13px", color: textSecondary }}>Missed ({reports.weekMissed})</span>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "14px", fontWeight: "800", color: reports.weekRate >= 80 ? "#16a34a" : reports.weekRate >= 60 ? "#d97706" : "#ef4444" }}>
            {reports.weekRate}% weekly rate
          </div>
        </div>
      </div>

      {/* Side effects log */}
      <div style={{ background: cardBg, borderRadius: "22px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1.5px solid #e8f5f3" }}>
        <h2 style={{ fontSize: "17px", fontWeight: "800", color: textPrimary, margin: "0 0 4px" }}>
          ⚡ Side Effects Log
        </h2>
        <p style={{ fontSize: "13px", color: textSecondary, margin: "0 0 20px" }}>
          All side effects you have reported
        </p>

        {reports.sideEffects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: textSecondary }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>✅</div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>No side effects reported</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>You're doing great!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reports.sideEffects.map(se => {
              const sc = severityColor(se.severity);
              return (
                <div key={se._id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 18px", borderRadius: "16px", background: "#f8fffe", border: "1.5px solid #e6f7f5" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: textPrimary }}>{se.effect}</div>
                    <div style={{ fontSize: "12px", color: textSecondary, marginTop: "3px" }}>
                      {se.med} · {new Date(se.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <span style={{ padding: "6px 16px", borderRadius: "99px", fontSize: "13px", fontWeight: "700", background: sc.bg, color: sc.color }}>
                    {se.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
