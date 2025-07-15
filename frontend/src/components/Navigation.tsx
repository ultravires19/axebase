import { useLocation, useNavigate, A } from "@solidjs/router";
import { Show, createSignal, createEffect, Component } from "solid-js";
import { useAuth } from "../auth/stores/AuthProvider";

// Centralize route constants
const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  LOGIN: "/login",
  REGISTER: "/register",
};

// Helper function for link styling
const getLinkClasses = (isActive: boolean, isMobile: boolean): string => {
  if (isMobile) {
    return `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
      isActive
        ? "border-blue-500 text-blue-700 bg-blue-50"
        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
    }`;
  }

  return `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
    isActive
      ? "border-blue-500 text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  }`;
};

// Email verification status component
const EmailVerificationStatus: Component<{
  isVerified: boolean;
  isMobile?: boolean;
}> = (props) => {
  const { isVerified, isMobile = false } = props;
  console.log("EmailVerificationStatus", isVerified);

  return (
    <Show
      when={isVerified}
      fallback={
        <span
          class={`text-xs text-yellow-600 flex items-center ${isMobile ? "" : ""}`}
        >
          <svg
            class="h-3 w-3 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Unverified
        </span>
      }
    >
      <span
        class={`text-xs text-green-600 flex items-center ${isMobile ? "" : ""}`}
      >
        <svg
          class="h-3 w-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          ></path>
        </svg>
        Verified
      </span>
    </Show>
  );
};

// Navigation Links Component
const NavLinks: Component<{ isMobile: boolean }> = (props) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isMobile } = props;
  console.log("user in navlink component:", user);

  return (
    <>
      <A
        href={ROUTES.HOME}
        class={getLinkClasses(location.pathname === ROUTES.HOME, isMobile)}
      >
        Home
      </A>

      <Show when={user}>
        <A
          href={ROUTES.DASHBOARD}
          class={getLinkClasses(
            location.pathname === ROUTES.DASHBOARD,
            isMobile,
          )}
        >
          Dashboard
        </A>
      </Show>

      <Show when={user?.isAdmin}>
        <A
          href={ROUTES.ADMIN}
          class={getLinkClasses(location.pathname === ROUTES.ADMIN, isMobile)}
        >
          Admin
        </A>
      </Show>
    </>
  );
};

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isLoggingOut, setIsLoggingOut] = createSignal(false);

  // Close mobile menu when route changes
  createEffect(() => {
    // Access location.pathname to create dependency
    location.pathname;
    setIsMenuOpen(false);
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <A href={ROUTES.HOME} class="text-xl font-bold text-blue-600">
                AxeBase
              </A>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLinks isMobile={false} />
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <Show
              when={user}
              fallback={
                <div class="flex space-x-4">
                  <A
                    href={ROUTES.LOGIN}
                    class={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === ROUTES.LOGIN
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Sign in
                  </A>
                  <A
                    href={ROUTES.REGISTER}
                    class="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign up
                  </A>
                </div>
              }
            >
              <div class="flex items-center space-x-2">
                <div class="flex flex-col items-end">
                  <span class="text-sm text-gray-700">{user?.email}</span>
                  <EmailVerificationStatus
                    isVerified={user?.emailVerified === true}
                  />
                </div>
                <div class="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut()}
                  aria-label="Sign out of your account"
                  class={`ml-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700
                    ${
                      isLoggingOut()
                        ? "bg-gray-100 cursor-wait opacity-75"
                        : "bg-white hover:bg-gray-50"
                    }`}
                >
                  {isLoggingOut() ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </Show>
          </div>

          {/* Mobile menu button */}
          <div class="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen())}
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded={isMenuOpen() ? "true" : "false"}
              aria-label="Toggle main menu"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class={`${isMenuOpen() ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class={`${isMenuOpen() ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div class={`${isMenuOpen() ? "block" : "hidden"} sm:hidden`}>
        <div class="pt-2 pb-3 space-y-1">
          <NavLinks isMobile={true} />
        </div>

        <div class="pt-4 pb-3 border-t border-gray-200">
          <Show
            when={user}
            fallback={
              <div class="space-y-1 px-4">
                <A
                  href={ROUTES.LOGIN}
                  class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign in
                </A>
                <A
                  href={ROUTES.REGISTER}
                  class="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </A>
              </div>
            }
          >
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">
                  {user?.email}
                </div>
                <EmailVerificationStatus
                  isVerified={user?.emailVerified === true}
                  isMobile={true}
                />
              </div>
            </div>
            <div class="mt-3 space-y-1 px-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut()}
                aria-label="Sign out of your account"
                class={`block w-full text-left px-4 py-2 text-base font-medium
                  ${
                    isLoggingOut()
                      ? "text-gray-400 bg-gray-50 cursor-wait"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {isLoggingOut() ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
}
