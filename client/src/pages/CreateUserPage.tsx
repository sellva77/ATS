import { useState } from "react";
import { toast } from "../components/common/Toast";
import { createUser } from "../api/user";
import { PageHeader } from "../components/layout/PageHeader";

import { useAuth } from "../context/AuthContext";

export function CreateUserPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === "ADMIN";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(isAdmin ? "TEAM_MANAGER" : "TEAM_MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValid =
    email.trim() &&
    password.trim() &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      await createUser({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
      });
      toast.success(`User "${email.trim()}" created successfully!`);
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setRole(isAdmin ? "TEAM_MANAGER" : "TEAM_MEMBER");
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        icon="➕"
        title={isAdmin ? "Create New User" : "Add Team Member"}
        description={isAdmin ? "Set up a new user account with login credentials." : "Create a new member account for your team."}
      />
      <div className="page-body">
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <div
            className="glass-card"
            style={{
              padding: "2rem",
              borderRadius: "16px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Name */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-name"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    id="create-user-name"
                    type="text"
                    className="search-textarea"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      height: "44px",
                      padding: "0 16px",
                    }}
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-email"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Email Address <span style={{ color: "var(--accent-primary)" }}>*</span>
                  </label>
                  <input
                    id="create-user-email"
                    type="email"
                    className="search-textarea"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      height: "44px",
                      padding: "0 16px",
                    }}
                  />
                </div>

                {/* Password */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-password"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Password <span style={{ color: "var(--accent-primary)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="create-user-password"
                      type={showPassword ? "text" : "password"}
                      className="search-textarea"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      minLength={6}
                      style={{
                        width: "100%",
                        minHeight: "44px",
                        height: "44px",
                        padding: "0 44px 0 16px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        padding: "4px 6px",
                        opacity: 0.6,
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {password && password.length < 6 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#ef4444",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Password must be at least 6 characters
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-confirm-password"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Confirm Password <span style={{ color: "var(--accent-primary)" }}>*</span>
                  </label>
                  <input
                    id="create-user-confirm-password"
                    type="password"
                    className="search-textarea"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      height: "44px",
                      padding: "0 16px",
                    }}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#ef4444",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Passwords do not match
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-phone"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Phone <span style={{ opacity: 0.5 }}>(optional)</span>
                  </label>
                  <input
                    id="create-user-phone"
                    type="tel"
                    className="search-textarea"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      height: "44px",
                      padding: "0 16px",
                    }}
                  />
                </div>

                {/* Role */}
                <div className="create-user-field">
                  <label
                    htmlFor="create-user-role"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Role
                  </label>
                  <select
                    id="create-user-role"
                    className="search-textarea"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting || !isAdmin}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      height: "44px",
                      padding: "0 16px",
                    }}
                  >
                    {isAdmin && <option value="TEAM_MANAGER">Team Manager</option>}
                    <option value="TEAM_MEMBER">Team Member</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  id="create-user-submit"
                  type="submit"
                  className="search-btn"
                  disabled={isSubmitting || !isValid}
                  style={{
                    width: "100%",
                    height: "48px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginTop: "8px",
                    opacity: isValid ? 1 : 0.5,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-inline" />
                      {isAdmin ? "Creating User..." : "Adding Member..."}
                    </>
                  ) : (
                    isAdmin ? "Create User" : "Add Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
