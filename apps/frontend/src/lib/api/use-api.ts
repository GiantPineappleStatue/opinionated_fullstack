import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { api } from './index';

export function useApiQuery<T>(
  path: string,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: [path],
    queryFn: () => api.get<T>(path),
    ...options,
  });
}

export function useApiMutation<T, V>(
  path: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<UseMutationOptions<T, Error, V>, 'mutationFn'>
) {
  return useMutation<T, Error, V>({
    mutationFn: (variables) => api[method]<T>(path, variables),
    ...options,
  });
} 