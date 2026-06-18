import { login } from "@/app/admin/_actions";

const BG      = "#080B16";
const CARD    = "#111A2E";
const LINE    = "#1E2A44";
const BLUE    = "#4F8FF7";
const INK     = "#EAF0FB";
const MUTE    = "#7E8DA8";
const CORAL   = "#F87171";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: CARD, border: `1px solid ${LINE}`,
        borderRadius: 18, padding: "40px 44px", width: "100%", maxWidth: 380,
      }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>
            VERSA<span style={{ color: BLUE }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 6 }}>Admin panel</div>
        </div>

        {error && (
          <div style={{
            background: "#2A1515", border: `1px solid #5A2020`,
            borderRadius: 10, padding: "11px 14px", marginBottom: 18,
            fontSize: 13, color: CORAL,
          }}>
            Incorrect password. Try again.
          </div>
        )}

        <form action={login} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: MUTE, display: "block", marginBottom: 7, letterSpacing: 0.4 }}>
              PASSWORD
            </label>
            <input
              name="password"
              type="password"
              autoFocus
              required
              style={{
                width: "100%", background: BG, border: `1px solid ${LINE}`,
                borderRadius: 9, padding: "11px 13px", fontSize: 14,
                color: INK, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: BLUE, color: "#fff", border: "none",
              borderRadius: 9, padding: "12px", fontSize: 14,
              fontWeight: 700, cursor: "pointer", marginTop: 4,
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
