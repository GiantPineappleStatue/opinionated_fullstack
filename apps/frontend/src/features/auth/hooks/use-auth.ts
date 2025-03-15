import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginRequestV2, RegisterRequestV2 } from '@repo/shared-types';
import { authApi, authKeys, type AuthResponse } from '../api/auth';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    ...authKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestV2) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser.queryKey, data);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequestV2) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser.queryKey, data);
      toast({
        title: 'Welcome!',
        description: 'Your account has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser.queryKey, null);
      queryClient.clear();
      toast({
        title: 'Goodbye!',
        description: 'You have been logged out.',
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      toast({
        title: 'Email sent',
        description: 'Verification email has been sent to your inbox.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send email',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      queryClient.invalidateQueries(authKeys.currentUser.queryKey);
      toast({
        title: 'Email verified',
        description: 'Your email has been verified successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast({
        title: 'Email sent',
        description: 'Password reset instructions have been sent to your email.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send email',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Your password has been reset successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Reset failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
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