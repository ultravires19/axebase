import { createSignal, Match, Switch, Show } from "solid-js";
import { useAuth } from "../stores/AuthProvider";

type ForgotPasswordState = "idle" | "submitting" | "success" | "error";

/**
 * ForgotPassword component for requesting a password reset
 */
export function ForgotPassword() {
  const auth = useAuth();
  const [email, setEmail] = createSignal("");
  const [state, setState] = createSignal<ForgotPasswordState>("idle");
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!email()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      setState("submitting");
      await auth.requestPasswordReset(email());
      setState("success");
    } catch (error) {
      console.error("Password reset request error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred",
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
        <Match when={state() === "success"}>
          <div class="p-4 bg-green-100 border border-green-300 text-green-800 rounded-md mb-4">
            <p class="mb-2">
              If an account exists with the email <strong>{email()}</strong>,
              you will receive password reset instructions shortly.
            </p>
            <p>
              Please check your email inbox and follow the instructions to reset
              your password.
            </p>
          </div>
          <div class="mt-6 text-center">
            <a
              href="/login"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to Login
            </a>
          </div>
        </Match>

        <Match
          when={
            state() === "idle" ||
            state() === "error" ||
            state() === "submitting"
          }
        >
          <p class="mb-6 text-gray-600 text-center">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                disabled={state() === "submitting"}
                placeholder="Enter your email"
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
                {state() === "submitting" ? "Sending..." : "Reset Password"}
              </button>
            </div>

            <div class="mt-4 text-center">
              <a
                href="/login"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Login
              </a>
            </div>
          </form>
        </Match>
      </Switch>
    </div>
  );
}
