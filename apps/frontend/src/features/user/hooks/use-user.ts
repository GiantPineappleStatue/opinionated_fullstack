import { useUserQuery } from '../api/user-queries';

export function useUser(userId: string) {
  return useUserQuery(userId);
} 