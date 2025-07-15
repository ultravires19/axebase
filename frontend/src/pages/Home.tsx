import { A } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AxeBase
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          A modern full-stack starter kit with SolidJS and Rust
        </p>

        <div class="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-4">Features</h2>
          <ul class="text-left space-y-2 mb-6">
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>SolidJS frontend with Tailwind CSS</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Rust/Axum backend with PostgreSQL</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>JWT authentication with bcrypt password hashing</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Protected routes and role-based access control</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Reusable authentication patterns</span>
            </li>
          </ul>
        </div>

        <div class="mt-8">
          {user ? (
            <div class="space-y-4">
              <p class="text-lg text-gray-700">
                You are logged in as <strong>{user.email}</strong>
              </p>
              <div class="flex justify-center space-x-4">
                <A
                  href="/dashboard"
                  class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </A>
                {user.isAdmin && (
                  <A
                    href="/admin"
                    class="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Admin Panel
                  </A>
                )}
              </div>
            </div>
          ) : (
            <div class="flex justify-center space-x-4">
              <A
                href="/login"
                class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </A>
              <A
                href="/register"
                class="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Create Account
              </A>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
