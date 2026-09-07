/**
 * Security Service
 * Provides rate limiting, input sanitization, and security utilities
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface SecurityOptions {
  enableRateLimiting: boolean;
  enableInputSanitization: boolean;
  enableXSSProtection: boolean;
}

class SecurityService {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private options: SecurityOptions = {
    enableRateLimiting: true,
    enableInputSanitization: true,
    enableXSSProtection: true
  };

  constructor(options?: Partial<SecurityOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Rate limiting implementation
   */
  checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    if (!this.options.enableRateLimiting) return true;

    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    this.rateLimitStore.set(identifier, record);
    return true;
  }

  /**
   * Get remaining requests for rate limit
   */
  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const record = this.rateLimitStore.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - record.count);
  }

  /**
   * Get reset time for rate limit
   */
  getResetTime(identifier: string): number {
    const record = this.rateLimitStore.get(identifier);
    return record ? record.resetTime : 0;
  }

  /**
   * Clear rate limit record
   */
  clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier);
  }

  /**
   * Input sanitization
   */
  sanitizeInput(input: string): string {
    if (!this.options.enableInputSanitization) return input;

    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
      .replace(/data:/gi, '') // Remove data: protocol
      .trim();

    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }

    return sanitized;
  }

  /**
   * Sanitize URL to prevent XSS
   */
  sanitizeUrl(url: string): string {
    if (!this.options.enableXSSProtection) return url;

    try {
      const parsed = new URL(url);
      
      // Only allow safe protocols
      const allowedProtocols = ['http:', 'https:', 'ftp:'];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return '';
      }

      // Remove javascript: and data: protocols
      if (url.toLowerCase().startsWith('javascript:') || 
          url.toLowerCase().startsWith('data:')) {
        return '';
      }

      return url;
    } catch {
      return '';
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % chars.length;
      token += chars[randomIndex];
    }
    
    return token;
  }

  /**
   * Hash string using simple algorithm (for demo purposes)
   * In production, use proper cryptographic hashing
   */
  async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Compare two strings securely (timing attack resistant)
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(unsafe: string): string {
    if (!this.options.enableXSSProtection) return unsafe;

    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Validate file type for uploads
   */
  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, storedToken: string): boolean {
    return this.secureCompare(token, storedToken);
  }

  /**
   * Content Security Policy helper
   */
  getCSPHeader(): string {
    return "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data: blob:; connect-src *; frame-src * blob: data:;";
  }

  /**
   * Clear all rate limits
   */
  clearAllRateLimits(): void {
    this.rateLimitStore.clear();
  }

  /**
   * Update security options
   */
  setOptions(options: Partial<SecurityOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current security options
   */
  getOptions(): SecurityOptions {
    return { ...this.options };
  }
}

// Export singleton instance with default configuration
export const securityService = new SecurityService();

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // API calls: 100 requests per minute
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000
  },
  // Search: 30 requests per minute
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000
  },
  // Authentication: 5 attempts per 15 minutes
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000
  },
  // File uploads: 10 per hour
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000
  }
};