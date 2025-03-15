import { useState, useEffect, useCallback } from 'react';

interface UseLoadingOptions {
  delay?: number;
  minDuration?: number;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { delay = 200, minDuration = 500 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const start = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setStartTime(Date.now());
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const stop = useCallback(() => {
    if (!startTime) {
      setIsLoading(false);
      return;
    }

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDuration - elapsedTime);

    setTimeout(() => {
      setIsLoading(false);
      setStartTime(null);
    }, remainingTime);
  }, [minDuration, startTime]);

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setStartTime(null);
    };
  }, []);

  return {
    isLoading,
    start,
    stop,
  };
} 