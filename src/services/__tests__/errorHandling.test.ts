import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { errorService, ErrorCategory, ErrorSeverity, handleNetworkError, handleAuthError } from '../errorHandling.ts';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    errorService.clearErrors();
  });

  it('should log errors correctly', () => {
    const error = new Error('Test error');
    const loggedError = errorService.logError(error, ErrorCategory.NETWORK, ErrorSeverity.HIGH);
    
    expect(loggedError.id).toBeDefined();
    expect(loggedError.message).toBe('Test error');
    expect(loggedError.category).toBe(ErrorCategory.NETWORK);
    expect(loggedError.severity).toBe(ErrorSeverity.HIGH);
  });

  it('should get errors by category', () => {
    errorService.logError(new Error('Network error'), ErrorCategory.NETWORK, ErrorSeverity.HIGH);
    errorService.logError(new Error('Auth error'), ErrorCategory.AUTH, ErrorSeverity.HIGH);
    
    const networkErrors = errorService.getErrorsByCategory(ErrorCategory.NETWORK);
    const authErrors = errorService.getErrorsByCategory(ErrorCategory.AUTH);
    
    expect(networkErrors.length).toBe(1);
    expect(authErrors.length).toBe(1);
    expect(networkErrors[0].message).toBe('Network error');
  });

  it('should detect critical errors', () => {
    errorService.logError(new Error('Critical error'), ErrorCategory.UNKNOWN, ErrorSeverity.CRITICAL);
    
    expect(errorService.hasCriticalErrors()).toBe(true);
  });

  it('should get recent errors', () => {
    errorService.logError(new Error('Recent error'), ErrorCategory.NETWORK, ErrorSeverity.MEDIUM);
    
    const recentErrors = errorService.getRecentErrors(5);
    expect(recentErrors.length).toBe(1);
  });

  it('should clear errors', () => {
    errorService.logError(new Error('Test error'), ErrorCategory.NETWORK, ErrorSeverity.HIGH);
    errorService.clearErrors();
    
    expect(errorService.getErrors().length).toBe(0);
  });

  it('should provide user-friendly messages', () => {
    const networkError = errorService.logError(new Error('Network failed'), ErrorCategory.NETWORK, ErrorSeverity.HIGH);
    const authError = errorService.logError(new Error('Auth failed'), ErrorCategory.AUTH, ErrorSeverity.HIGH);
    
    expect(networkError.userMessage).toContain('Network');
    expect(authError.userMessage).toContain('Authentication');
  });

  it('should handle convenience functions', () => {
    const networkError = handleNetworkError(new Error('Network failed'));
    const authError = handleAuthError(new Error('Auth failed'));
    
    expect(networkError.category).toBe(ErrorCategory.NETWORK);
    expect(authError.category).toBe(ErrorCategory.AUTH);
  });
});