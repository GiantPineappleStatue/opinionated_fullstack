import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const search = useSearch({ from: '/verify-email' });
  const { verifyEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = search.token as string;
    
    if (!token) {
      setVerificationState('error');
      setErrorMessage('No verification token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.verified) {
          setVerificationState('success');
        } else {
          setVerificationState('error');
          setErrorMessage('Email verification failed');
        }
      } catch (error) {
        setVerificationState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Email verification failed');
      }
    };

    verifyToken();
  }, [search.token, verifyEmail]);

  const handleContinue = () => {
    navigate({ to: isAuthenticated ? '/dashboard' : '/login' });
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationState === 'loading' && 'Verifying your email address...'}
            {verificationState === 'success' && 'Your email has been verified!'}
            {verificationState === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {verificationState === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {verificationState === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {verificationState === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="mt-4 text-center text-muted-foreground">{errorMessage}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationState !== 'loading' && (
            <Button onClick={handleContinue}>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 