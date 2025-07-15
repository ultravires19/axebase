import { createStore } from "solid-js/store";
import {
  createContext,
  useContext,
  JSX,
  createEffect,
  onCleanup,
  createSignal,
} from "solid-js";
import {
  AuthUser,
  EmailVerificationData,
  RegistrationData,
  LoginCredentials,
  RefreshTokenRequest,
  AuthErrorType,
  AuthError,
} from "../types";
import { AuthApi } from "../services/AuthAPI";

// Define the shape of our auth state
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
}

// Create AuthApi instance
const authApi = new AuthApi();

// Define the shape of our auth context
interface AuthContextValue {
  // State
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;

  // Methods
  register: (data: RegistrationData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextValue>();

// Props for the AuthProvider component
interface AuthProviderProps {
  children: JSX.Element;
}

export const AuthProvider = (props: AuthProviderProps) => {
  // Create auth store
  const [state, setState] = createStore<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  // Create a signal for keeping track of refresh attempts
  const [refreshAttempts, setRefreshAttempts] = createSignal(0);
  const MAX_REFRESH_ATTEMPTS = 3;

  // Setup auth state listener on mount
  createEffect(() => {
    setState({ isLoading: true });

    // Subscribe to auth state changes
    const unsubscribe = authApi.onAuthStateChanged((user) => {
      setState({ user, isLoading: false });
      if (user) {
        console.log("User session active:", user.email);
      }
    });

    // Set up automatic token refresh
    const checkTokenInterval = setInterval(
      async () => {
        try {
          // Check if token needs refresh (handled internally by getCurrentUser)
          await authApi.getCurrentUser();
          // Reset refresh attempts on success
          setRefreshAttempts(0);
        } catch (error) {
          console.error("Error refreshing token:", error);
          // Increment refresh attempts
          setRefreshAttempts(refreshAttempts() + 1);

          // If we've tried too many times, force logout
          if (refreshAttempts() >= MAX_REFRESH_ATTEMPTS) {
            console.warn("Maximum refresh attempts reached, logging out");
            setRefreshAttempts(0);
            await authApi.logout();
            setState({
              user: null,
              isLoading: false,
              error: new AuthError(
                AuthErrorType.TOKEN_EXPIRED,
                "Your session has expired. Please log in again.",
              ),
            });
          }
        }
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes

    // Clean up subscription and interval when component unmounts
    onCleanup(() => {
      unsubscribe();
      clearInterval(checkTokenInterval);
    });
  });

  // Register a new user
  const register = async (data: RegistrationData): Promise<void> => {
    try {
      // Start loading
      setState({ isLoading: true, error: null });

      console.log("Registering user:", data.email);

      // Call the backend API to register the user
      await authApi.register(data);

      // AuthApi will update localStorage and trigger the auth state listener
      // which will update our state automatically

      console.log("Registration request successful");
    } catch (error) {
      console.error("Registration error:", error);

      // Parse error message to get type and message
      let errorType = AuthErrorType.UNKNOWN_ERROR;
      let errorMessage = "Failed to register";

      if (error instanceof Error) {
        const parts = error.message.split(": ");
        if (parts.length > 1) {
          const errorTypeStr = parts[0].toUpperCase();
          // Map the error type string to AuthErrorType
          if (errorTypeStr === "VALIDATION_ERROR") {
            errorType = AuthErrorType.WEAK_PASSWORD;
          } else if (errorTypeStr === "CONFLICT") {
            errorType = AuthErrorType.EMAIL_ALREADY_IN_USE;
          } else if (errorTypeStr === "AUTHENTICATION_ERROR") {
            errorType = AuthErrorType.INVALID_CREDENTIALS;
          } else if (errorTypeStr === "TOKEN_ERROR") {
            errorType = AuthErrorType.INVALID_TOKEN;
          }
          errorMessage = parts[1];
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        error: new AuthError(errorType, errorMessage),
        isLoading: false,
      });
    }
  };

  // Login an existing user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // Start loading
      setState({ isLoading: true, error: null });

      console.log("Attempting login for:", credentials.email);

      // Call the backend API to log in the user
      await authApi.login(credentials);

      // AuthApi will update localStorage and trigger the auth state listener
      // which will update our state automatically

      console.log("Login request successful");
    } catch (error) {
      console.error("Login error:", error);

      // Parse error message to get type and message
      let errorType = AuthErrorType.UNKNOWN_ERROR;
      let errorMessage = "Failed to login";

      if (error instanceof Error) {
        const parts = error.message.split(": ");
        if (parts.length > 1) {
          const errorTypeStr = parts[0].toUpperCase();
          // Map the error type string to AuthErrorType
          if (errorTypeStr === "AUTHENTICATION_ERROR") {
            errorType = AuthErrorType.INVALID_CREDENTIALS;
          } else if (errorTypeStr === "NOT_FOUND") {
            errorType = AuthErrorType.USER_NOT_FOUND;
          } else if (errorTypeStr === "TOKEN_ERROR") {
            errorType = AuthErrorType.INVALID_TOKEN;
          }
          errorMessage = parts[1];
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        error: new AuthError(errorType, errorMessage),
        isLoading: false,
      });
    }
  };

  // Logout the current user
  const logout = async (): Promise<void> => {
    try {
      // Start loading
      setState({ isLoading: true, error: null });

      console.log("Logging out user:", state.user?.email);

      // Call the backend API to log out
      await authApi.logout();

      // AuthApi will clear localStorage and trigger the auth state listener
      // which will update our state automatically

      console.log("Logout request successful");
    } catch (error) {
      console.error("Logout error:", error);
      setState({
        error: new AuthError(
          AuthErrorType.UNKNOWN_ERROR,
          error instanceof Error ? error.message : "Failed to logout",
        ),
        isLoading: false,
      });
    }
  };

  // Verify email with token
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      // Start loading
      setState({ isLoading: true, error: null });

      console.log("Verifying email with token");

      // Call the API to verify the email
      await authApi.verifyEmail({ token });

      // No need to update state manually as the auth state listener will handle it
      setState({ isLoading: false });

      console.log("Email verification successful");
    } catch (error) {
      console.error("Email verification error:", error);

      // Parse error message to get type and message
      let errorType = AuthErrorType.UNKNOWN_ERROR;
      let errorMessage = "Failed to verify email";

      if (error instanceof Error) {
        const parts = error.message.split(": ");
        if (parts.length > 1) {
          const errorTypeStr = parts[0].toUpperCase();
          // Map the error type string to AuthErrorType
          if (errorTypeStr === "TOKEN_ERROR") {
            errorType = AuthErrorType.INVALID_TOKEN;
          } else if (errorTypeStr === "TOKEN_EXPIRED") {
            errorType = AuthErrorType.TOKEN_EXPIRED;
          }
          errorMessage = parts[1];
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        error: new AuthError(errorType, errorMessage),
        isLoading: false,
      });
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      // Start loading
      setState({ isLoading: true, error: null });

      console.log("Resending verification email to:", email);

      // Get current user ID if available, or use email as fallback
      const userId = state.user?.id || email;

      // Call the API to resend the verification email
      await authApi.sendEmailVerification(userId);

      setState({ isLoading: false });
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error resending verification email:", error);

      // Parse error message to get type and message
      let errorType = AuthErrorType.UNKNOWN_ERROR;
      let errorMessage = "Failed to send verification email";

      if (error instanceof Error) {
        const parts = error.message.split(": ");
        if (parts.length > 1) {
          const errorTypeStr = parts[0].toUpperCase();
          // Map the error type string to AuthErrorType
          if (errorTypeStr === "NOT_FOUND") {
            errorType = AuthErrorType.USER_NOT_FOUND;
          } else if (errorTypeStr === "VALIDATION_ERROR") {
            errorType = AuthErrorType.EMAIL_ALREADY_IN_USE;
          }
          errorMessage = parts[1];
        } else {
          errorMessage = error.message;
        }
      }

      setState({
        error: new AuthError(errorType, errorMessage),
        isLoading: false,
      });
      throw error;
    }
  };

