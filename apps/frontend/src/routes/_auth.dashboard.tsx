import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailVerificationBanner } from '@/components/email-verification-banner';

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <EmailVerificationBanner />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your space command center.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">User ID:</span>
                <p className="font-medium">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your recent activity will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 