import type { Page } from "../../types";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
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
