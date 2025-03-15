import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function useError() {
  const navigate = useNavigate();

  const handleError = useCallback((error: unknown) => {
    console.error('Error:', error);

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast.error('Unable to connect to the server. Please check your internet connection.');
      return;
    }

    // Handle API errors
    const apiError = error as ApiError;
    if (apiError.status === 401) {
      toast.error('Session expired. Please log in again.');
      navigate({ to: '/login' });
      return;
    }

    if (apiError.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    if (apiError.status === 404) {
      toast.error('The requested resource was not found.');
      return;
    }

    if (apiError.status === 422) {
      toast.error('Invalid input. Please check your data and try again.');
      return;
    }

    if (apiError.status >= 500) {
      toast.error('A server error occurred. Our team has been notified.');
      return;
    }

    // Handle validation errors
    if (apiError.code === 'VALIDATION_ERROR') {
      toast.error(apiError.message || 'Please check your input and try again.');
      return;
    }

    // Handle other errors
    toast.error(
      apiError.message || 'An unexpected error occurred. Please try again later.'
    );
  }, [navigate]);

  return { handleError };
} 