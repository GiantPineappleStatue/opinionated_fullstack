export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiGetInterface {
  url: string;
  customHeaders?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean>;
  routeParams?: Record<string, string | number>;
}

// Add Vite env types
declare module 'vite/client' {
  interface ImportMetaEnv {
    VITE_SERVICE_URL: string;
  }
} 