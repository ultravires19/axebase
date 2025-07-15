import { Component, createSignal, createEffect, Show } from "solid-js";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../utils/formValidation";
import { RegistrationData } from "../types";

interface RegisterFormProps {
  onSubmit?: (data: RegistrationData) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const RegisterForm: Component<RegisterFormProps> = (props) => {
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [firstNameError, setFirstNameError] = createSignal("");
  const [lastNameError, setLastNameError] = createSignal("");
  const [emailError, setEmailError] = createSignal("");
  const [passwordError, setPasswordError] = createSignal("");
  const [formTouched, setFormTouched] = createSignal(false);
  const [passwordStrength, setPasswordStrength] = createSignal<
    "weak" | "medium" | "strong" | null
  >(null);

  // Validate fields when they change and form is touched
  createEffect(() => {
    if (formTouched()) {
      const firstNameResult = validateName(firstName(), "First name");
      setFirstNameError(
        firstNameResult.valid ? "" : firstNameResult.message || "",
      );

      const lastNameResult = validateName(lastName(), "Last name");
      setLastNameError(
        lastNameResult.valid ? "" : lastNameResult.message || "",
      );

      const emailResult = validateEmail(email());
      setEmailError(emailResult.valid ? "" : emailResult.message || "");

      const passwordResult = validatePassword(password());
      setPasswordError(
        passwordResult.valid ? "" : passwordResult.message || "",
      );
      if (passwordResult.valid) {
        setPasswordStrength(passwordResult.strength || null);
      }
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setFormTouched(true);

    // Validate all fields before submitting
    const firstNameResult = validateName(firstName(), "First name");
    const lastNameResult = validateName(lastName(), "Last name");
    const emailResult = validateEmail(email());
    const passwordResult = validatePassword(password());

    setFirstNameError(
      firstNameResult.valid ? "" : firstNameResult.message || "",
    );
    setLastNameError(lastNameResult.valid ? "" : lastNameResult.message || "");
    setEmailError(emailResult.valid ? "" : emailResult.message || "");
    setPasswordError(passwordResult.valid ? "" : passwordResult.message || "");

    // Only submit if all validations pass
    if (
      firstNameResult.valid &&
      lastNameResult.valid &&
      emailResult.valid &&
      passwordResult.valid &&
      props.onSubmit
    ) {
      const registrationData: RegistrationData = {
        firstName: firstName(),
        lastName: lastName(),
        email: email(),
        password: password(),
      };
      props.onSubmit(registrationData);
    }
  };

  return (
    <div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Create an Account
      </h2>

      {props.error && (
        <div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          {props.error}
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={firstName()}
              onInput={(e) => setFirstName(e.currentTarget.value)}
              onBlur={() => setFormTouched(true)}
              class={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                firstNameError() ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John"
              disabled={props.isLoading}
            />
            <Show when={firstNameError()}>
              <p class="mt-1 text-xs text-red-500">{firstNameError()}</p>
            </Show>
          </div>

          <div>
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={lastName()}
              onInput={(e) => setLastName(e.currentTarget.value)}
              onBlur={() => setFormTouched(true)}
              class={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                lastNameError() ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Doe"
              disabled={props.isLoading}
            />
            <Show when={lastNameError()}>
              <p class="mt-1 text-xs text-red-500">{lastNameError()}</p>
            </Show>
          </div>
        </div>

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
            minLength={8}
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
          <Show
            when={
              !passwordError() && passwordStrength() && password().length > 0
            }
            fallback={
              <p class="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters with letters and numbers
              </p>
            }
          >
            <div class="mt-1">
              <div class="flex items-center">
                <div class="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class={`h-full ${
                      passwordStrength() === "weak"
                        ? "w-1/3 bg-red-500"
                        : passwordStrength() === "medium"
                          ? "w-2/3 bg-yellow-500"
                          : "w-full bg-green-500"
                    }`}
                  />
                </div>
                <span class="ml-2 text-xs">
                  {passwordStrength() === "weak"
                    ? "Weak"
                    : passwordStrength() === "medium"
                      ? "Medium"
                      : "Strong"}
                </span>
              </div>
            </div>
          </Show>
        </div>

        <div>
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={props.isLoading}
          >
            {props.isLoading ? "Creating account..." : "Register"}
            {(!!firstNameError() ||
              !!lastNameError() ||
              !!emailError() ||
              !!passwordError()) &&
              formTouched() && <span class="ml-2 text-xs">⚠️</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
