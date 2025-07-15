import { Component, createSignal, createEffect, Show } from "solid-js";
import { validateEmail, validatePassword } from "../utils/formValidation";
import { LoginCredentials } from "../types";

interface LoginFormProps {
  onSubmit?: (data: LoginCredentials) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const LoginForm: Component<LoginFormProps> = (props) => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [emailError, setEmailError] = createSignal("");
  const [passwordError, setPasswordError] = createSignal("");
  const [formTouched, setFormTouched] = createSignal(false);

  // Validate email when it changes
  createEffect(() => {
    if (formTouched()) {
      const result = validateEmail(email());
      setEmailError(result.valid ? "" : result.message || "");
    }
  });

  // Validate password when it changes
  createEffect(() => {
    if (formTouched()) {
      const result = validatePassword(password());
      setPasswordError(result.valid ? "" : result.message || "");
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setFormTouched(true);

    // Validate all fields before submitting
    const emailResult = validateEmail(email());
    const passwordResult = validatePassword(password());

    setEmailError(emailResult.valid ? "" : emailResult.message || "");
    setPasswordError(passwordResult.valid ? "" : passwordResult.message || "");

    // Only submit if both validations pass
    if (emailResult.valid && passwordResult.valid && props.onSubmit) {
      const credentials: LoginCredentials = {
        email: email(),
        password: password(),
      };
      props.onSubmit(credentials);
    }
  };

  return (
    <div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>

      {props.error && (
        <div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          {props.error}
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            onBlur={() => setFormTouched(true)}
            class={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              emailError() ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="john.doe@example.com"
            disabled={props.isLoading}
          />
          <Show when={emailError()}>
            <p class="mt-1 text-xs text-red-500">{emailError()}</p>
          </Show>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            onBlur={() => setFormTouched(true)}
            class={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              passwordError() ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
            disabled={props.isLoading}
          />
          <Show when={passwordError()}>
            <p class="mt-1 text-xs text-red-500">{passwordError()}</p>
          </Show>
        </div>

        <div>
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={props.isLoading}
          >
            {props.isLoading ? "Signing in..." : "Sign In"}
            {(!!emailError() || !!passwordError()) && formTouched() && (
              <span class="ml-2 text-xs text-red-500">⚠️</span>
            )}
          </button>
        </div>

        <div class="mt-4 text-center">
          <a
            href="/forgot-password"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
