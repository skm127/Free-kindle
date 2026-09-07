/**
 * Analytics and Monitoring Service
 * Tracks user behavior, reading patterns, and app performance
 */

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  booksViewed: string[];
  booksRead: string[];
  searchQueries: string[];
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: number;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.isEnabled = !import.meta.env.PROD || this.isAnalyticsEnabled();
    
    if (this.isEnabled) {
      this.startFlushTimer();
      this.trackPageView();
      this.trackPerformanceMetrics();
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if analytics is enabled
   */
  private isAnalyticsEnabled(): boolean {
    try {
      const saved = localStorage.getItem('analytics_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Track an analytics event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName?: string): void {
    this.track('page_view', {
      page: pageName || window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    });
  }

  /**
   * Track book view
   */
  trackBookView(bookId: string, bookTitle: string, author: string, source: string): void {
    this.track('book_view', {
      bookId,
      bookTitle,
      author,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track book read start
   */
  trackBookReadStart(bookId: string, bookTitle: string): void {
    this.track('book_read_start', {
      bookId,
      bookTitle,
      timestamp: Date.now()
    });
  }

  /**
   * Track reading progress
   */
  trackReadingProgress(bookId: string, bookTitle: string, progress: number, location: string): void {
    this.track('reading_progress', {
      bookId,
      bookTitle,
      progress,
      location,
      timestamp: Date.now()
    });
  }

  /**
   * Track book read completion
   */
  trackBookReadComplete(bookId: string, bookTitle: string, duration: number): void {
    this.track('book_read_complete', {
      bookId,
      bookTitle,
      duration,
      timestamp: Date.now()
    });
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultCount: number, filters?: Record<string, any>): void {
    this.track('search', {
      query,
      resultCount,
      filters,
      timestamp: Date.now()
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, context?: Record<string, any>): void {
    this.track('user_interaction', {
      element,
      action,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Track page load time
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as any;
      if (perfData) {
        this.track('page_load_performance', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart,
          firstPaint: perfData.responseStart - perfData.fetchStart
        });
      }
    });

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.track('core_web_vital_lcp', {
          value: lastEntry.renderTime || lastEntry.loadTime,
          timestamp: Date.now()
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.track('core_web_vital_fid', {
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now()
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.track('core_web_vital_cls', {
              value: clsValue,
              timestamp: Date.now()
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }

  /**
   * Flush events to storage/server
   */
  private flushEvents(): void {
    if (this.events.length === 0) return;

    try {
      // In production, send to analytics server
      if (import.meta.env.PROD) {
        this.sendToServer(this.events);
      } else {
        // In development, store in localStorage for debugging
        this.storeLocally(this.events);
      }

      this.events = [];
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
    }
  }

  /**
   * Send events to analytics server
   */
  private sendToServer(events: AnalyticsEvent[]): void {
    // Implement actual server call
    // Example:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events })
    // }).catch(error => console.error('Analytics send failed:', error));
    
    console.log('Analytics events:', events);
  }

  /**
   * Store events locally (for development)
   */
  private storeLocally(events: AnalyticsEvent[]): void {
    try {
      const existing = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const updated = [...existing, ...events];
      localStorage.setItem('analytics_events', JSON.stringify(updated.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Failed to store analytics locally:', error);
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(): UserSession {
    const booksViewed = this.events
      .filter(e => e.eventName === 'book_view')
      .map(e => e.properties?.bookId)
      .filter(Boolean);

    const booksRead = this.events
      .filter(e => e.eventName === 'book_read_complete')
      .map(e => e.properties?.bookId)
      .filter(Boolean);

    const searchQueries = this.events
      .filter(e => e.eventName === 'search')
      .map(e => e.properties?.query)
      .filter(Boolean);

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      events: this.events,
      booksViewed,
      booksRead,
      searchQueries
    };
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
    
    const summary = this.getSessionSummary();
    console.log('Session ended:', summary);
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('analytics_enabled', enabled.toString());
    } catch (error) {
      console.error('Failed to save analytics preference:', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Auto-end session on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsService.endSession();
  });
}