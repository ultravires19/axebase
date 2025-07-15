import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { LoginForm } from "../auth/components";
import { useAuth } from "../auth/stores/AuthProvider";
import { LoginCredentials } from "../auth/types";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formError, setFormError] = createSignal<string | null>(null);

  const handleLogin = async (data: LoginCredentials) => {
    try {
      setFormError(null);
      await login(data);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Or{" "}
            <A
              href="/register"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </A>
          </p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error || formError()}
        />

        <div class="mt-6 text-center">
          <A
            href="/"
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to home
          </A>
        </div>
      </div>
    </div>
  );
}
