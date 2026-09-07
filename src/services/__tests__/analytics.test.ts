import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyticsService } from '../analytics.ts';

describe('AnalyticsService', () => {
  beforeEach(() => {
    // Reset analytics service state
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should track events correctly', () => {
    const eventSpy = vi.spyOn(analyticsService as any, 'flushEvents').mockImplementation(() => {});
    
    analyticsService.track('test_event', { testProp: 'testValue' });
    
    expect(eventSpy).toHaveBeenCalled();
  });

  it('should track page views', () => {
    const trackSpy = vi.spyOn(analyticsService, 'track').mockImplementation(() => {});
    
    analyticsService.trackPageView('/test-page');
    
    expect(trackSpy).toHaveBeenCalledWith('page_view', expect.objectContaining({
      page: '/test-page'
    }));
  });

  it('should track book views', () => {
    const trackSpy = vi.spyOn(analyticsService, 'track').mockImplementation(() => {});
    
    analyticsService.trackBookView('book123', 'Test Book', 'Test Author', 'Test Source');
    
    expect(trackSpy).toHaveBeenCalledWith('book_view', expect.objectContaining({
      bookId: 'book123',
      bookTitle: 'Test Book',
      author: 'Test Author',
      source: 'Test Source'
    }));
  });

  it('should track search queries', () => {
    const trackSpy = vi.spyOn(analyticsService, 'track').mockImplementation(() => {});
    
    analyticsService.trackSearch('test query', 10, { category: 'fiction' });
    
    expect(trackSpy).toHaveBeenCalledWith('search', expect.objectContaining({
      query: 'test query',
      resultCount: 10,
      filters: { category: 'fiction' }
    }));
  });

  it('should track errors', () => {
    const trackSpy = vi.spyOn(analyticsService, 'track').mockImplementation(() => {});
    const testError = new Error('Test error');
    
    analyticsService.trackError(testError, { context: 'test' });
    
    expect(trackSpy).toHaveBeenCalledWith('error', expect.objectContaining({
      message: 'Test error',
      context: { context: 'test' }
    }));
  });

  it('should provide session summary', () => {
    analyticsService.track('test_event', { bookId: 'book1' });
    analyticsService.track('book_view', { bookId: 'book2' });
    analyticsService.track('search', { query: 'test' });
    
    const summary = analyticsService.getSessionSummary();
    
    expect(summary.sessionId).toBeDefined();
    expect(summary.events.length).toBeGreaterThan(0);
    expect(summary.booksViewed).toContain('book2');
    expect(summary.searchQueries).toContain('test');
  });

  it('should enable/disable analytics', () => {
    const initialState = analyticsService.getEnabled();
    
    analyticsService.setEnabled(false);
    expect(analyticsService.getEnabled()).toBe(false);
    
    analyticsService.setEnabled(true);
    expect(analyticsService.getEnabled()).toBe(true);
  });
});