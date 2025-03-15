import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginRequestV2, RegisterRequestV2 } from '@repo/shared-types';
import * as authService from '@/lib/auth/auth-service';
import { queryKeys } from '@/lib/query/query-keys';
import { useToast } from '@/hooks/use-toast';
import { router } from '@/lib/router';
import { AuthContext } from '@/lib/router';

export function useAuthQuery() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get current user
  const userQuery = useQuery({
    queryKey: queryKeys.auth.user.queryKey,
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestV2) => authService.login(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.user.queryKey, user);
      toast.success({
        message: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequestV2) => authService.register(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.user.queryKey, user);
      toast.success({
        message: 'Welcome!',
        description: 'Your account has been created successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.user.queryKey, null);
      queryClient.clear();
      router.navigate({ to: '/login' });
      toast.success({
        message: 'Goodbye!',
        description: 'You have been logged out.',
      });
    },
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      toast.success({
        message: 'Email sent',
        description: 'Verification email has been sent to your inbox.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Failed to send email',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user.queryKey });
      toast.success({
        message: 'Email verified',
        description: 'Your email has been verified successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Verification failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset({ email }),
    onSuccess: () => {
      toast.success({
        message: 'Email sent',
        description: 'Password reset instructions have been sent to your email.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Failed to send email',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => 
      authService.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success({
        message: 'Password reset',
        description: 'Your password has been reset successfully.',
      });
    },
    onError: (error) => {
      toast.error({
        message: 'Reset failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Create a refreshToken function to match the AuthContext interface
  const refreshToken = async () => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      toast.error({
        message: 'Session expired',
        description: 'Please log in again to continue.',
      });
      await logoutMutation.mutateAsync();
    }
  };

  // Handle the case where user might be undefined
  const user = userQuery.data === undefined ? null : userQuery.data;

  // Return the auth context for the router
  const authContext: AuthContext = {
    user,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshToken,
  };

  // Return both the auth context and additional properties
  return {
    ...authContext,
    resendVerification: resendVerificationMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isResendVerificationPending: resendVerificationMutation.isPending,
    isVerifyEmailPending: verifyEmailMutation.isPending,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    isResetPasswordPending: resetPasswordMutation.isPending,
  };
} 