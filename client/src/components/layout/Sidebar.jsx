import { NAV_ITEMS } from "../../constants/navItems";

export default function Sidebar({ activeNav, setActiveNav, adherencePct, takenCount, medsLength, onSignOut }) {
  return (
    <aside className="mt-sidebar">

      {/* Logo */}
      <div className="mt-sidebar-logo" style={{ padding: "32px 24px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>➕</span>
          <span style={{ color: "#fff", fontSize: "14px", fontWeight: "800" }}>MediTrack</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginTop: "6px", marginLeft: "42px" }}>
          Your health companion
        </p>
      </div>

      {/* Nav items */}
      <nav className="mt-sidebar-nav" style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              data-active={active ? "true" : "false"}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "18px 16px", marginBottom: "4px", borderRadius: "14px", border: "none", cursor: "pointer", background: active ? "rgba(255,255,255,0.18)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: active ? "700" : "500", fontSize: "15px", fontFamily: "inherit", textAlign: "left" }}
            >
              <span style={{ fontSize: "15px" }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Progress + Sign Out */}
      <div className="mt-sidebar-progress" style={{ padding: "16px", flexShrink: 0 }}>

        {/* Today's progress bar */}
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "18px", padding: "22px", marginBottom: "12px" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: "600", marginBottom: "6px" }}>
            Today's Progress
          </p>
          <div style={{ color: "#fff", fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
            {adherencePct}%
          </div>
          <div style={{ marginTop: "12px", height: "12px", borderRadius: "99px", background: "rgba(255,255,255,0.2)" }}>
            <div style={{ height: "12px", borderRadius: "99px", width: `${adherencePct}%`, background: "#fff", transition: "width 0.4s" }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", marginTop: "10px" }}>
            {takenCount} of {medsLength} doses taken
          </p>
        </div>

        {/* Sign out button */}
        <button
          onClick={onSignOut}
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontFamily: "inherit", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          🚪 Sign Out
        </button>
      </div>

    </aside>
  );
}
