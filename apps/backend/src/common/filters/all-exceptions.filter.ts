import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorV2 } from '@repo/shared-types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Check if this is an HTTP exception
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Extract validation errors if they exist
      const errors = exceptionResponse.message?.errors || 
        (Array.isArray(exceptionResponse.message) 
          ? { general: exceptionResponse.message } 
          : undefined);

      // Create a standardized error response
      const errorResponse: ApiErrorV2 = {
        status,
        message: typeof exceptionResponse.message === 'string' 
          ? exceptionResponse.message 
          : Array.isArray(exceptionResponse.message) 
            ? exceptionResponse.message[0] 
            : 'An error occurred',
        code: exceptionResponse.error || HttpStatus[status],
        errors,
      };

      // Log the error
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} ${errorResponse.message}`,
        exception.stack,
      );

      // Send the error response
      return response.status(status).json(errorResponse);
    }
    
    // Default to internal server error for non-HTTP exceptions
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Create a standardized error response
    const errorResponse: ApiErrorV2 = {
      status,
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    };

    // Log the error with stack trace
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} ${exception.message || 'Internal server error'}`,
      exception.stack,
    );

    // Send the error response
    response.status(status).json(errorResponse);
  }
} 