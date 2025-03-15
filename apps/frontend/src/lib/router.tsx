import * as React from 'react';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';
import { LoginRequestV2, RegisterRequestV2 } from '@repo/shared-types';
import { AppErrorFallback, ErrorBoundary } from '@/components/error-boundary';
import { AuthUser } from './auth/auth-service';
import { errorLogger } from './error/error-logger';

export interface AuthContext {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (data: LoginRequestV2) => Promise<AuthUser>;
  register: (data: RegisterRequestV2) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshToken?: () => Promise<void>;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  
  // Define the RouterContext interface to match AuthContext
  interface RouterContext {
    auth: AuthContext;
  }
}

// Create the router with proper context type
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be provided by AuthProvider
  } as { auth: AuthContext },
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error }) => {
    // Log the routing error
    errorLogger.error(error instanceof Error ? error : new Error(String(error)), {
      route: window.location.pathname,
      action: 'routing',
    });
    
    return <AppErrorFallback error={error instanceof Error ? error : new Error(String(error))} />;
  },
}); 