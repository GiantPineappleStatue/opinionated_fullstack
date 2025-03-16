import { User } from '@repo/shared-types';
import { UserPreferences, NotificationSettings } from './types';
import { env } from '@/env';

const API_BASE_URL = env.VITE_API_URL;
const API_INTERNAL_URL = env.VITE_INTERNAL_API_URL;
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

  // Always use API_BASE_URL for browser requests
  const fullUrl = resource.startsWith('http') ? resource : `${API_BASE_URL}/${resource.replace(/^\/+/, '')}`;

  try {
    const response = await fetch(fullUrl, {
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
      const response = await fetchWithTimeout(`users/${userId}`);
      return handleApiResponse<User>(response);
    },

    update: async (userId: string, data: Partial<User>): Promise<ApiResult<User>> => {
      const response = await fetchWithTimeout(`users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<User>(response);
    },
  },

  preferences: {
    get: async (userId: string): Promise<ApiResult<UserPreferences>> => {
      const response = await fetchWithTimeout(`users/${userId}/preferences`);
      return handleApiResponse<UserPreferences>(response);
    },

    update: async (userId: string, data: Partial<UserPreferences>): Promise<ApiResult<UserPreferences>> => {
      const response = await fetchWithTimeout(`users/${userId}/preferences`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<UserPreferences>(response);
    },
  },

  notifications: {
    get: async (userId: string): Promise<ApiResult<NotificationSettings>> => {
      const response = await fetchWithTimeout(`users/${userId}/notifications`);
      return handleApiResponse<NotificationSettings>(response);
    },

    update: async (userId: string, data: Partial<NotificationSettings>): Promise<ApiResult<NotificationSettings>> => {
      const response = await fetchWithTimeout(`users/${userId}/notifications`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleApiResponse<NotificationSettings>(response);
    },
  },
}; 