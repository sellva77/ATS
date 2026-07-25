import type { ReactNode } from "react";
import type { Role } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  /** Roles allowed to access this route. If omitted, any authenticated user may access it. */
  roles?: Role[];
  children: ReactNode;
}

/**
 * ProtectedRoute — wraps a page component and enforces role-based access.
 *
 * Usage:
 *   <ProtectedRoute roles={["RECRUITER", "ADMIN"]}>
 *     <UploadPage />
 *   </ProtectedRoute>
 *
 * - If the user is not authenticated: renders nothing (App.tsx shows login).
 * - If the user's role is not in `roles`: renders an Access Denied screen.
 * - Otherwise: renders children.
 */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not authenticated — App.tsx handles redirect to login
  if (!user) return null;

  // Role check
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>
          You need the{" "}
          <strong>{roles.join(" or ")}</strong> role to access this page.
        </p>
        <p className="access-denied-sub">
          You are signed in as <strong>{user.email}</strong> ({user.role}).
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
