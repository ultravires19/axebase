/**
 * Barrel export file for auth utilities
 * Contains validation, token handling, and other helper functions
 */

// Import core types
import { RegistrationData, LoginCredentials, AuthUser } from "../types";

// Export form validation utilities
export * from "./formValidation";

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * Requires minimum 8 characters, at least one letter and one number
 */
export const isValidPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Form validation utilities
 */
export const validateRegistration = (
  data: RegistrationData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (!isValidPassword(data.password)) {
    errors.password =
      "Password must be at least 8 characters with at least one letter and one number";
  }

  return errors;
};

export const validateLogin = (
  credentials: LoginCredentials,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!credentials.email) {
    errors.email = "Email is required";
  }

  if (!credentials.password) {
    errors.password = "Password is required";
  }

  return errors;
};

/**
 * Route protection utilities
 */
export interface RouteGuardOptions {
  requireAuth?: boolean;
  requireVerified?: boolean;
  redirectTo?: string;
}

export const createRouteGuard = (options: RouteGuardOptions) => {
  const {
    requireAuth = true,
    requireVerified = false,
    redirectTo = "/login",
  } = options;

  return (user: AuthUser | null) => {
    // Not authenticated but authentication required
    if (requireAuth && !user) {
      return { authorized: false, redirectTo };
    }

    // Email verification required but not verified
    if (requireVerified && user && !user.emailVerified) {
      return { authorized: false, redirectTo: "/verify-email" };
    }

    // Already authenticated but on auth pages
    if (!requireAuth && user) {
      return { authorized: false, redirectTo: "/dashboard" };
    }

    return { authorized: true };
  };
};

/**
 * Token utilities
 */
export const parseJwt = (token: string): Record<string, any> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return {};
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decodedToken = parseJwt(token);
  if (!decodedToken.exp) return true;

  const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};

/**
 * Storage utilities
 */
export const createStorageUtil = (
  storageType: "localStorage" | "sessionStorage" = "localStorage",
) => {
  const storage =
    storageType === "localStorage" ? localStorage : sessionStorage;

  return {
    setItem: (key: string, value: any): void => {
      try {
        storage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        );
      } catch (error) {
        console.error("Error storing data:", error);
      }
    },

    getItem: <T>(key: string, defaultValue: T | null = null): T | null => {
      try {
        const item = storage.getItem(key);
        if (!item) return defaultValue;

        // For JWT tokens, return as-is (string)
        if (key === "auth_token") return item as unknown as T;

        // For other values, parse as JSON
        return JSON.parse(item);
      } catch (error) {
        console.error("Error retrieving data:", error);
        return defaultValue;
      }
    },

    removeItem: (key: string): void => {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.error("Error removing data:", error);
      }
    },

    clear: (): void => {
      try {
        storage.clear();
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    },
  };
};
