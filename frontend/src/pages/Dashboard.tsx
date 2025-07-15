import { createSignal, createEffect, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
}

export default function Dashboard() {
  const { user, logout, resendVerificationEmail } = useAuth();
  const [isResendingVerification, setIsResendingVerification] =
    createSignal(false);
  const [verificationSent, setVerificationSent] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [activities, setActivities] = createSignal<UserActivity[]>([]);

  // This would normally fetch real data from the backend
  createEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);

      // Simulate API call with timeout
      setTimeout(() => {
        try {
          // Mock data - in a real app, this would come from an API
          const mockActivities: UserActivity[] = [
            {
              id: "1",
              action: "Logged in",
              timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            },
            {
              id: "2",
              action: "Profile updated",
              timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
            },
            {
              id: "3",
              action: "Password changed",
              timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
          ];

          setActivities(mockActivities);
          setLoading(false);
        } catch (err) {
          setError("Failed to load activity data");
          setLoading(false);
          console.error("Error loading activity data:", err);
        }
      }, 1000);
    }
  });

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the router
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleResendVerification = async () => {
    if (!user || isResendingVerification()) return;

    setIsResendingVerification(true);
    try {
      await resendVerificationEmail(user.email);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000); // Hide success message after 5 seconds
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    } finally {
      setIsResendingVerification(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  if (!user) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl text-gray-600 mb-4">
            You need to log in to view this page
          </p>
          <A
            href="/login"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </A>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Email verification banner */}
      <Show when={user && !user.emailVerified}>
        <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3 flex-1 md:flex md:justify-between">
              <p class="text-sm text-yellow-700">
                Please verify your email address to access all features.
              </p>
              <Show
                when={!verificationSent()}
                fallback={
                  <p class="text-sm text-green-600 mt-2 md:mt-0 md:ml-6">
                    Verification email sent!
                  </p>
                }
              >
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification()}
                  class="mt-3 text-sm font-medium text-yellow-700 hover:text-yellow-600 md:mt-0 md:ml-6"
                >
                  {isResendingVerification()
                    ? "Sending..."
                    : "Resend verification email"}
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Welcome back to your account
            </p>
          </div>
          <button
            onClick={handleLogout}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            Sign Out
          </button>
        </div>

        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">User ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.id}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Email Verified</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </span>
                {!user.emailVerified && (
                  <button class="ml-2 text-xs text-blue-600 hover:text-blue-500">
                    Verify now
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h2 class="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h2>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Your recent account activity
          </p>
        </div>
        <div class="border-t border-gray-200">
          <Show
            when={!loading()}
            fallback={
              <div class="px-4 py-5 text-center text-gray-500">
                Loading activity data...
              </div>
            }
          >
            <Show
              when={!error()}
              fallback={
                <div class="px-4 py-5 text-center text-red-500">{error()}</div>
              }
            >
              <ul class="divide-y divide-gray-200">
                <For each={activities()}>
                  {(activity) => (
                    <li class="px-4 py-4 sm:px-6">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {activity.action}
                        </p>
                        <div class="ml-2 flex-shrink-0 flex">
                          <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </div>
      </div>

      <div class="mt-6 text-center">
        <A
          href="/"
          class="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to home
        </A>
      </div>
    </div>
  );
}
