import type { Page } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  const isAdmin = user?.role?.name === "ADMIN";

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">A</div>
          <div className="sidebar-logo-text">
            <h1>ATS</h1>
            <span>Applicant Tracking</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {/* ── Dashboard (both roles) ── */}
        <span className="nav-label">Overview</span>
        <button
          id="nav-dashboard"
          className={`nav-item${activePage === "dashboard" ? " active" : ""}`}
          onClick={() => onNavigate("dashboard")}
          aria-current={activePage === "dashboard" ? "page" : undefined}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </button>

        {/* ── Core Pipeline (both roles) ── */}
        <span className="nav-label" style={{ marginTop: "1.5rem" }}>Pipeline</span>

        <button
          id="nav-list"
          className={`nav-item${activePage === "list" ? " active" : ""}`}
          onClick={() => onNavigate("list")}
          aria-current={activePage === "list" ? "page" : undefined}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">{isAdmin ? "All Candidates" : "My Candidates"}</span>
        </button>

        <button
          id="nav-upload"
          className={`nav-item${activePage === "upload" ? " active" : ""}`}
          onClick={() => onNavigate("upload")}
          aria-current={activePage === "upload" ? "page" : undefined}
        >
          <span className="nav-icon">📄</span>
          <span className="nav-text">Upload Resume</span>
        </button>

        <button
          id="nav-search"
          className={`nav-item${activePage === "search" ? " active" : ""}`}
          onClick={() => onNavigate("search")}
          aria-current={activePage === "search" ? "page" : undefined}
        >
          <span className="nav-icon">🔍</span>
          <span className="nav-text">Search</span>
        </button>

        {/* ── Admin-only Management ── */}
        {isAdmin && (
          <>
            <span className="nav-label" style={{ marginTop: "1.5rem" }}>Management</span>

            <button
              id="nav-teams"
              className={`nav-item${activePage === "teams" ? " active" : ""}`}
              onClick={() => onNavigate("teams")}
              aria-current={activePage === "teams" ? "page" : undefined}
            >
              <span className="nav-icon">🛡️</span>
              <span className="nav-text">Teams</span>
            </button>
          </>
        )}

        {(isAdmin || user?.role?.name === "TEAM_MANAGER") && (
          <>
            {!isAdmin && (
               <span className="nav-label" style={{ marginTop: "1.5rem" }}>My Team</span>
            )}
            <button
              id="nav-users"
              className={`nav-item${activePage === "users" ? " active" : ""}`}
              onClick={() => onNavigate("users")}
              aria-current={activePage === "users" ? "page" : undefined}
            >
              <span className="nav-icon">🧑‍💼</span>
              <span className="nav-text">{isAdmin ? "Managers" : "Members"}</span>
            </button>

            <button
              id="nav-create-user"
              className={`nav-item${activePage === "create-user" ? " active" : ""}`}
              onClick={() => onNavigate("create-user")}
              aria-current={activePage === "create-user" ? "page" : undefined}
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">{isAdmin ? "Create User" : "Add Member"}</span>
            </button>
          </>
        )}
      </nav>

      {/* User profile section */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-email" title={user.email}>
                {user.name || user.email}
              </span>
              <span className="role-badge">
                {user.role?.name ? user.role.name.replace("_", " ") : "Unknown Role"}
              </span>
            </div>
          </div>
          <button
            id="btn-logout"
            className="sidebar-logout-btn"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          Powered by <span>AI</span>
          <br />
          Semantic Candidate Matching
        </p>
      </div>
    </aside>
  );
}
