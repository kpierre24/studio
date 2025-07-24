'use client';

import React, { ComponentType, useEffect, useRef, memo } from 'react';
import { PerformanceMonitor } from '@/lib/performance';

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const PerformanceMonitoredComponent: React.FC<P> = (props) => {
    const startMarkRef = useRef<string>();

    useEffect(() => {
      // Start measuring on mount
      startMarkRef.current = PerformanceMonitor.startMeasure(displayName);

      return () => {
        // End measuring on unmount
        if (startMarkRef.current) {
          PerformanceMonitor.endMeasure(displayName, startMarkRef.current);
        }
      };
    }, []);

    // Measure render time
    useEffect(() => {
      if (startMarkRef.current) {
        PerformanceMonitor.endMeasure(displayName, startMarkRef.current);
        startMarkRef.current = PerformanceMonitor.startMeasure(displayName);
      }
    });

    return <WrappedComponent {...props} />;
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;

  return PerformanceMonitoredComponent;
}

// Performance metrics display component
interface PerformanceMetricsProps {
  showInProduction?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = memo(({ 
  showInProduction = false 
}) => {
  const [metrics, setMetrics] = React.useState(PerformanceMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(PerformanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const componentStats = metrics.reduce((acc, metric) => {
    if (!acc[metric.componentName]) {
      acc[metric.componentName] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        lastRender: 0,
      };
    }
    
    acc[metric.componentName].count++;
    acc[metric.componentName].totalTime += metric.renderTime;
    acc[metric.componentName].avgTime = acc[metric.componentName].totalTime / acc[metric.componentName].count;
    acc[metric.componentName].lastRender = Math.max(acc[metric.componentName].lastRender, metric.timestamp);
    
    return acc;
  }, {} as Record<string, { count: number; totalTime: number; avgTime: number; lastRender: number }>);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md max-h-64 overflow-auto z-50">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        {Object.entries(componentStats)
          .sort(([, a], [, b]) => b.avgTime - a.avgTime)
          .slice(0, 10)
          .map(([name, stats]) => (
            <div key={name} className="flex justify-between">
              <span className="truncate mr-2">{name}</span>
              <span>{stats.avgTime.toFixed(2)}ms</span>
            </div>
          ))}
      </div>
    </div>
  );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';

// Memory usage monitor
export const MemoryMonitor: React.FC<{ showInProduction?: boolean }> = memo(({ 
  showInProduction = false 
}) => {
  const [memoryInfo, setMemoryInfo] = React.useState<MemoryInfo | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!memoryInfo) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Memory Usage</h3>
      <div className="space-y-1">
        <div>Used: {formatBytes(memoryInfo.usedJSHeapSize)}</div>
        <div>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</div>
        <div>Limit: {formatBytes(memoryInfo.jsHeapSizeLimit)}</div>
      </div>
    </div>
  );
});

MemoryMonitor.displayName = 'MemoryMonitor';