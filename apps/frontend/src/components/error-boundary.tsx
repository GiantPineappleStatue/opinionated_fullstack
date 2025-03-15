import { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { errorLogger, ErrorSeverity } from '../lib/error/error-logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error logging service
    errorLogger.error(error, {
      component: 'ErrorBoundary',
      additionalData: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <AppErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface AppErrorFallbackProps {
  error: Error | null;
}

export function AppErrorFallback({ error }: AppErrorFallbackProps): React.ReactElement {
  const navigate = useNavigate();
  const routerState = useRouterState();

  const handleRefresh = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    navigate({ to: '/' });
  };

  // Log the error with additional context
  if (error) {
    errorLogger.log(error, ErrorSeverity.ERROR, {
      route: window.location.pathname,
      action: 'rendering',
      additionalData: {
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            We've encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-[200px]">
            <p className="font-mono">{error?.message || 'Unknown error'}</p>
            {error?.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Error details
                </summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 