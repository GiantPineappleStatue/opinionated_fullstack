import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient } from '@tanstack/react-query';
import { AuthContextInterface } from '@/auth';

interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextInterface
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search.redirect as string | undefined,
  }),
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
} 