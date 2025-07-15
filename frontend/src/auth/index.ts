/**
 * Main barrel export file for the auth module
 * Consolidates all exports from sub-modules for easier importing
 */
import { AuthApi } from "./services/AuthAPI";

// Re-export types
export type * from "./types";

// Re-export service interfaces
export type * from "./services";
export { AuthApi } from "./services/AuthAPI";

// Re-export components
export * from "./components";

// Explicitly export password reset components
export { ForgotPassword } from "./components/ForgotPassword";
export { ResetPassword } from "./components/ResetPassword";

// Re-export stores
export { AuthProvider, useAuth } from "./stores/AuthProvider";

// Re-export utilities
export * from "./utils";

/**
 * Auth module configuration options
 */
export interface AuthOptions {
  apiUrl?: string;
  tokenStorage?: "localStorage" | "sessionStorage" | "cookie";
  cookieOptions?: {
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  };
  redirects?: {
    afterLogin?: string;
    afterLogout?: string;
    afterRegistration?: string;
    unauthorized?: string;
  };
}

// Create singleton instance of AuthApi
export const authService = new AuthApi();

/**
 * Initialize the auth module with configuration options
 * This should be called early in your application bootstrap
 */
export const initAuth = (options?: AuthOptions): void => {
  // Set the API URL for the AuthApi if provided
  if (options?.apiUrl) {
    console.log(`Auth API URL set to: ${options.apiUrl}`);
    // In a full implementation, we would set this on the AuthApi class
  }

  console.log("Auth module initialized with options:", options);
};
