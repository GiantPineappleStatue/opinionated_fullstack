import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './lib/router';
import { Providers } from '@/components/providers';
import './styles/globals.css';

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Initialize router context with dummy functions
// These will be replaced by the actual functions from AuthProvider
router.update({
  context: {
    auth: {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: async () => {
        throw new Error('Auth context not initialized');
      },
      register: async () => {
        throw new Error('Auth context not initialized');
      },
      logout: async () => {
        throw new Error('Auth context not initialized');
      },
    },
  },
});

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}
