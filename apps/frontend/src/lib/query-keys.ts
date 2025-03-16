import { createQueryKeys } from '@lukemorales/query-key-factory';

export const authKeys = createQueryKeys('auth', {
  profile: null,
  users: (userId?: string) => [userId],
});

// Merge all domain query keys here
export const queryKeys = authKeys; 