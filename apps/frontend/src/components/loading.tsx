import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ className, size = 'md', fullScreen }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const Spinner = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-muted" />
      
      {/* Spinning gradient ring */}
      <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-blue-500 border-b-pink-500 border-l-indigo-500 animate-spin" />
      
      {/* Inner glow */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return <Spinner />;
} 