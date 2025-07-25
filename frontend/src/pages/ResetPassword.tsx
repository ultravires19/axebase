import { ResetPassword } from "../auth/components/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <ResetPassword />
      </div>
    </div>
  );
}
