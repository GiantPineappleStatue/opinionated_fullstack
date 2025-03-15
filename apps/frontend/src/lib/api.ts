import { env } from '@/env';
import { errorLogger } from './error/error-logger';

interface ApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiOptions = {}) {
    this.baseUrl = options.baseUrl || env.VITE_API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    if (!response.ok) {
      let error: ApiError;
      
      if (isJson) {
        error = await response.json();
      } else {
        error = {
          message: response.statusText || 'An error occurred',
          status: response.status,
        };
      }

      // Log the API error
      errorLogger.error(new Error(`API Error: ${error.message}`), {
        action: 'api_response',
        additionalData: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          error,
        },
      });

      throw error;
    }

    if (isJson) {
      const result = await response.json();
      return result.data;
    }

    return response as unknown as T;
  }

  private getHeaders(): Record<string, string> {
    return {
      ...this.headers,
    };
  }

  private async fetchWithErrorHandling(url: string, options: RequestInit): Promise<Response> {
    try {
      return await fetch(url, options);
    } catch (error) {
      // Log the error
      errorLogger.error(error instanceof Error ? error : new Error('API request failed'), {
        action: 'api_request',
        additionalData: {
          url,
          method: options.method,
        },
      });
      
      // Create a more informative error for CORS issues
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw {
          message: 'Network error: This might be due to CORS restrictions or the server being unavailable.',
          status: 0,
          code: 'NETWORK_ERROR'
        };
      }
      
      // For other fetch errors
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
        code: 'FETCH_ERROR'
      };
    }
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data: unknown): Promise<T> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, data: unknown): Promise<T> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }
}

// Create and export a default API client instance
export const api = new ApiClient(); 