  // Create context value
  const authContextValue: AuthContextValue = {
    // State properties
    get user() {
      return state.user;
    },
    get isLoading() {
      return state.isLoading;
    },
    get error() {
      return state.error;
    },

    // Methods
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    refreshToken: async () => {
      try {
        setState({ isLoading: true, error: null });
        await authApi.refreshAccessToken();
        setState({ isLoading: false });
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Token refresh error:", error);

        // Parse error message to get type and message
        let errorType = AuthErrorType.UNKNOWN_ERROR;
        let errorMessage = "Failed to refresh token";

        if (error instanceof Error) {
          const parts = error.message.split(": ");
          if (parts.length > 1) {
            const errorTypeStr = parts[0].toUpperCase();
            // Map the error type string to AuthErrorType
            if (errorTypeStr === "TOKEN_ERROR") {
              errorType = AuthErrorType.INVALID_TOKEN;
            } else if (errorTypeStr === "TOKEN_EXPIRED") {
              errorType = AuthErrorType.TOKEN_EXPIRED;
            }
            errorMessage = parts[1];
          } else {
            errorMessage = error.message;
          }
        }

        setState({
          error: new AuthError(errorType, errorMessage),
          isLoading: false,
        });
        throw error;
      }
    },
    requestPasswordReset: async (email: string) => {
      try {
        setState({ isLoading: true, error: null });
        await authApi.requestPasswordReset({ email });
        setState({ isLoading: false });
        return Promise.resolve();
      } catch (error) {
        console.error("Password reset request error:", error);

        // Parse error message to get type and message
        let errorType = AuthErrorType.UNKNOWN_ERROR;
        let errorMessage = "Failed to request password reset";

        if (error instanceof Error) {
          const parts = error.message.split(": ");
          if (parts.length > 1) {
            const errorTypeStr = parts[0].toUpperCase();
            if (errorTypeStr === "VALIDATION_ERROR") {
              errorType = AuthErrorType.VALIDATION_ERROR;
            } else if (errorTypeStr === "RATE_LIMITED") {
              errorType = AuthErrorType.RATE_LIMITED;
            }
            errorMessage = parts[1];
          } else {
            errorMessage = error.message;
          }
        }

        setState({
          error: new AuthError(errorType, errorMessage),
          isLoading: false,
        });
        throw error;
      }
    },
    validateResetToken: async (token: string) => {
      try {
        setState({ isLoading: true, error: null });
        const isValid = await authApi.validateResetToken(token);
        setState({ isLoading: false });
        return isValid;
      } catch (error) {
        console.error("Token validation error:", error);
        setState({
          error: new AuthError(
            AuthErrorType.INVALID_TOKEN,
            error instanceof Error ? error.message : "Invalid or expired token",
          ),
          isLoading: false,
        });
        return false;
      }
    },
    resetPassword: async (token: string, newPassword: string) => {
      try {
        setState({ isLoading: true, error: null });
        await authApi.resetPassword({ token, newPassword });
        setState({ isLoading: false });
        return Promise.resolve();
      } catch (error) {
        console.error("Password reset error:", error);

        // Parse error message to get type and message
        let errorType = AuthErrorType.UNKNOWN_ERROR;
        let errorMessage = "Failed to reset password";

        if (error instanceof Error) {
          const parts = error.message.split(": ");
          if (parts.length > 1) {
            const errorTypeStr = parts[0].toUpperCase();
            if (errorTypeStr === "TOKEN_ERROR") {
              errorType = AuthErrorType.INVALID_TOKEN;
            } else if (errorTypeStr === "TOKEN_EXPIRED") {
              errorType = AuthErrorType.TOKEN_EXPIRED;
            } else if (errorTypeStr === "VALIDATION_ERROR") {
              errorType = AuthErrorType.WEAK_PASSWORD;
            } else if (errorTypeStr === "NOT_FOUND") {
              errorType = AuthErrorType.INVALID_TOKEN;
              errorMessage = "Invalid or expired token";
            }
            errorMessage = parts[1];
          } else {
            errorMessage = error.message;
          }
        }

        setState({
          error: new AuthError(errorType, errorMessage),
          isLoading: false,
        });
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
