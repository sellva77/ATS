import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth as authApi } from "../api/client";

type Mode = "login" | "register";

const QUICK_FILL = [
  { label: "Admin", email: "admin@ats.dev", role: "SUPER_ADMIN", icon: "🛡️" },
  { label: "Recruiter", email: "recruiter@ats.dev", role: "RECRUITER", icon: "💼" },
  { label: "Interviewer", email: "interviewer@ats.dev", role: "INTERVIEWER", icon: "👤" },
];

export function LoginPage() {
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regRole, setRegRole] = useState<string>("INTERVIEWER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const res = await authApi.register(email, password, regRole);
        // After register, log in automatically
        localStorage.setItem("ats_token", res.token);
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (email: string) => {
    setEmail(email);
    setPassword("password");
    setError("");
  };

  return (
    <div className="login-page">
      {/* Aurora background */}
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
      </div>

      {/* Card */}
      <div className={`login-card${shake ? " login-shake" : ""}`}>
        {/* Logo */}
        <div className="login-logo">
          <div className="sidebar-logo-icon" style={{ width: 52, height: 52, fontSize: "1.4rem" }}>A</div>
          <div>
            <h1 className="login-title">ATS</h1>
            <span className="login-subtitle">Applicant Tracking System</span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="login-tabs" role="tablist">
          <button
            id="tab-login"
            role="tab"
            className={`login-tab${mode === "login" ? " active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            role="tab"
            className={`login-tab${mode === "register" ? " active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        {/* Quick-fill shortcuts (login mode only) */}
        {mode === "login" && (
          <div className="login-quickfill">
            <span className="login-quickfill-label">Quick fill</span>
            <div className="login-quickfill-btns">
              {QUICK_FILL.map((q) => (
                <button
                  key={q.role}
                  id={`quickfill-${q.role.toLowerCase()}`}
                  type="button"
                  className="login-quickfill-btn"
                  onClick={() => quickFill(q.email)}
                  title={q.email}
                >
                  <span>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form id="login-form" className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email" className="login-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" && (
            <div className="login-field">
              <label htmlFor="register-role" className="login-label">Role</label>
              <select
                id="register-role"
                className="login-input login-select"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="INTERVIEWER">Interviewer</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="SUPER_ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-btn-spinner" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="login-footer">
          Powered by <span className="login-footer-accent">AI</span> · Semantic Candidate Matching
        </p>
      </div>
    </div>
  );
}
