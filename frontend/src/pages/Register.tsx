import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { RegisterForm } from "../auth/components";
import { useAuth } from "../auth/stores/AuthProvider";
import { RegistrationData } from "../auth/types";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formError, setFormError] = createSignal<string | null>(null);

  const handleRegister = async (data: RegistrationData) => {
    try {
      setFormError(null);
      await register(data);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred");
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
          <p class="mt-2 text-sm text-gray-600">
            Or{" "}
            <A
              href="/login"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to an existing account
            </A>
          </p>
        </div>

        <RegisterForm
          onSubmit={handleRegister}
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
