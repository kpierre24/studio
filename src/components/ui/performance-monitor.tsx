/**
 * Performance Monitor Component for development and debugging
 */

import React, { useState, useEffect } from 'react';
import { useMemoryMonitor, PerformanceTracker } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface PerformanceMonitorProps {
  className?: string;
  showMemory?: boolean;
  showFPS?: boolean;
  showBundleSize?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showMemory = true,
  showFPS = true,
  showBundleSize = false,
  position = 'top-right',
}) => {
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const memoryInfo = useMemoryMonitor();

  // FPS monitoring
  useEffect(() => {
    if (!showFPS) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [showFPS]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={cn(
        'fixed z-50 bg-black/80 text-white text-xs rounded-lg p-3 font-mono',
        'backdrop-blur-sm border border-white/20',
        'transition-all duration-200',
        isVisible ? 'opacity-100' : 'opacity-60 hover:opacity-100',
        positionClasses[position],
        className
      )}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">⚡ Performance</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-white/60 hover:text-white"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-2 min-w-[200px]">
          {showFPS && (
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={cn(
                fps >= 50 ? 'text-green-400' : 
                fps >= 30 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {fps}
              </span>
            </div>
          )}

          {showMemory && memoryInfo && (
            <>
              <div className="flex justify-between">
                <span>Used:</span>
                <span>{formatBytes(memoryInfo.usedJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{formatBytes(memoryInfo.totalJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Limit:</span>
                <span>{formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) > 0.8
                      ? 'bg-red-500'
                      : (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) > 0.6
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  )}
                  style={{
                    width: `${(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100}%`
                  }}
                />
              </div>
            </>
          )}

          {showBundleSize && (
            <div className="border-t border-white/20 pt-2">
              <div className="text-white/60 mb-1">Bundle Info:</div>
              <div className="text-xs space-y-1">
                <div>Check console for details</div>
              </div>
            </div>
          )}

          <div className="border-t border-white/20 pt-2">
            <div className="text-white/60 mb-1">Core Web Vitals:</div>
            <WebVitalsDisplay />
          </div>
        </div>
      )}
    </div>
  );
};

// Web Vitals monitoring component
const WebVitalsDisplay: React.FC = () => {
  const [vitals, setVitals] = useState<{
    CLS?: number;
    FID?: number;
    FCP?: number;
    LCP?: number;
    TTFB?: number;
  }>({});

  useEffect(() => {
    // Import web-vitals dynamically to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
      onCLS((metric: any) => setVitals(prev => ({ ...prev, CLS: metric.value })));
      // onFID is deprecated in web-vitals v3+
      // onFID((metric: any) => setVitals(prev => ({ ...prev, FID: metric.value })));
      onFCP((metric: any) => setVitals(prev => ({ ...prev, FCP: metric.value })));
      onLCP((metric: any) => setVitals(prev => ({ ...prev, LCP: metric.value })));
      onTTFB((metric: any) => setVitals(prev => ({ ...prev, TTFB: metric.value })));
    }).catch(() => {
      // web-vitals not available
    });
  }, []);

  const getVitalColor = (metric: string, value: number) => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-400';

    if (value <= threshold.good) return 'text-green-400';
    if (value <= threshold.poor) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="text-xs space-y-1">
      {Object.entries(vitals).map(([metric, value]) => (
        <div key={metric} className="flex justify-between">
          <span>{metric}:</span>
          <span className={getVitalColor(metric, value)}>
            {metric === 'CLS' ? value.toFixed(3) : Math.round(value)}
            {metric !== 'CLS' && 'ms'}
          </span>
        </div>
      ))}
    </div>
  );
};

// Performance summary component for production insights
export const PerformanceSummary: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    interactionTime: number;
  } | null>(null);

  useEffect(() => {
    // Collect performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        interactionTime: navigation.domInteractive - navigation.fetchStart,
      });
    }
  }, []);

  if (!metrics) return null;

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4', className)}>
      <h3 className="font-semibold text-gray-900 mb-3">Performance Summary</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(metrics.loadTime)}ms
          </div>
          <div className="text-gray-600">Load Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(metrics.renderTime)}ms
          </div>
          <div className="text-gray-600">Render Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(metrics.interactionTime)}ms
          </div>
          <div className="text-gray-600">Interactive</div>
        </div>
      </div>
    </div>
  );
};