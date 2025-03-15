import { Outlet, createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    // If we're still loading, don't redirect yet
    if (context.auth.isLoading) {
      return;
    }
    
    // If not authenticated after loading, redirect to login
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{
                className: "text-sm font-medium text-primary"
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{
                className: "text-sm font-medium text-primary"
              }}
            >
              Profile
            </Link>
            <Link
              to="/account"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{
                className: "text-sm font-medium text-primary"
              }}
            >
              Account
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
} 