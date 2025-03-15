import { createQueryKeys } from '@lukemorales/query-key-factory';
import { LoginRequestV2, RegisterRequestV2 } from '@repo/shared-types';
import { api } from '@/lib/api';

// Define response types
interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthResponse | null;
}

// Auth API functions
const authApi = {
  login: async (data: LoginRequestV2): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequestV2): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  resendVerificationEmail: async (): Promise<void> => {
    await api.post('/auth/resend-verification');
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post(`/auth/verify-email/${token}`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post(`/auth/reset-password/${token}`, { password });
  },
};

// Query key factory
export const authKeys = createQueryKeys('auth', {
  currentUser: null,
  emailVerification: (token: string) => [{ token }],
  resetPassword: (token: string) => [{ token }],
} as const);

export { authApi, type AuthResponse, type AuthState }; 