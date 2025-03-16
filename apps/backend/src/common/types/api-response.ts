import { HttpStatus } from '@nestjs/common';

// Extended API response type that includes error information
export interface ApiResponseExtended<T> {
  data: T | null;
  status: number;
  message?: string;
  error?: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
}

export class ApiResponseWithError<T> {
  data: T | null;
  status: number;
  message?: string;
  error?: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };

  constructor(data: T | null, status: number, message?: string, errorCode?: string, errorMessage?: string) {
    this.data = data;
    this.status = status;
    this.message = message;
    
    if (errorCode && errorMessage) {
      this.error = {
        code: errorCode,
        message: errorMessage
      };
    }
  }

  static success<T>(data: T, message?: string): ApiResponseWithError<T> {
    return new ApiResponseWithError(data, HttpStatus.OK, message);
  }

  static error<T>(status: number, errorCode: string, errorMessage: string, data: T | null = null, message?: string): ApiResponseWithError<T> {
    const response = new ApiResponseWithError(data, status, message, errorCode, errorMessage);
    return response;
  }

  static unauthorized<T>(message: string = 'Authentication required', errorMessage: string = 'You must be logged in to access this resource'): ApiResponseWithError<T> {
    return ApiResponseWithError.error<T>(
      HttpStatus.UNAUTHORIZED, 
      'UNAUTHORIZED', 
      errorMessage,
      null as unknown as T,
      message
    );
  }
} 