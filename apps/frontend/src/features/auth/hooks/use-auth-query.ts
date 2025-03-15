import { useAuthQuery } from '../api/auth-queries';

export function useAuth() {
  return useAuthQuery();
} 