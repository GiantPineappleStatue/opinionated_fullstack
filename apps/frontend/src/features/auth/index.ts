// API
export * from './api/auth';

// Hooks
export { useAuth } from './hooks/use-auth-query';

// Components
export { EmailVerificationBanner } from './components/email-verification-banner';

// Types
export type { AuthResponse, AuthState } from './api/auth';
export type { AuthUser } from '@/lib/auth/auth-service'; 