/**
 * Service interfaces for authentication and user management
 * These define the contract that concrete implementations must follow
 */

import type {
  AuthResult,
  AuthUser,
  EmailVerificationData,
  LoginCredentials,
  PasswordResetConfirmation,
  PasswordResetRequest,
  RefreshTokenRequest,
  RegistrationData,
  User,
} from "../types";

/**
 * AuthService interface defines all authentication-related operations
 * Implementations can connect to different auth providers (Firebase, Supabase, custom, etc.)
 */
export interface AuthService {
  /**
   * Register a new user with email and password
   */
  register(data: RegistrationData): Promise<AuthResult>;

  /**
   * Authenticate a user with email and password
   */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /**
   * Log out the current user
   */
  logout(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Send a password reset email
   */
  requestPasswordReset(request: PasswordResetRequest): Promise<void>;

  /**
   * Reset password with token from email
   */
  resetPassword(confirmation: PasswordResetConfirmation): Promise<void>;

  /**
   * Send email verification link to user's email
   */
  sendEmailVerification(userId: string): Promise<void>;

  /**
   * Verify email with token from verification email
   */
  verifyEmail(data: EmailVerificationData): Promise<void>;

  /**
   * Check if user session is valid
   */
  isSessionValid(): Promise<boolean>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;

  /**
   * Refresh the access token using a refresh token
   */
  refreshAccessToken(): Promise<AuthResult>;
}

/**
 * UserService interface defines operations for managing user profiles
 * This is separate from AuthService as it deals with application-specific user data
 */
export interface UserService {
  /**
   * Get user profile by ID
   */
  getUserById(id: string): Promise<User | null>;

  /**
   * Get user profile by email
   */
  getUserByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user profile
   */
  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;

  /**
   * Update an existing user profile
   */
  updateUser(
    id: string,
    data: Partial<Omit<User, "id" | "email" | "createdAt" | "updatedAt">>,
  ): Promise<User>;

  /**
   * Delete a user profile
   */
  deleteUser(id: string): Promise<void>;
}

/**
 * Session storage interface for persisting auth sessions
 */
export interface SessionStorage {
  /**
   * Save session data
   */
  saveSession(session: { token: string; expiresAt?: Date }): Promise<void>;

  /**
   * Get current session data
   */
  getSession(): Promise<{ token: string; expiresAt?: Date } | null>;

  /**
   * Clear session data
   */
  clearSession(): Promise<void>;
}
