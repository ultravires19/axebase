/**
 * Barrel export file for auth components
 * This file re-exports all authentication UI components
 */

// Temporary export to ensure the module is recognized correctly
export const COMPONENTS_READY = true;

// Form components
export { default as LoginForm } from "./LoginForm";
export { default as RegisterForm } from "./RegisterForm";
export { ForgotPassword } from "./ForgotPassword";
export { ResetPassword } from "./ResetPassword";
// export { EmailVerificationForm } from './EmailVerificationForm';

// Auth flow components
// export { AuthFlow } from './AuthFlow';
// export { OAuthButtons } from './OAuthButtons';

// Layout components
// export { AuthLayout } from './AuthLayout';
// export { AuthCard } from './AuthCard';

// Protection components
// export { ProtectedRoute } from './ProtectedRoute';
// export { AuthGuard } from './AuthGuard';

// Status components
// export { AuthStatus } from './AuthStatus';
// export { UserAvatar } from './UserAvatar';
// export { UserMenu } from './UserMenu';
