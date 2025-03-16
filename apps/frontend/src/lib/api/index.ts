import { env } from '@/env';
import { errorLogger } from '../error/error-logger';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

const DEFAULT_HEADERS = {
// ... existing code ...
} 