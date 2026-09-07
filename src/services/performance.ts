/**
 * Performance Monitoring Service
 * Tracks app performance metrics and helps identify bottlenecks
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private maxStoredMetrics = 100;
  private isProduction = import.meta.env.PROD;

  /**
   * Start measuring a performance operation
   */
  startMeasure(name: string): number {
    return performance.now();
  }

  /**
   * End measuring a performance operation
   */
  endMeasure(name: string, startTime: number, metadata?: Record<string, any>): void {
    const duration = performance.now() - startTime;
    this.recordMetric(name, duration, metadata);
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics.shift();
    }

    // Log slow operations in development
    if (!this.isProduction && value > 1000) {
      console.warn(`[Performance] Slow operation detected: ${name} took ${value.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get the 95th percentile (eliminates outliers)
   */
  getPercentileMetric(name: string, percentile: number = 95): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    // Monitor First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // FCP not supported
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): Record<string, any> {
    return {
      coreWebVitals: {
        lcp: this.getAverageMetric('LCP'),
        fid: this.getAverageMetric('FID'),
        cls: this.getAverageMetric('CLS'),
        fcp: this.getAverageMetric('FCP')
      },
      customMetrics: {
        bookLoadTime: this.getAverageMetric('book_load'),
        searchTime: this.getAverageMetric('search'),
        renderTime: this.getAverageMetric('render')
      },
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Convenience wrapper for async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performanceService.startMeasure(name);
  try {
    const result = await operation();
    performanceService.endMeasure(name, startTime, metadata);
    return result;
  } catch (error) {
    performanceService.endMeasure(name, startTime, { ...metadata, error: true });
    throw error;
  }
}

// Convenience wrapper for sync operations
export function measureSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performanceService.startMeasure(name);
  try {
    const result = operation();
    performanceService.endMeasure(name, startTime, metadata);
    return result;
  } catch (error) {
    performanceService.endMeasure(name, startTime, { ...metadata, error: true });
    throw error;
  }
}