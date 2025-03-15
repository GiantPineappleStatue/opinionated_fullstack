import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { router } from '../router';
import { LoginRequestV2, RegisterRequestV2 } from '@repo/shared-types';
import * as authService from './auth-service';
import type { AuthUser } from './auth-service';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequestV2) => Promise<AuthUser>;
  register: (data: RegisterRequestV2) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        // If there's an error, assume the user is not authenticated
        setUser(null);
      } finally {
        // Set loading to false after a short delay to prevent UI flashing
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequestV2) => {
    try {
      const user = await authService.login(data);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequestV2) => {
    try {
      const user = await authService.register(data);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, we still want to clear the local state
    } finally {
      setUser(null);
      router.navigate({ to: '/login' });
    }
  };

  // Update router context whenever auth state changes
  useEffect(() => {
    router.update({
      context: {
        auth: {
          isAuthenticated: !!user,
          isLoading,
          user,
          login,
          register,
          logout,
        },
      },
    });
  }, [user, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 