/**
 * Core authentication and user interfaces for the modular auth system
 */

/**
 * AuthUser represents the essential authentication information
 * This is typically the data maintained by the auth provider
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

/**
 * User represents our application's user profile data
 * This is typically stored in our own database and linked to the AuthUser
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
  // Add any additional profile fields your application needs
}

/**
 * Authentication credentials for login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration information for new users
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Authentication result returned after login/register operations
 */
export interface AuthResult {
  user: AuthUser;
  token: string;
  refresh_token?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  token: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: {
    type: string;
    message: string;
    status: number;
  };
}

/**
 * Auth error types for error handling
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED",
  RATE_LIMITED = "RATE_LIMITED",
  FORBIDDEN = "FORBIDDEN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Auth error with type information for better error handling
 */
export class AuthError extends Error {
  type: AuthErrorType;

  constructor(type: AuthErrorType, message: string) {
    super(message);
    this.type = type;
    this.name = "AuthError";
  }
}

/**
 * Auth state representing the current authentication status
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  lastTokenRefresh?: Date;
}

// Ensure the module is properly recognized in the build system
export const TYPES_READY = true;
