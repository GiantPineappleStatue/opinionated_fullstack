export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface NotificationSettings {
  marketing: boolean;
  security: boolean;
  updates: boolean;
} 