import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 class="text-9xl font-extrabold text-gray-900">404</h1>
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Page not found</h2>
          <p class="mt-2 text-base text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div class="mt-8 space-y-4">
          <A
            href="/"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Return to home
          </A>
          <A
            href="/dashboard"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Go to dashboard
          </A>
        </div>
      </div>
    </div>
  );
}
