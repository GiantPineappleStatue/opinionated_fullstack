import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth';
import { MailIcon } from 'lucide-react';

export function EmailVerificationBanner() {
  const { user, resendVerification, isResendVerificationPending } = useAuth();
  const toast = useToast();

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      toast.success({
        message: 'Verification email sent',
        description: 'Please check your inbox for the verification link.',
      });
    } catch (error) {
      toast.error({
        message: 'Error',
        description: 'Failed to resend verification email. Please try again later.',
      });
    }
  };

  return (
    <Alert variant="warning" className="mb-4">
      <MailIcon className="h-5 w-5" />
      <AlertTitle>Email Verification Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Please verify your email address to access all features. Check your inbox for the verification link.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isResendVerificationPending}
        >
          {isResendVerificationPending ? (
            <>
              <span className="mr-2">Sending...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            'Resend Verification Email'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
} 