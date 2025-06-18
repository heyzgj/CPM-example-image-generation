// Advanced Performance Monitoring & Web Vitals Tracking

import React from 'react';
import type { Metric } from 'web-vitals';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay  
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number;
  imageTransformTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
  timestamp: number;
  route: string;
}

/**
 * Performance thresholds for monitoring
 */
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  pageLoadTime: { good: 3000, needsImprovement: 5000 },
  imageTransformTime: { good: 5000, needsImprovement: 10000 },
} as const;

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring() {
    this.isMonitoring = true;
    this.setupWebVitalsTracking();
    this.setupNavigationTiming();
    this.setupMemoryMonitoring();
    this.setupLongTaskMonitoring();
  }

  /**
   * Setup Web Vitals tracking using web-vitals library
   */
  private setupWebVitalsTracking() {
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const reportMetric = (metric: Metric) => {
        this.recordMetric({
          [metric.name]: metric.value,
          timestamp: Date.now(),
          route: window.location.pathname,
        });

        // Log performance issues
        this.analyzeMetric(metric);
      };

      onCLS(reportMetric);
      onINP(reportMetric); // Updated from FID to INP (new Core Web Vital)
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
    }).catch(err => {
      console.warn('Web Vitals library not available:', err);
    });
  }

  /**
   * Setup navigation timing monitoring
   */
  private setupNavigationTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.recordMetric({
            pageLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            timestamp: Date.now(),
            route: window.location.pathname,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  /**
   * Setup memory usage monitoring
   */
  private setupMemoryMonitoring() {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memInfo = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      
      if (memInfo) {
        this.recordMetric({
          memoryUsage: memInfo.usedJSHeapSize,
          timestamp: Date.now(),
          route: window.location.pathname,
        });
      }
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  /**
   * Setup long task monitoring
   */
  private setupLongTaskMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${entry.duration}ms`, entry);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
          } catch {
      // longtask might not be supported
      console.warn('Long task monitoring not supported');
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: Partial<PerformanceMetrics>) {
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }
    if (!metric.route) {
      metric.route = typeof window !== 'undefined' ? window.location.pathname : '/';
    }

    this.metrics.push(metric as PerformanceMetrics);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Analyze a metric against thresholds
   */
  private analyzeMetric(metric: Metric) {
    const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!threshold) return;

    let status: 'good' | 'needs-improvement' | 'poor';
    
    if (metric.value <= threshold.good) {
      status = 'good';
    } else if (metric.value <= threshold.needsImprovement) {
      status = 'needs-improvement';
    } else {
      status = 'poor';
    }

    if (status !== 'good' && process.env.NODE_ENV === 'development') {
      console.warn(`Performance issue: ${metric.name} = ${metric.value} (${status})`);
    }

    // Could send to analytics service here
    this.reportToAnalytics(metric, status);
  }

  /**
   * Report metrics to analytics (placeholder)
   */
  private reportToAnalytics(metric: Metric, status: string) {
    // Placeholder for analytics reporting
    if (process.env.NODE_ENV === 'production') {
      // In production, you'd send to your analytics service
      // Example: analytics.track('performance_metric', { ...metric, status });
      console.debug('Analytics:', { metric: metric.name, value: metric.value, status });
    }
  }

  /**
   * Track custom performance metric
   */
  public trackCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    this.recordMetric({
      [name]: value,
      timestamp: Date.now(),
      route: typeof window !== 'undefined' ? window.location.pathname : '/',
      ...metadata,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`Custom metric: ${name} = ${value}ms`);
    }
  }

  /**
   * Start timing an operation
   */
  public startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(label, duration);
      return duration;
    };
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    averages: Record<string, number>;
    latest: PerformanceMetrics | null;
    issues: Array<{ metric: string; value: number; threshold: number }>;
  } {
    if (this.metrics.length === 0) {
      return { averages: {}, latest: null, issues: [] };
    }

    // Calculate averages
    const averages: Record<string, number> = {};
    const metricKeys = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'pageLoadTime', 'imageTransformTime', 'memoryUsage'];
    
    metricKeys.forEach(key => {
      const values = this.metrics
        .map(m => m[key as keyof PerformanceMetrics])
        .filter(v => typeof v === 'number') as number[];
      
      if (values.length > 0) {
        averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    // Identify performance issues
    const issues: Array<{ metric: string; value: number; threshold: number }> = [];
    const latest = this.metrics[this.metrics.length - 1];
    
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, threshold]) => {
      const value = latest?.[metric as keyof PerformanceMetrics] as number;
      if (value && value > threshold.needsImprovement) {
        issues.push({ metric, value, threshold: threshold.needsImprovement });
      }
    });

    return { averages, latest, issues };
  }

  /**
   * Cleanup observers
   */
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Get the global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const monitor = getPerformanceMonitor();

  const trackImageTransform = (startTime: number) => {
    const duration = performance.now() - startTime;
    monitor.trackCustomMetric('imageTransformTime', duration);
    return duration;
  };

  const startImageTransform = () => performance.now();

  const trackPageLoad = () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        monitor.trackCustomMetric('pageLoadTime', loadTime);
      }
    }
  };

  return {
    monitor,
    trackImageTransform,
    startImageTransform,
    trackPageLoad,
    startTiming: monitor.startTiming.bind(monitor),
    trackCustomMetric: monitor.trackCustomMetric.bind(monitor),
    getPerformanceSummary: monitor.getPerformanceSummary.bind(monitor),
  };
}

/**
 * HOC for automatic performance tracking
 */
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  const PerformanceTrackedComponent = (props: T) => {
    const monitor = getPerformanceMonitor();
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        monitor.trackCustomMetric(`${componentName}_renderTime`, renderTime);
      };
    }, [monitor]);

    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return PerformanceTrackedComponent;
} 