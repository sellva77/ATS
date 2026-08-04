import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  /** Roles allowed to access this route. If omitted, any authenticated user may access it. */
  roles?: string[];
  children: ReactNode;
}

/**
 * ProtectedRoute — wraps a page component and enforces role-based access.
 *
 * Usage:
 *   <ProtectedRoute roles={["ADMIN"]}>
 *     <UsersPage />
 *   </ProtectedRoute>
 *
 * - If the user is not authenticated: renders nothing (App.tsx shows login).
 * - If the user's role is not in the allowed list: renders an Access Denied screen.
 * - Otherwise: renders children.
 */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not authenticated — App.tsx handles redirect to login
  if (!user) return null;

  // Role check
  if (roles && !roles.includes(user.role?.name)) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>
          You need one of the following roles to access this page:{" "}
          <strong>{roles.join(", ")}</strong>
        </p>
        <p className="access-denied-sub">
          You are signed in as <strong>{user.email}</strong> ({user.role?.name || "Unknown Role"}).
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
