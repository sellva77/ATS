import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastContainer } from "./components/common/Toast";
import { UploadPage } from "./pages/UploadPage";
import { SearchPage } from "./pages/SearchPage";
import { ListPage } from "./pages/ListPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import type { Page } from "./types";
import "./App.css";

/* ── Inner app — rendered only when auth state is resolved ── */
function AppInner() {
  const { user, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<Page>("upload");

  // Show a full-screen spinner while validating the stored token
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  // Unauthenticated — show login page
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated — show main app
  return (
    <div className="app-layout">
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
      </div>

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content" key={activePage}>
        {activePage === "upload" && (
          <ProtectedRoute roles={["RECRUITER", "ADMIN"]}>
            <UploadPage />
          </ProtectedRoute>
        )}
        {activePage === "search" && (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        )}
        {activePage === "list" && (
          <ProtectedRoute>
            <ListPage />
          </ProtectedRoute>
        )}
      </main>

      <ToastContainer />
    </div>
  );
}

/* ── Root — wraps everything in AuthProvider ─────────────── */
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
