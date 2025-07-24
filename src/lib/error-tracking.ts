/**
 * Enhanced Error Tracking for UI/UX Components
 * 
 * This module provides specialized error tracking for enhanced UI components,
 * including performance monitoring, component-specific error categorization,
 * and integration with the global error reporting system.
 */

"use client";

import { ErrorInfo } from 'react';
import { errorReporting, ErrorReport } from './error-reporting';

export interface ComponentError {
  componentName: string;
  componentProps?: Record<string, any>;
  errorBoundary?: string;
  renderCount?: number;
  lastRenderTime?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  componentSize: number;
  memoryUsage?: number;
  interactionLatency?: number;
}

export interface EnhancedErrorContext {
  component: ComponentError;
  performance?: PerformanceMetrics;
  userInteraction?: {
    type: 'click' | 'hover' | 'focus' | 'scroll' | 'drag' | 'touch';
    target: string;
    timestamp: number;
  };
  accessibility?: {
    screenReaderActive: boolean;
    keyboardNavigation: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

class EnhancedErrorTracker {
  private componentErrors = new Map<string, ComponentError[]>();
  private performanceMetrics = new Map<string, PerformanceMetrics[]>();
  private errorPatterns = new Map<string, number>();

  /**
   * Track errors specific to enhanced UI components
   */
  public trackComponentError(
    error: Error,
    componentName: string,
    context: Partial<EnhancedErrorContext> = {},
    errorInfo?: ErrorInfo
  ): string {
    const enhancedContext: EnhancedErrorContext = {
      component: {
        componentName,
        ...context.component,
      },
      performance: context.performance,
      userInteraction: context.userInteraction,
      accessibility: this.getAccessibilityContext(),
    };

    // Store component-specific error
    this.storeComponentError(componentName, enhancedContext.component);

    // Track error patterns
    this.trackErrorPattern(error, componentName);

    // Report to global error reporting system
    const errorId = errorReporting.reportError(error, errorInfo, {
      enhancedContext,
      category: 'enhanced-component',
      componentName,
    });

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🎨 Enhanced Component Error: ${componentName}`);
      console.error('Error:', error);
      console.log('Context:', enhancedContext);
      console.groupEnd();
    }

    return errorId;
  }

  /**
   * Track performance issues in enhanced components
   */
  public trackPerformanceIssue(
    componentName: string,
    metrics: PerformanceMetrics,
    threshold: { renderTime?: number; memoryUsage?: number } = {}
  ): void {
    this.storePerformanceMetrics(componentName, metrics);

    // Check if performance exceeds thresholds
    const issues: string[] = [];
    
    if (threshold.renderTime && metrics.renderTime > threshold.renderTime) {
      issues.push(`Slow render: ${metrics.renderTime}ms (threshold: ${threshold.renderTime}ms)`);
    }
    
    if (threshold.memoryUsage && metrics.memoryUsage && metrics.memoryUsage > threshold.memoryUsage) {
      issues.push(`High memory usage: ${metrics.memoryUsage}MB (threshold: ${threshold.memoryUsage}MB)`);
    }

    if (issues.length > 0) {
      const error = new Error(`Performance issues in ${componentName}: ${issues.join(', ')}`);
      this.trackComponentError(error, componentName, { performance: metrics });
    }
  }

  /**
   * Track accessibility-related errors
   */
  public trackAccessibilityError(
    error: Error,
    componentName: string,
    accessibilityContext: {
      violationType: 'contrast' | 'keyboard' | 'screenReader' | 'focus' | 'aria';
      element?: string;
      expectedValue?: string;
      actualValue?: string;
    }
  ): string {
    return this.trackComponentError(error, componentName, {
      component: { componentName },
      accessibility: {
        ...this.getAccessibilityContext(),
        violationType: accessibilityContext.violationType,
        element: accessibilityContext.element,
        expectedValue: accessibilityContext.expectedValue,
        actualValue: accessibilityContext.actualValue,
      } as any,
    });
  }

  /**
   * Track animation and motion-related errors
   */
  public trackAnimationError(
    error: Error,
    componentName: string,
    animationContext: {
      animationType: string;
      duration?: number;
      easing?: string;
      reducedMotionPreference?: boolean;
    }
  ): string {
    return this.trackComponentError(error, componentName, {
      component: { componentName },
      animation: animationContext,
    } as any);
  }

  /**
   * Get error statistics for a specific component
   */
  public getComponentErrorStats(componentName: string): {
    totalErrors: number;
    errorTypes: Record<string, number>;
    averageRenderTime?: number;
    lastError?: Date;
  } {
    const errors = this.componentErrors.get(componentName) || [];
    const metrics = this.performanceMetrics.get(componentName) || [];
    
    const errorTypes: Record<string, number> = {};
    errors.forEach(error => {
      const key = error.componentName;
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });

    const averageRenderTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length
      : undefined;

    return {
      totalErrors: errors.length,
      errorTypes,
      averageRenderTime,
      lastError: errors.length > 0 ? new Date() : undefined,
    };
  }

  /**
   * Get overall error patterns across all enhanced components
   */
  public getErrorPatterns(): Array<{
    pattern: string;
    count: number;
    components: string[];
  }> {
    const patterns: Array<{
      pattern: string;
      count: number;
      components: string[];
    }> = [];

    this.errorPatterns.forEach((count, pattern) => {
      const components = Array.from(this.componentErrors.keys()).filter(
        componentName => {
          const errors = this.componentErrors.get(componentName) || [];
          return errors.some(error => 
            pattern.includes(error.componentName) || 
            error.componentName.includes(pattern)
          );
        }
      );

      patterns.push({ pattern, count, components });
    });

    return patterns.sort((a, b) => b.count - a.count);
  }

  /**
   * Clear error tracking data
   */
  public clearTrackingData(): void {
    this.componentErrors.clear();
    this.performanceMetrics.clear();
    this.errorPatterns.clear();
  }

  private storeComponentError(componentName: string, error: ComponentError): void {
    const errors = this.componentErrors.get(componentName) || [];
    errors.push(error);
    
    // Keep only the last 20 errors per component
    if (errors.length > 20) {
      errors.splice(0, errors.length - 20);
    }
    
    this.componentErrors.set(componentName, errors);
  }

  private storePerformanceMetrics(componentName: string, metrics: PerformanceMetrics): void {
    const allMetrics = this.performanceMetrics.get(componentName) || [];
    allMetrics.push(metrics);
    
    // Keep only the last 50 metrics per component
    if (allMetrics.length > 50) {
      allMetrics.splice(0, allMetrics.length - 50);
    }
    
    this.performanceMetrics.set(componentName, allMetrics);
  }

  private trackErrorPattern(error: Error, componentName: string): void {
    const pattern = `${componentName}:${error.name}`;
    const count = this.errorPatterns.get(pattern) || 0;
    this.errorPatterns.set(pattern, count + 1);
  }

  private getAccessibilityContext(): EnhancedErrorContext['accessibility'] {
    return {
      screenReaderActive: this.isScreenReaderActive(),
      keyboardNavigation: this.isKeyboardNavigation(),
      reducedMotion: this.hasReducedMotionPreference(),
      highContrast: this.hasHighContrastPreference(),
    };
  }

  private isScreenReaderActive(): boolean {
    // Check for common screen reader indicators
    return !!(
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      (window as any).speechSynthesis?.speaking
    );
  }

  private isKeyboardNavigation(): boolean {
    // This would be set by keyboard navigation detection
    return document.body.classList.contains('keyboard-navigation');
  }

  private hasReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private hasHighContrastPreference(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }
}

// Singleton instance
export const enhancedErrorTracker = new EnhancedErrorTracker();

// Convenience functions for common use cases
export function trackComponentError(
  error: Error,
  componentName: string,
  context?: Partial<EnhancedErrorContext>,
  errorInfo?: ErrorInfo
): string {
  return enhancedErrorTracker.trackComponentError(error, componentName, context, errorInfo);
}

export function trackPerformanceIssue(
  componentName: string,
  metrics: PerformanceMetrics,
  threshold?: { renderTime?: number; memoryUsage?: number }
): void {
  enhancedErrorTracker.trackPerformanceIssue(componentName, metrics, threshold);
}

export function trackAccessibilityError(
  error: Error,
  componentName: string,
  context: {
    violationType: 'contrast' | 'keyboard' | 'screenReader' | 'focus' | 'aria';
    element?: string;
    expectedValue?: string;
    actualValue?: string;
  }
): string {
  return enhancedErrorTracker.trackAccessibilityError(error, componentName, context);
}

export function trackAnimationError(
  error: Error,
  componentName: string,
  context: {
    animationType: string;
    duration?: number;
    easing?: string;
    reducedMotionPreference?: boolean;
  }
): string {
  return enhancedErrorTracker.trackAnimationError(error, componentName, context);
}

// React Hook for component error tracking
export function useComponentErrorTracking(componentName: string) {
  const trackError = (error: Error, context?: Partial<EnhancedErrorContext>) => {
    return trackComponentError(error, componentName, context);
  };

  const trackPerformance = (metrics: PerformanceMetrics, threshold?: { renderTime?: number; memoryUsage?: number }) => {
    trackPerformanceIssue(componentName, metrics, threshold);
  };

  const getStats = () => {
    return enhancedErrorTracker.getComponentErrorStats(componentName);
  };

  return {
    trackError,
    trackPerformance,
    getStats,
  };
}