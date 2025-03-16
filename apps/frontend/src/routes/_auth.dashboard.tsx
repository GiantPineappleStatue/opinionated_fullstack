import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [isTestingNats, setIsTestingNats] = useState(false);
  const [natsTestResult, setNatsTestResult] = useState<null | { success: boolean; message: string }>(null);

  const testNatsConnection = async () => {
    setIsTestingNats(true);
    setNatsTestResult(null);
    
    try {
      const response = await api.post('nats/test', {
        from: 'dashboard',
        user: user?.email
      });
      
      if (response) {
        setNatsTestResult({ success: true, message: 'Message sent successfully! Check logs for Python response.' });
        toast.success('NATS test message sent successfully');
      } else {
        setNatsTestResult({ success: false, message: 'Failed to send test message' });
        toast.error('NATS test failed');
      }
    } catch (error: any) {
      setNatsTestResult({ success: false, message: error.message || 'Error testing NATS connection' });
      toast.error('NATS test error');
      console.error('Error testing NATS connection:', error);
    } finally {
      setIsTestingNats(false);
    }
  };

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
            <CardTitle>System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test system components and integrations.
            </p>
            
            <div>
              <Button 
                onClick={testNatsConnection} 
                disabled={isTestingNats}
                variant="outline"
                className="w-full"
              >
                {isTestingNats ? 'Testing NATS...' : 'Test NATS Connection'}
              </Button>
              
              {natsTestResult && (
                <div className={`mt-2 text-sm p-2 rounded ${natsTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {natsTestResult.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 