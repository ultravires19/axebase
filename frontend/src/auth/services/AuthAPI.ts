import {
  AuthResult,
  AuthUser,
  EmailVerificationData,
  LoginCredentials,
  PasswordResetConfirmation,
  PasswordResetRequest,
  RefreshTokenRequest,
  RegistrationData,
} from "../types";
import { AuthService } from "./index";
import { parseJwt } from "../utils";

// API base URL - can be moved to environment config later
const API_BASE_URL = "http://localhost:3000";
const TOKEN_STORAGE_KEY = "auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "auth_refresh_token";

export class AuthApi implements AuthService {
  // For storing auth state change listeners
  private static authStateListeners: ((user: AuthUser | null) => void)[] = [];

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<AuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage = errorData.error?.message || "Registration failed";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    const result = await response.json();

    // Store tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    if (result.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, result.refresh_token);
    }

    // Notify listeners of auth state change
    AuthApi.notifyAuthStateChanged(result.user);

    return result;
  }

  /**
   * Login an existing user
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage = errorData.error?.message || "Login failed";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    const result = await response.json();

    // Store tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    if (result.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, result.refresh_token);
    }

    // Notify listeners of auth state change
    AuthApi.notifyAuthStateChanged(result.user);

    return result;
  }

  /**
   * Logout the current user
   * This will clear local tokens and also notify the server to revoke refresh tokens
   */
  async logout(): Promise<void> {
    // Get the current token and refresh token
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    // Remove tokens from local storage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

    // Notify listeners of auth state change immediately
    AuthApi.notifyAuthStateChanged(null);

    // If we have a token, also notify the server to revoke refresh tokens
    if (token && refreshToken) {
      try {
        await fetch(
          `${API_BASE_URL}/auth/logout?refresh_token=${encodeURIComponent(refreshToken)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );
        console.log("Server-side logout successful");
      } catch (error) {
        // Even if server-side logout fails, the client-side logout is still effective
        console.warn(
          "Server-side logout failed, but client-side logout completed",
          error,
        );
      }
    }

    return Promise.resolve();
  }

  /**
   * Get the current authenticated user from token
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) return null;

    try {
      // For a real implementation, we might validate the token with the server
      // But for now, we'll just decode it locally
      const decoded = parseJwt(token);

      if (this.isTokenExpired(token)) {
        // Try to refresh the token
        try {
          await this.refreshAccessToken();
          // Get the new token
          const newToken = localStorage.getItem(TOKEN_STORAGE_KEY);
          if (!newToken) return null;

          // Parse the new token
          const newDecoded = parseJwt(newToken);
          return {
            id: newDecoded.sub,
            email: newDecoded.email,
            emailVerified: newDecoded.email_verified || false,
            isAdmin:
              newDecoded.is_admin || newDecoded.email === "admin@example.com", // For testing - any user with email admin@example.com is an admin
          };
        } catch (error) {
          // If refresh fails, clear tokens and return null
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          console.error("Token refresh failed:", error);
          return null;
        }
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified || false,
        isAdmin: decoded.is_admin || decoded.email === "admin@example.com", // For testing - any user with email admin@example.com is an admin
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      return null;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email: request.email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage =
        errorData.error?.message || "Failed to request password reset";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    return Promise.resolve();
  }

  /**
   * Validate a password reset token
   */
  async validateResetToken(token: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/auth/validate-reset-token/${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    return response.ok;
  }

  /**
   * Reset password with token
   */
  async resetPassword(confirmation: PasswordResetConfirmation): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        token: confirmation.token,
        new_password: confirmation.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage =
        errorData.error?.message || "Failed to reset password";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    return Promise.resolve();
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(_userId: string): Promise<void> {
    // We're using the current user's email instead of looking up by userId
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email: currentUser.email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage =
        errorData.error?.message || "Failed to send verification email";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    return Promise.resolve();
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: EmailVerificationData): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-email/${data.token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorType = errorData.error?.type || "unknown_error";
      const errorMessage =
        errorData.error?.message || "Email verification failed";
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    // Get current user and update with verified status
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        emailVerified: true,
      };

      // Notify listeners of auth state change
      AuthApi.notifyAuthStateChanged(updatedUser);
    }

    return Promise.resolve();
  }

  /**
   * Check if the current session is valid
   */
  async isSessionValid(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    AuthApi.authStateListeners.push(callback);

    // Initialize with current state
    this.getCurrentUser().then((user) => callback(user));

    // Return unsubscribe function
    return () => {
      const index = AuthApi.authStateListeners.indexOf(callback);
      if (index > -1) {
        AuthApi.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private static notifyAuthStateChanged(user: AuthUser | null): void {
    for (const listener of AuthApi.authStateListeners) {
      listener(user);
    }
  }

  /**
   * Check if a token is expired
   */
  private isTokenExpired(token: string): boolean {
    const decoded = parseJwt(token);
    if (!decoded.exp) return true;

    // Token expiration is in seconds, convert to milliseconds
    const expirationTime = decoded.exp * 1000;
    return Date.now() >= expirationTime;
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<AuthResult> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Clear tokens on refresh failure
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

      // Parse the error response
      try {
        const errorData = await response.json();
        const errorType = errorData.error?.type || "unknown_error";
        const errorMessage =
          errorData.error?.message || "Failed to refresh token";
        throw new Error(`${errorType}: ${errorMessage}`);
      } catch (parseError) {
        // If we can't parse the response, throw a generic error
        throw new Error("token_error: Failed to refresh token");
      }
    }

    const result = await response.json();

    // Store the new tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    if (result.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, result.refresh_token);
    }

    // Notify listeners of auth state change
    AuthApi.notifyAuthStateChanged(result.user);

    return result;
  }
}
