/**
 * Error logging service for the application.
 * This service provides methods for logging errors to various destinations.
 */

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Define error context interface
export interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, unknown>;
}

// Define error log entry interface
export interface ErrorLogEntry {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: string;
  context?: ErrorContext;
}

/**
 * Error logger class that handles logging errors to various destinations.
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  private isEnabled = true;
  private consoleEnabled = true;
  private serverEnabled = false;
  private serverUrl = '/api/logs';

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of the ErrorLogger.
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Enable or disable error logging.
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Enable or disable console logging.
   */
  public setConsoleEnabled(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }

  /**
   * Enable or disable server logging.
   */
  public setServerEnabled(enabled: boolean, serverUrl?: string): void {
    this.serverEnabled = enabled;
    if (serverUrl) {
      this.serverUrl = serverUrl;
    }
  }

  /**
   * Log an error with the specified severity and context.
   */
  public log(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: ErrorContext
  ): void {
    if (!this.isEnabled) return;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const logEntry: ErrorLogEntry = {
      message: errorMessage,
      stack: errorStack,
      severity,
      timestamp: new Date().toISOString(),
      context,
    };

    // Log to console if enabled
    if (this.consoleEnabled) {
      this.logToConsole(logEntry);
    }

    // Log to server if enabled
    if (this.serverEnabled) {
      this.logToServer(logEntry).catch((err) => {
        // If server logging fails, fallback to console
        console.error('Failed to log error to server:', err);
        this.logToConsole({
          ...logEntry,
          message: `Failed to log to server: ${logEntry.message}`,
          severity: ErrorSeverity.WARNING,
        });
      });
    }
  }

  /**
   * Log an info message.
   */
  public info(message: string, context?: ErrorContext): void {
    this.log(message, ErrorSeverity.INFO, context);
  }

  /**
   * Log a warning message.
   */
  public warning(error: Error | string, context?: ErrorContext): void {
    this.log(error, ErrorSeverity.WARNING, context);
  }

  /**
   * Log an error message.
   */
  public error(error: Error | string, context?: ErrorContext): void {
    this.log(error, ErrorSeverity.ERROR, context);
  }

  /**
   * Log a critical error message.
   */
  public critical(error: Error | string, context?: ErrorContext): void {
    this.log(error, ErrorSeverity.CRITICAL, context);
  }

  /**
   * Log an entry to the console.
   */
  private logToConsole(logEntry: ErrorLogEntry): void {
    const { severity, message, stack, context } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';

    switch (severity) {
      case ErrorSeverity.INFO:
        console.info(`[${timestamp}] INFO: ${message}${contextStr}`);
        break;
      case ErrorSeverity.WARNING:
        console.warn(`[${timestamp}] WARNING: ${message}${contextStr}`);
        if (stack) console.warn(stack);
        break;
      case ErrorSeverity.ERROR:
        console.error(`[${timestamp}] ERROR: ${message}${contextStr}`);
        if (stack) console.error(stack);
        break;
      case ErrorSeverity.CRITICAL:
        console.error(`[${timestamp}] CRITICAL: ${message}${contextStr}`);
        if (stack) console.error(stack);
        break;
      default:
        console.log(`[${timestamp}] ${severity}: ${message}${contextStr}`);
        if (stack) console.log(stack);
    }
  }

  /**
   * Log an entry to the server.
   */
  private async logToServer(logEntry: ErrorLogEntry): Promise<void> {
    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to send log to server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export a singleton instance of the error logger
export const errorLogger = ErrorLogger.getInstance();

// Export a convenience function for logging errors
export function logError(error: Error | string, context?: ErrorContext): void {
  errorLogger.error(error, context);
} 