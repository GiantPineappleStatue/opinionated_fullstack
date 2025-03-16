import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { AuthUser } from '@/lib/auth/auth-service';
import { queryKeys } from '@/lib/query/query-keys';

export function useUser(userId: string) {
  return useQuery<AuthUser, Error>({
    queryKey: ['users', 'detail', userId],
    queryFn: async () => {
      const response = await apiClient.users.get(userId);
      if ('error' in response && response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
  });
} 