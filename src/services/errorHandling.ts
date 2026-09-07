/**
 * Comprehensive Error Handling and Monitoring Service
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  BOOK_SOURCE = 'book_source',
  READER = 'reader',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
  userMessage?: string;
}

class ErrorHandlingService {
  private errors: AppError[] = [];
  private maxStoredErrors = 50;
  private isProduction = import.meta.env.PROD;

  /**
   * Log a new error
   */
  logError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ): AppError {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    
    const appError: AppError = {
      id: this.generateId(),
      message,
      category,
      severity,
      timestamp: Date.now(),
      context,
      stack,
      userMessage: this.getUserFriendlyMessage(category, message)
    };

    this.errors.push(appError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error(`[${category.toUpperCase()}] ${message}`, context || '');
      if (stack) console.error(stack);
    }

    // In production, you could send this to an error tracking service
    // like Sentry, LogRocket, or custom backend
    if (this.isProduction && severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoringService(appError);
    }

    return appError;
  }

  /**
   * Get all stored errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errors.filter(error => error.category === category);
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get recent errors within a time window
   */
  getRecentErrors(minutes: number = 5): AppError[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => error.severity === ErrorSeverity.CRITICAL);
  }

  /**
   * Generate a unique error ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(category: ErrorCategory, message: string): string {
    const friendlyMessages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ErrorCategory.AUTH]: 'Authentication error. Please log in again.',
      [ErrorCategory.BOOK_SOURCE]: 'Unable to load book content. Please try again later.',
      [ErrorCategory.READER]: 'Reader error. The book format may not be supported.',
      [ErrorCategory.STORAGE]: 'Local storage error. Your reading progress may not be saved.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return friendlyMessages[category] || friendlyMessages[ErrorCategory.UNKNOWN];
  }

  /**
   * Send error to monitoring service (placeholder for actual implementation)
   */
  private sendToMonitoringService(error: AppError): void {
    // In production, integrate with services like:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.captureException(error)
    // - Custom backend: fetch('/api/errors', { method: 'POST', body: JSON.stringify(error) })
    
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Example: Send to custom endpoint
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      }).catch(() => {
        // Silent fail - don't cause infinite error loops
      });
    }
  }
}

// Export singleton instance
export const errorService = new ErrorHandlingService();

// Convenience functions for common error scenarios
export const handleNetworkError = (error: Error, context?: Record<string, any>) => {
  return errorService.logError(error, ErrorCategory.NETWORK, ErrorSeverity.HIGH, context);
};

export const handleAuthError = (error: Error, context?: Record<string, any>) => {
  return errorService.logError(error, ErrorCategory.AUTH, ErrorSeverity.HIGH, context);
};

export const handleBookSourceError = (error: Error, context?: Record<string, any>) => {
  return errorService.logError(error, ErrorCategory.BOOK_SOURCE, ErrorSeverity.MEDIUM, context);
};

export const handleReaderError = (error: Error, context?: Record<string, any>) => {
  return errorService.logError(error, ErrorCategory.READER, ErrorSeverity.MEDIUM, context);
};

export const handleStorageError = (error: Error, context?: Record<string, any>) => {
  return errorService.logError(error, ErrorCategory.STORAGE, ErrorSeverity.LOW, context);
};