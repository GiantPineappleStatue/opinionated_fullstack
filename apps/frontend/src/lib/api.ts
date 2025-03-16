import { errorLogger } from './error/error-logger';

interface ApiOptions {
  headers?: Record<string, string>;
}

interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Create API client configuration
const createApiConfig = (options: ApiOptions = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };
  
  return { headers };
};

// Handle API response
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText || 'An error occurred',
      status: response.status,
      code: 'API_ERROR'
    }));
    
    errorLogger.error('API Error', { error, url: response.url });
    throw error;
  }

  // For empty responses
  if (response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (e) {
    const error: ApiError = {
      message: 'Failed to parse response',
      status: 500,
      code: 'PARSE_ERROR'
    };
    errorLogger.error('Parse Error', { error, url: response.url });
    throw error;
  }
};

// Create API client
export const createApiClient = (options: ApiOptions = {}) => {
  const config = createApiConfig(options);
  
  const fetchWithConfig = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const isAuthEndpoint = url.includes('auth/');
    if (isAuthEndpoint) {
      console.log(`Making auth request to: ${url}`, {
        method: options.method,
        headers: { ...config.headers, ...options.headers },
        credentials: 'include',
      });
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...config.headers,
          ...options.headers,
        },
        credentials: 'include',
      });
      
      if (isAuthEndpoint) {
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        console.log(`Auth response details:`, {
          url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: responseHeaders,
          type: response.type,
          redirected: response.redirected,
        });
      }
      
      return response;
    } catch (error) {
      errorLogger.error('Network Error', { error, url });
      throw {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    }
  };
  
  return {
    get: async <T>(url: string): Promise<T> => {
      const response = await fetchWithConfig(url, { method: 'GET' });
      return handleResponse<T>(response);
    },
    
    post: async <T>(url: string, data?: unknown): Promise<T> => {
      const response = await fetchWithConfig(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse<T>(response);
    },
    
    put: async <T>(url: string, data: unknown): Promise<T> => {
      const response = await fetchWithConfig(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse<T>(response);
    },
    
    delete: async <T>(url: string, data?: unknown): Promise<T> => {
      const response = await fetchWithConfig(url, {
        method: 'DELETE',
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse<T>(response);
    },
    
    patch: async <T>(url: string, data: unknown): Promise<T> => {
      const response = await fetchWithConfig(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<T>(response);
    },
  };
};

// Create and export a default API client instance
export const api = createApiClient(); 