import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuth, AuthProvider } from './auth';
import { routeTree } from './routeTree.gen';
import './styles/globals.css';
import { User } from '@repo/shared-types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({
  routeTree,
  context:   {
    queryClient,
    auth: null!
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Register your router for maximum type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Create an auth context for the router
interface AuthContext {
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  user: User | null
  isLoading: boolean
}

// Create a router context type
interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

function App() {
  const auth = useAuth();

  return (

      <RouterProvider 
        router={router}
        context={{
          queryClient,
          auth: auth,
        }}
      />

  );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>    </QueryClientProvider>
  </StrictMode>,
);
