import { createQueryKeyStore } from '@lukemorales/query-key-factory';

export const queryKeys = createQueryKeyStore({
  auth: {
    user: null,
    session: null,
  },
  users: {
    detail: (userId: string) => [userId] as const,
    list: null,
    preferences: (userId: string) => ['preferences', userId] as const,
  },
  profile: {
    current: null,
    avatar: null,
    socialLinks: null,
  },
  settings: {
    profile: (userId: string) => ['profile', userId] as const,
    notifications: (userId: string) => ['notifications', userId] as const,
  },
}); 