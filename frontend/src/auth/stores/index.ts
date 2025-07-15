/**
 * Barrel export file for auth stores
 * This file will re-export all state management for authentication
 */

// Import core types
import { AuthState, AuthUser, User } from "../types";

// Export auth provider
export { AuthProvider, useAuth } from "./AuthProvider";

/**
 * Auth store interface defines the state management contract
 * Implementations will vary based on the state management library used
 */
export interface AuthStore {
  /**
   * The current authentication state
   */
  state: AuthState;

  /**
   * Set the current authenticated user
   */
  setUser(user: AuthUser | null): void;

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void;

  /**
   * Set auth error
   */
  setError(error: Error | null): void;

  /**
   * Reset auth state
   */
  reset(): void;

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback: (state: AuthState) => void): () => void;
}

/**
 * User store interface for managing user profile state
 */
export interface UserStore {
  /**
   * The current user profile
   */
  user: User | null;

  /**
   * Is the profile data loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during profile operations
   */
  error: Error | null;

  /**
   * Set the current user profile
   */
  setUser(user: User | null): void;

  /**
   * Update user profile data
   */
  updateUser(data: Partial<User>): void;

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void;

  /**
   * Set profile error
   */
  setError(error: Error | null): void;

  /**
   * Reset user profile state
   */
  reset(): void;
}

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
