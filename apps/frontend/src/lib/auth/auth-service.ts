import { LoginRequestV2, RegisterRequestV2, AuthResponseV2, ApiResponseV2 } from '@repo/shared-types';
import { ApiClient } from '../api';

// Create a singleton instance of the API client
const apiClient = new ApiClient();

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
}

export async function login(data: LoginRequestV2): Promise<AuthUser> {
  try {
    const response = await apiClient.post<ApiResponseV2<AuthResponseV2>>('/auth/login', data);
    return response.data.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function register(data: RegisterRequestV2): Promise<AuthUser> {
  try {
    const response = await apiClient.post<ApiResponseV2<AuthResponseV2>>('/auth/register', data);
    return response.data.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

export async function refreshToken(): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/refresh');
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export async function getProfile(): Promise<AuthUser | null> {
  try {
    const response = await apiClient.get<ApiResponseV2<AuthUser>>('/auth/profile');
    return response.data;
  } catch (error) {
    // If we get a 401 Unauthorized, it means the user is not authenticated
    if ((error as any).status === 401) {
      console.log('User is not authenticated');
      return null;
    }
    
    // For other errors (like CORS), log them but don't throw
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<AuthUser> {
  try {
    const response = await apiClient.patch<ApiResponseV2<AuthUser>>('/auth/profile', data);
    return response.data;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/change-password', data);
  } catch (error) {
    console.error('Password change failed:', error);
    throw error;
  }
}

export interface DeleteAccountData {
  password: string;
  confirmation: string;
}

export async function deleteAccount(data: DeleteAccountData): Promise<void> {
  try {
    await apiClient.delete<ApiResponseV2<null>>('/auth/account', data);
  } catch (error) {
    console.error('Account deletion failed:', error);
    throw error;
  }
}

export interface RequestPasswordResetData {
  email: string;
}

export async function requestPasswordReset(data: RequestPasswordResetData): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/forgot-password', data);
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export async function resetPassword(data: ResetPasswordData): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/reset-password', data);
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

// Email verification methods
export async function verifyEmail(token: string): Promise<{ verified: boolean }> {
  try {
    const response = await apiClient.get<ApiResponseV2<{ verified: boolean }>>(`/auth/verify-email?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
}

export async function resendVerificationEmail(): Promise<void> {
  try {
    await apiClient.post<ApiResponseV2<null>>('/auth/resend-verification');
  } catch (error) {
    console.error('Resend verification email failed:', error);
    throw error;
  }
}

export async function getEmailVerificationStatus(): Promise<{ verified: boolean }> {
  try {
    const response = await apiClient.get<ApiResponseV2<{ verified: boolean }>>('/auth/email-status');
    return response.data;
  } catch (error) {
    console.error('Failed to get email verification status:', error);
    throw error;
  }
} 