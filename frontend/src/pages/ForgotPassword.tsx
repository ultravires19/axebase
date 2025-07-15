import { ForgotPassword } from "../auth/components/ForgotPassword";

export default function ForgotPasswordPage() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <ForgotPassword />
      </div>
    </div>
  );
}
