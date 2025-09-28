// Performance monitoring utilities
export const performanceMetrics = {
  // Measure page load time
  measurePageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
      };
    }
    return null;
  },

  // Measure API response times
  measureApiCall: async <T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow API calls (>1000ms)
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`API call failed: ${endpoint} took ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Monitor database query performance
  logQueryPerformance: (queryName: string, duration: number, cacheHit: boolean = false) => {
    const logLevel = duration > 500 ? 'warn' : 'info';
    console[logLevel](`DB Query: ${queryName} - ${duration}ms ${cacheHit ? '(cached)' : '(db)'}`);
  },
};

// Web Vitals monitoring
export const initWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Monitor Core Web Vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log);
      onINP(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    });
  }
};
