import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

export default function ResendVerification() {
  const { resendVerificationEmail } = useAuth();

  const [email, setEmail] = createSignal("");
  const [emailError, setEmailError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [status, setStatus] = createSignal<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = createSignal("");

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Validate input
    const emailValidationError = validateEmail(email());
    setEmailError(emailValidationError);

    if (emailValidationError) {
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      await resendVerificationEmail(email());
      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to resend verification email. Please try again later.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            Resend Verification Email
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Enter your email address below and we'll send you a new verification
            link.
          </p>
        </div>

        {status() === "success" ? (
          <div class="mt-8 text-center">
            <div class="inline-block h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900">
              Verification Email Sent
            </h3>
            <p class="mt-2 text-sm text-gray-600">
              We've sent a verification link to <strong>{email()}</strong>.
              Please check your email and follow the instructions to verify your
              account.
            </p>
            <div class="mt-6">
              <A
                href="/login"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Return to Login
              </A>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} class="mt-8 space-y-6">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                disabled={isSubmitting()}
              />
              {emailError() && (
                <p class="mt-1 text-xs text-red-500">{emailError()}</p>
              )}
            </div>

            {status() === "error" && (
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">
                      {errorMessage()}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting()}
              >
                {isSubmitting() ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>

            <div class="text-center">
              <A
                href="/login"
                class="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Return to Login
              </A>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
