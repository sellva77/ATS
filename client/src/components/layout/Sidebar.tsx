import type { Page, Role } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const ROLE_BADGE_CLASS: Record<Role, string> = {
  ADMIN: "role-badge role-badge--admin",
  RECRUITER: "role-badge role-badge--recruiter",
  INTERVIEWER: "role-badge role-badge--interviewer",
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  INTERVIEWER: "Interviewer",
};

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  const canUpload = user?.role === "RECRUITER" || user?.role === "ADMIN";

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
        <span className="nav-label">Core Pipeline</span>

        {/* Upload — RECRUITER and ADMIN only */}
        {canUpload && (
          <button
            id="nav-upload"
            className={`nav-item${activePage === "upload" ? " active" : ""}`}
            onClick={() => onNavigate("upload")}
            aria-current={activePage === "upload" ? "page" : undefined}
          >
            <span className="nav-icon">📄</span>
            <span className="nav-text">Upload Resume</span>
          </button>
        )}

        <button
          id="nav-search"
          className={`nav-item${activePage === "search" ? " active" : ""}`}
          onClick={() => onNavigate("search")}
          aria-current={activePage === "search" ? "page" : undefined}
        >
          <span className="nav-icon">🔍</span>
          <span className="nav-text">Search Candidates</span>
        </button>

        <button
          id="nav-list"
          className={`nav-item${activePage === "list" ? " active" : ""}`}
          onClick={() => onNavigate("list")}
          aria-current={activePage === "list" ? "page" : undefined}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">All Candidates</span>
        </button>
      </nav>

      {/* User profile section */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-email" title={user.email}>
                {user.email}
              </span>
              <span className={ROLE_BADGE_CLASS[user.role]}>
                {ROLE_LABEL[user.role]}
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
