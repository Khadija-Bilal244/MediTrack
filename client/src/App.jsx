import { useState } from "react";
import SplashScreen       from "./pages/SplashScreen";
import AuthScreen         from "./pages/AuthScreen";
import PersonalInfoScreen from "./pages/PersonalInfoScreen";
import ProfileDisplay     from "./pages/ProfileDisplay";
import MediTrackDashboard from "./dashboards/MediTrackDashboard";
import CaregiverDashboard from "./dashboards/CaregiverDashboard";
import { getMedicationsAPI }  from "./api/medicationAPI";
import { getPatientDataAPI }  from "./api/caregiverAPI";

export default function App() {
  const [screen, setScreen]               = useState("splash");
  const [authData, setAuthData]           = useState(null);
  const [userData, setUserData]           = useState(null);
  const [caregiverData, setCaregiverData] = useState(null);
  const [patientData, setPatientData]     = useState(null);
  const [sharedMeds, setSharedMeds]       = useState([]);

  // Load patient's own medications
  const loadMeds = async () => {
    try {
      const res = await getMedicationsAPI();
      setSharedMeds(res.data || []);
    } catch (err) {
      console.error("Failed to load medications:", err);
      setSharedMeds([]);
    }
  };

  // Load patient data + medications for caregiver view
  const loadPatientDataForCaregiver = async () => {
    try {
      const res = await getPatientDataAPI();
      setPatientData(res.patient);
      setSharedMeds(res.medications || []);
    } catch (err) {
      console.error("Failed to load patient data:", err);
      setPatientData(null);
      setSharedMeds([]);
    }
  };

  const handleAuth = async (a) => {
    setAuthData(a);

    // Signup flow
    if (a.isSignup) {
      setScreen("info");
      return;
    }

    const user = a.userData;
    if (!user) { console.error("No user data from login"); return; }

    // Caregiver login
    if (user.role === "caregiver") {
      setCaregiverData({
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      "caregiver",
        patientId: user.patientId,
      });
      await loadPatientDataForCaregiver();
      setScreen("caregiver");
      return;
    }

    // Patient login
    setUserData({
      id:            user.id,
      firstName:     user.firstName,
      lastName:      user.lastName,
      email:         user.email,
      age:           user.age,
      gender:        user.gender,
      role:          "patient",
      reminderEmail: user.reminderEmail || null,   // ← fixed
    });
    await loadMeds();
    setScreen("app");
  };

  const handlePatientSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserData(null);
    setAuthData(null);
    setSharedMeds([]);
    setScreen("auth");
  };

  const handleCaregiverSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCaregiverData(null);
    setPatientData(null);
    setAuthData(null);
    setSharedMeds([]);
    setScreen("auth");
  };

  return (
    <>
      {screen === "splash" && (
        <SplashScreen onDone={() => setScreen("auth")} />
      )}

      {screen === "auth" && (
        <AuthScreen onAuth={handleAuth} />
      )}

      {screen === "info" && (
        <PersonalInfoScreen
          email={authData?.email || ""}
          password={authData?.password || ""}
          onComplete={async (info) => {
            setUserData({
              id:            info.userData?.id || info.userData?._id,
              firstName:     info.firstName,
              lastName:      info.lastName,
              email:         authData?.email,
              age:           info.age,
              gender:        info.gender,
              role:          "patient",
              reminderEmail: null,   // ← fixed (new users have no reminder email yet)
            });
            await loadMeds();
            setScreen("profile");
          }}
        />
      )}

      {screen === "profile" && userData && (
        <ProfileDisplay
          user={userData}
          onEnterApp={() => setScreen("app")}
        />
      )}

      {screen === "app" && userData && (
        <MediTrackDashboard
          user={userData}
          setUser={setUserData}
          meds={sharedMeds}
          setMeds={setSharedMeds}
          onSignOut={handlePatientSignOut}
        />
      )}

      {screen === "caregiver" && caregiverData && (
        <CaregiverDashboard
          caregiver={caregiverData}
          patient={patientData || { firstName: "Loading...", lastName: "", age: "—", gender: "—", email: "" }}
          meds={sharedMeds}
          onSignOut={handleCaregiverSignOut}
        />
      )}
    </>
  );
}
