import { createSignal, createEffect, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "../auth/stores/AuthProvider";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [users, setUsers] = createSignal<UserData[]>([]);

  // This would normally fetch real data from the backend
  createEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);

      // Simulate API call with timeout
      setTimeout(() => {
        try {
          // Mock data - in a real app, this would come from an API
          const mockUsers: UserData[] = [
            {
              id: "1",
              email: "admin@example.com",
              firstName: "Admin",
              lastName: "User",
              emailVerified: true,
              createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            },
            {
              id: "2",
              email: "john.doe@example.com",
              firstName: "John",
              lastName: "Doe",
              emailVerified: true,
              createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
            },
            {
              id: "3",
              email: "jane.smith@example.com",
              firstName: "Jane",
              lastName: "Smith",
              emailVerified: false,
              createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
            {
              id: "4",
              email: "alex.johnson@example.com",
              firstName: "Alex",
              lastName: "Johnson",
              emailVerified: true,
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
            {
              id: "5",
              email: "taylor.wilson@example.com",
              firstName: "Taylor",
              lastName: "Wilson",
              emailVerified: false,
              createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            },
          ];

          setUsers(mockUsers);
          setLoading(false);
        } catch (err) {
          setError("Failed to load user data");
          setLoading(false);
          console.error("Error loading user data:", err);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Check if user exists and has admin role
  // For demo purposes, we're just checking if the user exists
  // In a real app, you would check a specific admin property
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
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Manage users and system settings
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <A
              href="/dashboard"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              My Dashboard
            </A>
            <button
              onClick={handleLogout}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 class="text-lg leading-6 font-medium text-gray-900">Users</h2>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Manage registered users
            </p>
          </div>
          <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            Add User
          </button>
        </div>
        <div class="border-t border-gray-200">
          <Show
            when={!loading()}
            fallback={
              <div class="px-4 py-5 text-center text-gray-500">
                Loading user data...
              </div>
            }
          >
            <Show
              when={!error()}
              fallback={
                <div class="px-4 py-5 text-center text-red-500">{error()}</div>
              }
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <For each={users()}>
                      {(user) => (
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span class="text-gray-500 font-medium">
                                  {user.firstName?.[0] || ""}
                                  {user.lastName?.[0] || ""}
                                </span>
                              </div>
                              <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div class="text-sm text-gray-500">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span
                              class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.emailVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.emailVerified ? "Verified" : "Not Verified"}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-blue-600 hover:text-blue-900 mr-4">
                              Edit
                            </button>
                            <button class="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
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
