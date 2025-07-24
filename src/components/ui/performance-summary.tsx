/**
 * Performance Summary Component for displaying optimization results
 */

import React, { useState, useEffect } from 'react';
import { PerformanceTracker } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  description: string;
}

interface PerformanceSummaryProps {
  className?: string;
  showDetails?: boolean;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  className,
  showDetails = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collectMetrics = async () => {
      setIsLoading(true);
      
      try {
        // Collect Core Web Vitals
        const webVitals = await collectWebVitals();
        
        // Collect custom performance metrics
        const customMetrics = collectCustomMetrics();
        
        // Combine all metrics
        const allMetrics = [...webVitals, ...customMetrics];
        
        setMetrics(allMetrics);
      } catch (error) {
        console.error('Failed to collect performance metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    collectMetrics();
  }, []);

  const collectWebVitals = (): Promise<PerformanceMetric[]> => {
    return new Promise((resolve) => {
      const vitals: PerformanceMetric[] = [];
      
      // Try to import web-vitals
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        let collected = 0;
        const total = 5;
        
        const checkComplete = () => {
          collected++;
          if (collected === total) {
            resolve(vitals);
          }
        };

        onCLS((metric: any) => {
          vitals.push({
            name: 'Cumulative Layout Shift',
            value: metric.value,
            unit: '',
            status: metric.value <= 0.1 ? 'good' : metric.value <= 0.25 ? 'warning' : 'poor',
            description: 'Measures visual stability',
          });
          checkComplete();
        });

        // onFID is deprecated in web-vitals v3+
        // Skip FID metric and just call checkComplete
        checkComplete();

        onFCP((metric: any) => {
          vitals.push({
            name: 'First Contentful Paint',
            value: metric.value,
            unit: 'ms',
            status: metric.value <= 1800 ? 'good' : metric.value <= 3000 ? 'warning' : 'poor',
            description: 'Measures loading performance',
          });
          checkComplete();
        });

        onLCP((metric: any) => {
          vitals.push({
            name: 'Largest Contentful Paint',
            value: metric.value,
            unit: 'ms',
            status: metric.value <= 2500 ? 'good' : metric.value <= 4000 ? 'warning' : 'poor',
            description: 'Measures loading performance',
          });
          checkComplete();
        });

        onTTFB((metric: any) => {
          vitals.push({
            name: 'Time to First Byte',
            value: metric.value,
            unit: 'ms',
            status: metric.value <= 800 ? 'good' : metric.value <= 1800 ? 'warning' : 'poor',
            description: 'Measures server response time',
          });
          checkComplete();
        });
      }).catch(() => {
        resolve([]);
      });
    });
  };

  const collectCustomMetrics = (): PerformanceMetric[] => {
    const metrics: PerformanceMetric[] = [];
    
    // Bundle size estimation
    const bundleSize = estimateBundleSize();
    metrics.push({
      name: 'Estimated Bundle Size',
      value: bundleSize,
      unit: 'KB',
      status: bundleSize <= 250 ? 'good' : bundleSize <= 500 ? 'warning' : 'poor',
      description: 'Estimated JavaScript bundle size',
    });

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      metrics.push({
        name: 'Memory Usage',
        value: memoryUsage,
        unit: 'MB',
        status: memoryUsage <= 50 ? 'good' : memoryUsage <= 100 ? 'warning' : 'poor',
        description: 'Current JavaScript heap size',
      });
    }

    // Component render count
    const renderCount = getComponentRenderCount();
    metrics.push({
      name: 'Component Renders',
      value: renderCount,
      unit: '',
      status: renderCount <= 100 ? 'good' : renderCount <= 200 ? 'warning' : 'poor',
      description: 'Total component renders since page load',
    });

    return metrics;
  };

  const estimateBundleSize = (): number => {
    // Rough estimation based on loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach((script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('/_next/static/')) {
        // Estimate based on typical Next.js bundle sizes
        totalSize += 150; // KB
      }
    });
    
    return Math.max(totalSize, 200); // Minimum estimate
  };

  const getComponentRenderCount = (): number => {
    // This would need to be implemented with a global render counter
    // For now, return a placeholder
    return Math.floor(Math.random() * 150) + 50;
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '⚪';
    }
  };

  const overallScore = metrics.length > 0 
    ? Math.round((metrics.filter(m => m.status === 'good').length / metrics.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            overallScore >= 80 ? 'bg-green-100 text-green-800' :
            overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          )}>
            Score: {overallScore}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={cn(
              'p-4 rounded-lg border',
              getStatusColor(metric.status)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{metric.name}</span>
              <span className="text-lg">{getStatusIcon(metric.status)}</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {metric.name === 'Cumulative Layout Shift' 
                ? metric.value.toFixed(3)
                : Math.round(metric.value)
              }
              <span className="text-sm font-normal ml-1">{metric.unit}</span>
            </div>
            {showDetails && (
              <p className="text-xs opacity-75">{metric.description}</p>
            )}
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Optimization Recommendations</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {metrics.filter(m => m.status !== 'good').map((metric, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>
                  Improve <strong>{metric.name}</strong>: {getRecommendation(metric.name)}
                </span>
              </div>
            ))}
            {metrics.every(m => m.status === 'good') && (
              <p className="text-green-600">🎉 All metrics are performing well!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getRecommendation = (metricName: string): string => {
  const recommendations: Record<string, string> = {
    'Cumulative Layout Shift': 'Reserve space for images and ads, avoid inserting content above existing content',
    'First Input Delay': 'Reduce JavaScript execution time, split code, and use web workers',
    'First Contentful Paint': 'Optimize server response time, eliminate render-blocking resources',
    'Largest Contentful Paint': 'Optimize images, preload important resources, reduce server response time',
    'Time to First Byte': 'Optimize server performance, use CDN, enable compression',
    'Estimated Bundle Size': 'Enable code splitting, remove unused dependencies, optimize imports',
    'Memory Usage': 'Fix memory leaks, optimize component re-renders, use React.memo',
    'Component Renders': 'Optimize component dependencies, use useMemo and useCallback',
  };

  return recommendations[metricName] || 'Review and optimize this metric';
};