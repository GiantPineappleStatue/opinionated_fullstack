import { User } from '@repo/shared-types';
import { UserPreferences, NotificationSettings } from './types';

type Store = {
  users: Map<string, User>;
  userPreferences: Map<string, UserPreferences>;
  userNotifications: Map<string, NotificationSettings>;
};

class MockStore {
  private store: Store;

  constructor() {
    this.store = {
      users: new Map(),
      userPreferences: new Map(),
      userNotifications: new Map(),
    };

    // Initialize with some mock data
    const mockUser: User = {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.users.set(mockUser.id, mockUser);
    this.store.userPreferences.set(mockUser.id, {
      theme: 'system',
      emailNotifications: true,
      pushNotifications: true,
    });
    this.store.userNotifications.set(mockUser.id, {
      marketing: true,
      security: true,
      updates: true,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await this.simulateLatency();
    return this.store.users.get(id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await this.simulateLatency();
    const user = this.store.users.get(id);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
    this.store.users.set(id, updatedUser);
    return updatedUser;
  }

  // Preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    await this.simulateLatency();
    return this.store.userPreferences.get(userId);
  }

  async updateUserPreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> {
    await this.simulateLatency();
    const prefs = this.store.userPreferences.get(userId);
    if (!prefs) throw new Error('Preferences not found');

    const updatedPrefs = { ...prefs, ...data };
    this.store.userPreferences.set(userId, updatedPrefs);
    return updatedPrefs;
  }

  // Notification settings operations
  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    await this.simulateLatency();
    return this.store.userNotifications.get(userId);
  }

  async updateNotificationSettings(userId: string, data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    await this.simulateLatency();
    const settings = this.store.userNotifications.get(userId);
    if (!settings) throw new Error('Notification settings not found');

    const updatedSettings = { ...settings, ...data };
    this.store.userNotifications.set(userId, updatedSettings);
    return updatedSettings;
  }

  private async simulateLatency(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
  }
}

export const mockStore = new MockStore(); 