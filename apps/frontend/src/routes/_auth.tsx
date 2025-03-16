import { Outlet, createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
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
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
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
              search={{ redirect: undefined }}
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{
                className: "text-sm font-medium text-primary"
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              search={{ redirect: undefined }}
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{
                className: "text-sm font-medium text-primary"
              }}
            >
              Profile
            </Link>
            <Link
              to="/account"
              search={{ redirect: undefined }}
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