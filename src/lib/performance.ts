/**
 * Performance optimization utilities for ClassroomHQ
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Code splitting utility for lazy loading components
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn);
}

// Image optimization utilities
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// WebP format detection and fallback
export function getOptimizedImageSrc(src: string, format: 'webp' | 'original' = 'webp'): string {
  if (format === 'webp' && typeof window !== 'undefined') {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (supportsWebP && !src.includes('.webp')) {
      // Convert to WebP if supported and not already WebP
      const extension = src.split('.').pop();
      return src.replace(`.${extension}`, '.webp');
    }
  }
  return src;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Performance monitoring utilities
export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];

  static startMeasure(componentName: string): string {
    const markName = `${componentName}-start`;
    if (typeof performance !== 'undefined') {
      performance.mark(markName);
    }
    return markName;
  }

  static endMeasure(componentName: string, startMark: string): void {
    if (typeof performance !== 'undefined') {
      const endMark = `${componentName}-end`;
      performance.mark(endMark);
      
      try {
        performance.measure(componentName, startMark, endMark);
        const measure = performance.getEntriesByName(componentName)[0];
        
        this.metrics.push({
          componentName,
          renderTime: measure.duration,
          timestamp: Date.now(),
        });

        // Keep only last 100 measurements
        if (this.metrics.length > 100) {
          this.metrics = this.metrics.slice(-100);
        }
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }

  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  static getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / componentMetrics.length;
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory;
  }
  return null;
}

// Bundle size analysis helper
export function logBundleInfo(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component loaded: ${componentName}`);
  }
}