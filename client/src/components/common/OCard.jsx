import { T } from "../../constants/theme";

export default function OCard({ children, style: extra }) {
  return (
    <div style={{ background: T.white, borderRadius: "28px", padding: "44px 40px", boxShadow: "0 24px 64px rgba(15,74,71,0.12)", width: "100%", maxWidth: "440px", boxSizing: "border-box", ...extra }}>
      {children}
    </div>
  );
}