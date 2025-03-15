import React, { ReactNode } from 'react';
import { useAuth } from '@/features/auth';
import { router } from '@/lib/router';
import { AuthContext } from '@/lib/router';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Set the auth context in the router
  React.useEffect(() => {
    const authContext: AuthContext = {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.user,
      login: auth.login,
      register: auth.register,
      logout: auth.logout,
      refreshToken: auth.refreshToken,
    };

    router.update({
      context: {
        auth: authContext,
      },
    });
  }, [
    auth.isAuthenticated,
    auth.isLoading,
    auth.user,
    auth.login,
    auth.register,
    auth.logout,
    auth.refreshToken,
  ]);

  return <>{children}</>;
}

// Re-export useAuth for backward compatibility
export { useAuth }; 