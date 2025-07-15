import { JSX } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "admin"; // Can expand with more roles as needed
  redirectTo?: string;
}

/**
 * A component that protects routes based on authentication status and optional role requirements
 *
 * @param props.children - The components to render when access is granted
 * @param props.requiredRole - Optional role requirement (e.g., "admin")
 * @param props.redirectTo - Where to redirect if access is denied (defaults to "/login")
 */
export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user exists (authentication check)
  const isAuthenticated = !!user;

  // Check role if a role is required
  const hasRequiredRole = props.requiredRole
    ? props.requiredRole === "admin" // For now, just hard-code admin role check
    : true; // No role required, so this check passes

  // Determine if access should be granted
  const isAuthorized = isAuthenticated && hasRequiredRole;

  // If not authorized, redirect
  if (!isAuthorized) {
    const redirectPath = props.redirectTo || "/login";
    navigate(redirectPath, { replace: true });
    return null;
  }

  // If authorized, render children
  return <>{props.children}</>;
}
