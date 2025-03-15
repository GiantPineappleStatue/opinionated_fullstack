import { useUsersListQuery } from '../api/user-queries';

export function useUsersList() {
  return useUsersListQuery();
} 