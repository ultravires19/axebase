import { createSignal, createEffect } from "solid-js";
import { useParams, useNavigate, A } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

export default function VerifyEmail() {
  const params = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = createSignal<"loading" | "success" | "error">("loading");
  const [error, setError] = createSignal<string | null>(null);
  const [countdown, setCountdown] = createSignal(5);

  // Verify the token when the component mounts
  createEffect(() => {
    const token = params.token;
    if (!token) {
      setStatus("error");
      setError("Missing verification token");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown(prev => {
            const newCount = prev - 1;
            if (newCount <= 0) {
              clearInterval(timer);
              navigate("/dashboard");
            }
            return newCount;
          });
        }, 1000);
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to verify email");
      });
  });

  return (
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        {status() === "loading" && (
          <div>
            <div class="animate-pulse inline-block h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4 flex items-center justify-center">
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
            <h2 class="mt-2 text-3xl font-bold text-gray-900">Verifying Your Email</h2>
            <p class="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status() === "success" && (
          <div>
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
            <h2 class="mt-2 text-3xl font-bold text-gray-900">Email Verified!</h2>
            <p class="mt-2 text-sm text-gray-600">
              Thank you for verifying your email address. Your account is now fully activated.
            </p>
            <p class="mt-4 text-sm text-gray-500">
              Redirecting to dashboard in {countdown()} seconds...
            </p>
            <div class="mt-6">
              <A
                href="/dashboard"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Go to Dashboard Now
              </A>
            </div>
          </div>
        )}

        {status() === "error" && (
          <div>
            <div class="inline-block h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4 flex items-center justify-center">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 class="mt-2 text-3xl font-bold text-gray-900">Verification Failed</h2>
            <p class="mt-2 text-sm text-gray-600">
              {error() || "We couldn't verify your email address. The token may be invalid or expired."}
            </p>
            <div class="mt-6 space-y-4">
              <div>
                <A
                  href="/dashboard"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Go to Dashboard
                </A>
              </div>
              <div>
                <button
                  onClick={() => navigate("/resend-verification")}
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
