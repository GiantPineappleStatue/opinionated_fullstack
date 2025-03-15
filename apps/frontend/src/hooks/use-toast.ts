import { toast as sonnerToast, type ToastT } from 'sonner';

type ToastProps = {
  message: string;
  description?: string;
};

export function useToast() {
  const toast = {
    success: ({ message, description }: ToastProps) => {
      return sonnerToast.success(message, {
        description,
        className: 'group toast-success',
      });
    },
    error: ({ message, description }: ToastProps) => {
      return sonnerToast.error(message, {
        description,
        className: 'group toast-error',
      });
    },
    warning: ({ message, description }: ToastProps) => {
      return sonnerToast.warning(message, {
        description,
        className: 'group toast-warning',
      });
    },
    info: ({ message, description }: ToastProps) => {
      return sonnerToast.info(message, {
        description,
        className: 'group toast-info',
      });
    },
    loading: ({ message, description }: ToastProps) => {
      return sonnerToast.loading(message, {
        description,
        className: 'group toast-loading',
      });
    },
    promise: async <T>(
      promise: Promise<T>,
      {
        loading = 'Loading...',
        success = 'Success!',
        error = 'Something went wrong',
      }: {
        loading?: string;
        success?: string;
        error?: string;
      } = {},
    ) => {
      return sonnerToast.promise(promise, {
        loading,
        success,
        error,
      });
    },
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },
  };

  return toast;
} 