import { User } from '@repo/shared-types';
import { mockStore } from './mock-store';
import { UserPreferences, NotificationSettings } from './types';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
const API_VERSION = import.meta.env.VITE_API_VERSION;

interface ApiResponse<T> {
  data: T;
  error?: never;
}

interface ApiError {
  data?: never;
  error: {
    message: string;
    code: string;
  };
}

type ApiResult<T> = ApiResponse<T> | ApiError;

async function handleApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    const error = await response.json();
    return {
      error: {
        message: error.message || 'An error occurred',
        code: error.code || 'UNKNOWN_ERROR',
      },
    };
  }

  const data = await response.json();
  return { data };
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': `application/json`,
  'X-API-Version': API_VERSION,
};

async function fetchWithTimeout(resource: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(resource, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error('API request failed:', error);
    
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      throw new Error('Network error: This might be due to CORS restrictions or the server being unavailable.');
    }
    
    throw error;
  }
}

export const apiClient = {
  users: {
    get: async (userId: string): Promise<ApiResult<User>> => {
      if (USE_MOCK_API) {
        try {
          const user = await mockStore.getUser(userId);
          if (!user) throw new Error('User not found');
          return { data: user };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'User not found',
              code: 'USER_NOT_FOUND',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}`);
      return handleApiResponse<User>(response);
    },

    update: async (userId: string, data: Partial<User>): Promise<ApiResult<User>> => {
      if (USE_MOCK_API) {
        try {
          const user = await mockStore.updateUser(userId, data);
          return { data: user };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to update user',
              code: 'UPDATE_FAILED',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<User>(response);
    },
  },

  preferences: {
    get: async (userId: string): Promise<ApiResult<UserPreferences>> => {
      if (USE_MOCK_API) {
        try {
          const prefs = await mockStore.getUserPreferences(userId);
          if (!prefs) throw new Error('Preferences not found');
          return { data: prefs };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Preferences not found',
              code: 'PREFERENCES_NOT_FOUND',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}/preferences`);
      return handleApiResponse<UserPreferences>(response);
    },

    update: async (userId: string, data: Partial<UserPreferences>): Promise<ApiResult<UserPreferences>> => {
      if (USE_MOCK_API) {
        try {
          const prefs = await mockStore.updateUserPreferences(userId, data);
          return { data: prefs };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to update preferences',
              code: 'UPDATE_FAILED',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}/preferences`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<UserPreferences>(response);
    },
  },

  notifications: {
    get: async (userId: string): Promise<ApiResult<NotificationSettings>> => {
      if (USE_MOCK_API) {
        try {
          const settings = await mockStore.getNotificationSettings(userId);
          if (!settings) throw new Error('Notification settings not found');
          return { data: settings };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Notification settings not found',
              code: 'SETTINGS_NOT_FOUND',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}/notifications`);
      return handleApiResponse<NotificationSettings>(response);
    },

    update: async (userId: string, data: Partial<NotificationSettings>): Promise<ApiResult<NotificationSettings>> => {
      if (USE_MOCK_API) {
        try {
          const settings = await mockStore.updateNotificationSettings(userId, data);
          return { data: settings };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Failed to update notification settings',
              code: 'UPDATE_FAILED',
            },
          };
        }
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}/notifications`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<NotificationSettings>(response);
    },
  },
}; 