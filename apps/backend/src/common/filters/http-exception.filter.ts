import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorV2 } from '@repo/shared-types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
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
    response.status(status).json(errorResponse);
  }
} 