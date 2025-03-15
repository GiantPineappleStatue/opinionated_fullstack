import { useState } from 'react';
import { useAuth } from '../hooks/use-auth-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, AlertTriangle, Loader2 } from 'lucide-react';

export function EmailVerificationBanner() {
  const { user, resendVerification, isResendVerificationPending } = useAuth();
  const [isResent, setIsResent] = useState(false);

  // If email is verified, don't show the banner
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    try {
      await resendVerification();
      setIsResent(true);
      // Reset the "resent" state after 5 seconds
      setTimeout(() => setIsResent(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Email verification required</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span>Please verify your email address to access all features.</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={handleResend}
          disabled={isResendVerificationPending || isResent}
        >
          {isResendVerificationPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : isResent ? (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Email sent!
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
} 