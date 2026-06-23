"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

// ── Brand tokens (matched to app/admin/login/page.tsx) ──────────
const BG    = "#080B16";
const CARD  = "#111A2E";
const LINE  = "#1E2A44";
const BLUE  = "#4F8FF7";
const INK   = "#EAF0FB";
const MUTE  = "#7E8DA8";
const CORAL = "#F87171";
const GREEN = "#34D399";

type Mode = "login" | "signup";

export default function AccountPage() {
  // ── Session state ──────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // ── Form state ─────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ── Wire up the live session ───────────────────────────────
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    clearMessages();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Enter both an email and a password.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) {
          setError(error.message);
        } else if (data.session) {
          // Email confirmation disabled → session is live immediately.
          setPassword("");
        } else {
          // Confirmation is on (unexpected for now) — tell the user.
          setNotice("Account created. Check your email to confirm before logging in.");
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          setPassword("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    clearMessages();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  // ── Shared shell ───────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
    <div style={{
      minHeight: "70vh", background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "60px 0",
    }}>
      <div style={{
        background: CARD, border: `1px solid ${LINE}`,
        borderRadius: 18, padding: "40px 44px", width: "100%", maxWidth: 400,
      }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>
            VERSA<span style={{ color: BLUE }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 6 }}>Your account</div>
        </div>
        {children}
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────
  if (!ready) {
    return shell(
      <div style={{ textAlign: "center", fontSize: 13, color: MUTE }}>Loading…</div>
    );
  }

  // ── Signed IN ──────────────────────────────────────────────
  if (session) {
    return shell(
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{
          background: BG, border: `1px solid ${LINE}`, borderRadius: 10,
          padding: "14px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: MUTE, letterSpacing: 0.4 }}>
            SIGNED IN AS
          </div>
          <div style={{ fontSize: 14, color: INK, marginTop: 6, wordBreak: "break-all" }}>
            {session.user.email}
          </div>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button
          onClick={handleLogout}
          disabled={busy}
          style={{
            background: "transparent", color: INK, border: `1px solid ${LINE}`,
            borderRadius: 9, padding: "12px", fontSize: 14, fontWeight: 700,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Logging out…" : "Log out"}
        </button>
      </div>
    );
  }

  // ── Signed OUT ─────────────────────────────────────────────
  return shell(
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Mode toggle */}
      <div style={{
        display: "flex", background: BG, border: `1px solid ${LINE}`,
        borderRadius: 10, padding: 4, gap: 4,
      }}>
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 700,
              borderRadius: 7, border: "none", cursor: "pointer",
              background: mode === m ? BLUE : "transparent",
              color: mode === m ? "#fff" : MUTE,
            }}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <NoticeBox>{notice}</NoticeBox>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="EMAIL">
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
        <Field label="PASSWORD">
          <input
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          style={{
            background: BLUE, color: "#fff", border: "none",
            borderRadius: 9, padding: "12px", fontSize: 14,
            fontWeight: 700, cursor: busy ? "default" : "pointer",
            marginTop: 4, opacity: busy ? 0.6 : 1,
          }}
        >
          {busy
            ? mode === "signup" ? "Creating account…" : "Signing in…"
            : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// ── Small presentational helpers ─────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: BG, border: `1px solid ${LINE}`,
  borderRadius: 9, padding: "11px 13px", fontSize: 14,
  color: INK, outline: "none", boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        fontSize: 12, fontWeight: 600, color: MUTE, display: "block",
        marginBottom: 7, letterSpacing: 0.4,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#2A1515", border: "1px solid #5A2020",
      borderRadius: 10, padding: "11px 14px",
      fontSize: 13, color: CORAL,
    }}>
      {children}
    </div>
  );
}

function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0F2018", border: "1px solid #1E4030",
      borderRadius: 10, padding: "11px 14px",
      fontSize: 13, color: GREEN,
    }}>
      {children}
    </div>
  );
}
