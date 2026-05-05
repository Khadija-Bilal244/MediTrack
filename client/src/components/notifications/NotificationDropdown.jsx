export default function NotificationDropdown({ notifications, onDismiss, onClearAll, onMarkAllRead }) {
  return (
    <div className="mt-notif-dropdown">
      <div style={{ padding: "20px 24px 16px", borderBottom: "1.5px solid #f0fafa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f4a47" }}>Notifications</div>
          <div style={{ fontSize: "12px", color: "#6b9e9a", marginTop: "2px" }}>
            {notifications.length === 0 ? "All caught up!" : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        {notifications.length > 0 && (
          <button onClick={onClearAll} style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
            Clear all
          </button>
        )}
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f4a47", marginBottom: "6px" }}>No notifications</div>
            <div style={{ fontSize: "12px", color: "#6b9e9a" }}>You're all caught up!</div>
          </div>
        ) : (
          notifications.map(n => {
            const typeBg    = { missed: "#fff4ed", reminder: "#f0f9ff", taken: "#f0fdf4", sideeffect: "#fff7ed", caregiver: "#f5f3ff" }[n.type] || "#f8fffe";
            const typeColor = { missed: "#f97316", reminder: "#0ea5e9", taken: "#16a34a", sideeffect: "#ea580c", caregiver: "#7c3aed" }[n.type] || "#0f9b8e";
            return (
              <div key={n.id} style={{ padding: "16px 24px", borderBottom: "1px solid #f0fafa", display: "flex", gap: "14px", alignItems: "flex-start", background: n.read ? "#fff" : "#f8fffe" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: typeBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: `1.5px solid ${typeColor}22` }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f4a47" }}>{n.title}</span>
                    {!n.read && <span style={{ width: "7px", height: "7px", borderRadius: "99px", background: "#0f9b8e", flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b9e9a", lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: "11px", color: "#9bbcba", marginTop: "5px", fontWeight: "600" }}>{n.time}</div>
                </div>
                <button onClick={() => onDismiss(n.id)} style={{ background: "none", border: "none", color: "#9bbcba", fontSize: "16px", cursor: "pointer", padding: "0", flexShrink: 0 }}>✕</button>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{ padding: "12px 24px", borderTop: "1.5px solid #f0fafa", textAlign: "center" }}>
          <button onClick={onMarkAllRead} style={{ background: "none", border: "none", color: "#0f9b8e", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
