export default function Home({ user, meds, toggleTaken }) {
  const takenCount   = meds.filter(m => m.taken).length;
  const adherencePct = meds.length > 0 ? Math.round((takenCount / meds.length) * 100) : 0;
  const initials     = user ? (user.firstName?.[0] + (user.lastName?.[0] || "")).toUpperCase() : "JD";
  const displayName  = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "John Doe";

  // Always use _id for MongoDB docs, fall back to id
  const getMedId = (med) => med._id || med.id;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Profile card */}
      <div className="mt-profile-card" style={{ background: "#fff", borderRadius: "24px", padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "#0f9b8e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "22px", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>{displayName}</h2>
          <p style={{ fontSize: "14px", color: "#6b9e9a", marginTop: "4px" }}>
            {user?.gender || "—"} · Age {user?.age || "—"}
          </p>
        </div>
        <span className="mt-profile-status" style={{ display: "inline-block", padding: "8px 18px", borderRadius: "99px", background: "#e6f7f5", color: "#0a7a6e", fontSize: "13px", fontWeight: "700" }}>
          ✓ Active Account
        </span>
      </div>

      {/* Medications */}
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="mt-med-header">
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f4a47", margin: 0 }}>💊 Today's Medications</h2>
          <span style={{ background: "#e6f7f5", color: "#0a7a6e", padding: "6px 16px", borderRadius: "99px", fontSize: "13px", fontWeight: "700" }}>
            {takenCount} / {meds.length} taken
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: "8px", borderRadius: "99px", background: "#f0fafa", marginBottom: "24px" }}>
          <div style={{ height: "8px", borderRadius: "99px", background: "#0f9b8e", width: `${adherencePct}%`, transition: "width 0.5s ease" }} />
        </div>

        {meds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9bbcba" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>💊</div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>No medications scheduled today.</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>Go to Medications tab to add some.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {meds.map(med => {
              const medId   = getMedId(med);
              const isMissed = med.missed && !med.taken;
              return (
                <div key={medId} style={{ borderRadius: "18px", overflow: "hidden", border: `2px solid ${med.taken ? "#b2e4df" : isMissed ? "#fecaca" : "#e8e8f0"}`, background: "#fff" }}>
                  <div style={{ height: "5px", background: med.taken ? "#0f9b8e" : isMissed ? "#ef4444" : med.color || "#0f9b8e" }} />
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: med.taken ? "#e6f7f5" : isMissed ? "#fee2e2" : `${med.color || "#0f9b8e"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                        💊
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f4a47" }}>{med.name}</div>
                        <div style={{ fontSize: "13px", color: "#6b9e9a" }}>{med.dosage}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px" }}>
                          <span style={{ fontSize: "12px", background: "#f5f5f8", color: "#666", padding: "3px 10px", borderRadius: "99px", fontWeight: "600" }}>
                            🕐 {med.time}
                          </span>
                          {isMissed && (
                            <span style={{ fontSize: "12px", background: "#fee2e2", color: "#ef4444", padding: "3px 10px", borderRadius: "99px", fontWeight: "700" }}>
                              ⚠ Missed
                            </span>
                          )}
                        </div>
                      </div>
                      {med.taken && (
                        <div style={{ width: "28px", height: "28px", borderRadius: "99px", background: "#0f9b8e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: "14px", fontWeight: "800" }}>✓</span>
                        </div>
                      )}
                    </div>

                    {/* Mark as taken button */}
                    <button
                      onClick={() => toggleTaken(medId)}
                      style={{ width: "100%", padding: "13px", borderRadius: "12px", border: med.taken ? "2px solid #b2e4df" : isMissed ? "2px solid #fecaca" : "none", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: "700", background: med.taken ? "#f0fafa" : isMissed ? "#fee2e2" : "#0f9b8e", color: med.taken ? "#0a7a6e" : isMissed ? "#ef4444" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
                    >
                      {med.taken
                        ? <><span>✓</span> Taken — Tap to Undo</>
                        : isMissed
                          ? <><span>✕</span> Dose Missed — Mark as Taken</>
                          : <><span>○</span> Mark as Taken</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}