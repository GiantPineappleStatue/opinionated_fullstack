import { useProfileQuery } from '../api/profile-queries';

export function useProfile() {
  return useProfileQuery();
} 