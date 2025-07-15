import { createSignal, Match, Switch, onMount, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { useAuth } from "../stores/AuthProvider";

type ResetPasswordState =
  | "validating"
  | "valid"
  | "invalid"
  | "submitting"
  | "success"
  | "error";

/**
 * ResetPassword component for setting a new password using a reset token
 */
export function ResetPassword() {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [state, setState] = createSignal<ResetPasswordState>("validating");
  const [errorMessage, setErrorMessage] = createSignal("");

  // Get the token from the URL
  const token = params.token;

  // Validate the token on component mount
  onMount(async () => {
    if (!token) {
      setState("invalid");
      setErrorMessage("Missing reset token");
      return;
    }

    try {
      const isValid = await auth.validateResetToken(token);
      setState(isValid ? "valid" : "invalid");
      if (!isValid) {
        setErrorMessage("The password reset link is invalid or has expired");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setState("invalid");
      setErrorMessage("Failed to validate reset token");
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (password() !== confirmPassword()) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password().length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    try {
      setState("submitting");
      await auth.resetPassword(token!, password());
      setState("success");
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to reset password",
      );
      setState("error");
    }
  };

  return (
    <div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Reset Password
      </h2>

      <Switch>
        <Match when={state() === "validating"}>
          <div class="flex justify-center items-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">
              Validating your reset link...
            </span>
          </div>
        </Match>

        <Match when={state() === "invalid"}>
          <div class="p-4 bg-red-100 border border-red-300 text-red-800 rounded-md mb-4">
            <p class="mb-2">{errorMessage()}</p>
            <p>Please request a new password reset link.</p>
          </div>
          <div class="mt-6 text-center">
            <a
              href="/forgot-password"
              class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Request New Link
            </a>
          </div>
        </Match>

        <Match when={state() === "success"}>
          <div class="p-4 bg-green-100 border border-green-300 text-green-800 rounded-md mb-4">
            <p class="mb-2">Your password has been successfully reset.</p>
            <p>You can now log in with your new password.</p>
          </div>
          <div class="mt-6 text-center">
            <button
              class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </Match>

        <Match
          when={
            state() === "valid" ||
            state() === "error" ||
            state() === "submitting"
          }
        >
          <p class="mb-6 text-gray-600 text-center">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                disabled={state() === "submitting"}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                disabled={state() === "submitting"}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Show when={state() === "error"}>
              <div class="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
                {errorMessage()}
              </div>
            </Show>

            <div>
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={state() === "submitting"}
              >
                {state() === "submitting" ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </Match>
      </Switch>
    </div>
  );
}
