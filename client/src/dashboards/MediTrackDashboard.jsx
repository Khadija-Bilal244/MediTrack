import { useState, useEffect, useRef } from "react";
import Sidebar              from "../components/layout/Sidebar";
import NotificationDropdown from "../components/notifications/NotificationDropdown";
import Home        from "../pages/dashboard/Home";
import Medications from "../pages/dashboard/Medications";
import SideEffects from "../pages/dashboard/SideEffects";
import Reports     from "../pages/dashboard/Reports";
import HeartRisk   from "../pages/dashboard/HeartRisk";   // ← NEW
import Caregivers  from "../pages/dashboard/Caregivers";
import { markTakenAPI, getMedicationsAPI, autoMarkMissedAPI } from "../api/medicationAPI";

export default function MediTrackDashboard({ user, setUser, meds, setMeds, onSignOut }) {
  const [activeNav, setActiveNav]         = useState("Home");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotif] = useState(false);
  const lastDateRef = useRef(new Date().toDateString());

  const handleUserUpdate = (fields) => setUser(prev => ({ ...prev, ...fields }));

  const initials     = user ? (user.firstName[0] + (user.lastName?.[0] || "")).toUpperCase() : "JD";
  const takenCount   = meds.filter(m => m.taken).length;
  const adherencePct = meds.length > 0 ? Math.round((takenCount / meds.length) * 100) : 0;
  const unreadCount  = notifications.filter(n => !n.read).length;

  const push = (type, icon, title, message) =>
    setNotifications(prev => [
      { id: Date.now(), type, icon, title, message, time: "Just now", read: false },
      ...prev,
    ]);

  const parseMedTime = (timeStr) => {
    if (!timeStr) return new Date();
    const now = new Date();
    const [timePart, period] = timeStr.trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  };

  const medsRef = useRef(meds);
  useEffect(() => { medsRef.current = meds; }, [meds]);

  // ── On mount — load fresh meds, then immediately mark any already-overdue ones ──
  useEffect(() => {
    const initLoad = async () => {
      try {
        const res = await getMedicationsAPI();
        if (res.data) setMeds(res.data);
      } catch (err) {
        console.error("Init load failed:", err);
      }
      try {
        const missRes = await autoMarkMissedAPI();
        if (missRes.data) setMeds(missRes.data);
      } catch (err) {
        console.error("Init autoMarkMissed failed:", err);
      }
    };
    initLoad();
  }, []); // eslint-disable-line

  // ── Day change detection ──
  useEffect(() => {
    const checkDayChange = async () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastDateRef.current) {
        lastDateRef.current = currentDate;
        try {
          setMeds([]);
          const res = await getMedicationsAPI();
          setMeds(res.data || []);
          push("info", "🌅", "Good Morning!", "Your medications have been reset for today.");
        } catch (err) {
          console.error("Day change reload failed:", err);
        }
      }
    };
    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // ── Due-now reminder + missed notifications (runs every minute) ──
  useEffect(() => {
    const fired = new Set(
      Object.keys(sessionStorage).filter(k => k.startsWith("notif-"))
    );

    const check = async () => {
      const now = new Date();
      let anyNewMissed = false;

      medsRef.current.forEach(med => {
        if (med.taken || med.missed) return;

        const dueAt   = parseMedTime(med.time);
        const diffMin = (now - dueAt) / 60000;

        const remKey = `notif-reminder-${med._id || med.id}-${new Date().toDateString()}`;
        if (diffMin >= 0 && diffMin < 30 && !fired.has(remKey)) {
          fired.add(remKey);
          sessionStorage.setItem(remKey, "true");
          push(
            "reminder", "⏰", "Time to Take Your Medication",
            `${med.name} ${med.dosage} is due${diffMin >= 1 ? ` (scheduled ${med.time})` : ` now (${med.time})`}`
          );
        }

        const missKey = `notif-missed-${med._id || med.id}-${new Date().toDateString()}`;
        if (diffMin >= 30 && !fired.has(missKey)) {
          fired.add(missKey);
          sessionStorage.setItem(missKey, "true");
          push("missed", "💊", "Missed Dose",
            `${med.name} ${med.dosage} was due at ${med.time}`);
          anyNewMissed = true;
        }
      });

      if (anyNewMissed) {
        try {
          const missRes = await autoMarkMissedAPI();
          if (missRes.data) setMeds(missRes.data);
        } catch (e) {
          console.error("autoMarkMissed failed:", e);
        }
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // ── Toggle taken ──
  const toggleTaken = async (id) => {
    const med = meds.find(m => (m._id || m.id) === id);
    if (!med) return;
    const newTaken = !med.taken;
    try {
      await markTakenAPI(id, newTaken);
      setMeds(prev => prev.map(m =>
        (m._id || m.id) === id
          ? { ...m, taken: newTaken, missed: newTaken ? false : m.missed }
          : m
      ));
    } catch (err) {
      console.error("Failed to update medication:", err);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#f0fafa" }}>

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        adherencePct={adherencePct}
        takenCount={takenCount}
        medsLength={meds.length}
        onSignOut={onSignOut}
      />

      <main className="mt-main" style={{ overflowY: "auto", boxSizing: "border-box" }}>

        <div className="mt-header">
          <div>
            <h1 className="mt-header-title" style={{ color: "#0f4a47", margin: 0 }}>
              {activeNav === "Home"
                ? `Good ${greeting}, ${user?.firstName || "there"}! 👋`
                : activeNav}
            </h1>
            <p className="mt-header-sub" style={{ color: "#6b9e9a", marginTop: "6px" }}>{today}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => {
                  setShowNotif(v => !v);
                  if (!showNotifications)
                    setNotifications(p => p.map(n => ({ ...n, read: true })));
                }}
                style={{ width: "56px", height: "56px", borderRadius: "16px", background: showNotifications ? "#0f9b8e" : "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer", transition: "background 0.2s" }}
              >
                🔔
              </div>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "22px", height: "22px", borderRadius: "99px", background: "#f97316", color: "#fff", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {unreadCount}
                </span>
              )}
              {showNotifications && (
                <>
                  <div onClick={() => setShowNotif(false)} style={{ position: "fixed", inset: 0, zIndex: 149 }} />
                  <NotificationDropdown
                    notifications={notifications}
                    onDismiss={id   => setNotifications(p => p.filter(n => n.id !== id))}
                    onClearAll={()  => setNotifications([])}
                    onMarkAllRead={() => setNotifications(p => p.map(n => ({ ...n, read: true })))}
                  />
                </>
              )}
            </div>

            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#0f9b8e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "20px" }}>
              {initials}
            </div>
          </div>
        </div>

        {activeNav === "Home"         && <Home user={user} meds={meds} toggleTaken={toggleTaken} onUserUpdate={handleUserUpdate} />}
        {activeNav === "Medications"  && <Medications meds={meds} setMeds={setMeds} />}
        {activeNav === "Side Effects" && <SideEffects meds={meds} />}
        {activeNav === "Reports"      && <Reports />}
        {activeNav === "Heart Risk"   && <HeartRisk />}    {/* ← NEW */}
        {activeNav === "Caregivers"   && <Caregivers />}

      </main>
    </div>
  );
}
