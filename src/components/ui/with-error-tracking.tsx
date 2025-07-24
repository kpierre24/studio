"use client";

import React, { Component, ErrorInfo, ComponentType, forwardRef } from 'react';
import { trackComponentError, trackPerformanceIssue, PerformanceMetrics } from '@/lib/error-tracking';

interface WithErrorTrackingOptions {
  componentName?: string;
  trackPerformance?: boolean;
  performanceThresholds?: {
    renderTime?: number;
    memoryUsage?: number;
  };
  logErrors?: boolean;
}

interface ErrorTrackingState {
  hasError: boolean;
  error: Error | null;
  renderCount: number;
  lastRenderTime: number;
}

/**
 * Higher-order component that adds error tracking to enhanced UI components
 */
export function withErrorTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorTrackingOptions = {}
) {
  const {
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent',
    trackPerformance = true,
    performanceThresholds = { renderTime: 100, memoryUsage: 50 },
    logErrors = process.env.NODE_ENV === 'development',
  } = options;

  class ErrorTrackingWrapper extends Component<P, ErrorTrackingState> {
    private renderStartTime: number = 0;
    private componentRef = React.createRef<any>();

    constructor(props: P) {
      super(props);
      this.state = {
        hasError: false,
        error: null,
        renderCount: 0,
        lastRenderTime: 0,
      };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorTrackingState> {
      return {
        hasError: true,
        error,
      };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      // Track the error with enhanced context
      trackComponentError(error, componentName, {
        component: {
          componentName,
          componentProps: this.props as Record<string, any>,
          renderCount: this.state.renderCount,
          lastRenderTime: this.state.lastRenderTime,
        },
      }, errorInfo);

      if (logErrors) {
        console.error(`Error in ${componentName}:`, error, errorInfo);
      }
    }

    componentDidMount() {
      this.trackRenderPerformance();
    }

    componentDidUpdate() {
      this.trackRenderPerformance();
    }

    private trackRenderPerformance = () => {
      if (!trackPerformance) return;

      const renderTime = performance.now() - this.renderStartTime;
      const componentSize = this.getComponentSize();
      
      const metrics: PerformanceMetrics = {
        renderTime,
        componentSize,
        memoryUsage: this.getMemoryUsage(),
      };

      // Track performance metrics
      trackPerformanceIssue(componentName, metrics, performanceThresholds);

      this.setState(prevState => ({
        renderCount: prevState.renderCount + 1,
        lastRenderTime: renderTime,
      }));
    };

    private getComponentSize = (): number => {
      if (this.componentRef.current) {
        const element = this.componentRef.current;
        if (element instanceof HTMLElement) {
          return element.offsetHeight * element.offsetWidth;
        }
      }
      return 0;
    };

    private getMemoryUsage = (): number | undefined => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
      return undefined;
    };

    render() {
      this.renderStartTime = performance.now();

      if (this.state.hasError) {
        // Return a fallback UI or re-throw the error
        return (
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <p className="text-sm text-destructive">
              Error in {componentName}. Please try refreshing the page.
            </p>
          </div>
        );
      }

      return <WrappedComponent {...this.props} ref={this.componentRef} />;
    }
  }

  (ErrorTrackingWrapper as any).displayName = `withErrorTracking(${componentName})`;

  return ErrorTrackingWrapper;
}

/**
 * Hook version for functional components
 */
export function useErrorTracking(componentName: string, options: WithErrorTrackingOptions = {}) {
  const {
    trackPerformance = true,
    performanceThresholds = { renderTime: 100, memoryUsage: 50 },
  } = options;

  const [renderCount, setRenderCount] = React.useState(0);
  const renderStartTime = React.useRef(performance.now());

  React.useEffect(() => {
    if (!trackPerformance) return;

    const renderTime = performance.now() - renderStartTime.current;
    const metrics: PerformanceMetrics = {
      renderTime,
      componentSize: 0, // Would need element ref to calculate
      memoryUsage: getMemoryUsage(),
    };

    trackPerformanceIssue(componentName, metrics, performanceThresholds);
    setRenderCount(prev => prev + 1);
  });

  const trackError = React.useCallback((error: Error, context?: any) => {
    trackComponentError(error, componentName, {
      component: {
        componentName,
        renderCount,
        lastRenderTime: performance.now() - renderStartTime.current,
        ...context,
      },
    });
  }, [componentName, renderCount]);

  return { trackError, renderCount };
}

function getMemoryUsage(): number | undefined {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / (1024 * 1024);
  }
  return undefined;
}

/**
 * Decorator for class components
 */
export function ErrorTracked(options: WithErrorTrackingOptions = {}) {
  return function <T extends ComponentType<any>>(target: T): T {
    return withErrorTracking(target, options) as any;
  };
}