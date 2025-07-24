/**
 * Performance utilities and optimization helpers
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll and resize events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args) => {
      if (throttleRef.current) return;
      
      throttleRef.current = setTimeout(() => {
        callbackRef.current(...args);
        throttleRef.current = undefined;
      }, delay);
    }) as T,
    [delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Performance measurement utilities
export class PerformanceTracker {
  private static measurements: Map<string, number> = new Map();

  static start(label: string) {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      setMemoryInfo((performance as any).memory);
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Bundle size tracking
export function trackBundleSize(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(componentName)) {
          console.log(`📦 ${componentName} bundle loaded: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }
}

// Image optimization utilities
export function getOptimizedImageProps(
  src: string,
  width: number,
  height: number,
  quality: number = 75
) {
  return {
    src,
    width,
    height,
    quality,
    placeholder: 'blur' as const,
    blurDataURL: `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>`
    ).toString('base64')}`,
  };
}

// React.memo comparison functions
export const shallowEqual = (prevProps: any, nextProps: any) => {
  const keys1 = Object.keys(prevProps);
  const keys2 = Object.keys(nextProps);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

export const deepEqual = (prevProps: any, nextProps: any) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

// Component performance wrapper
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    useEffect(() => {
      PerformanceTracker.start(`${componentName}-render`);
      return () => {
        PerformanceTracker.end(`${componentName}-render`);
      };
    });

    return <Component {...props} />;
  }, shallowEqual);
}

import { useState } from 'react';
import React from 'react';