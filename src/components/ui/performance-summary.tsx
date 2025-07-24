'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { PerformanceMonitor, getMemoryUsage } from '@/lib/performance';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceSummaryProps {
  showInProduction?: boolean;
  className?: string;
}

interface PerformanceStats {
  totalComponents: number;
  averageRenderTime: number;
  slowestComponent: { name: string; time: number } | null;
  fastestComponent: { name: string; time: number } | null;
  memoryUsage: MemoryInfo | null;
  recommendations: string[];
}

const PerformanceSummaryComponent: React.FC<PerformanceSummaryProps> = ({
  showInProduction = false,
  className
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    totalComponents: 0,
    averageRenderTime: 0,
    slowestComponent: null,
    fastestComponent: null,
    memoryUsage: null,
    recommendations: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && !showInProduction) {
      return;
    }

    const updateStats = () => {
      const metrics = PerformanceMonitor.getMetrics();
      const memoryInfo = getMemoryUsage();

      if (metrics.length === 0) {
        return;
      }

      // Calculate component statistics
      const componentStats = metrics.reduce((acc, metric) => {
        if (!acc[metric.componentName]) {
          acc[metric.componentName] = {
            count: 0,
            totalTime: 0,
            avgTime: 0,
          };
        }
        
        acc[metric.componentName].count++;
        acc[metric.componentName].totalTime += metric.renderTime;
        acc[metric.componentName].avgTime = acc[metric.componentName].totalTime / acc[metric.componentName].count;
        
        return acc;
      }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

      const componentEntries = Object.entries(componentStats);
      const totalComponents = componentEntries.length;
      const averageRenderTime = componentEntries.reduce((sum, [, stats]) => sum + stats.avgTime, 0) / totalComponents;

      // Find slowest and fastest components
      const sortedByTime = componentEntries.sort(([, a], [, b]) => b.avgTime - a.avgTime);
      const slowestComponent = sortedByTime[0] ? { name: sortedByTime[0][0], time: sortedByTime[0][1].avgTime } : null;
      const fastestComponent = sortedByTime[sortedByTime.length - 1] ? { 
        name: sortedByTime[sortedByTime.length - 1][0], 
        time: sortedByTime[sortedByTime.length - 1][1].avgTime 
      } : null;

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (averageRenderTime > 16) {
        recommendations.push('Consider optimizing components with React.memo');
      }
      
      if (slowestComponent && slowestComponent.time > 50) {
        recommendations.push(`${slowestComponent.name} is rendering slowly (${slowestComponent.time.toFixed(2)}ms)`);
      }
      
      if (memoryInfo && memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
        recommendations.push('Memory usage is high, consider implementing virtualization');
      }
      
      if (totalComponents > 50) {
        recommendations.push('Consider code splitting for better performance');
      }

      setStats({
        totalComponents,
        averageRenderTime,
        slowestComponent,
        fastestComponent,
        memoryUsage: memoryInfo,
        recommendations
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [showInProduction]);

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getPerformanceStatus = () => {
    if (stats.averageRenderTime < 8) return { status: 'excellent', color: 'green' };
    if (stats.averageRenderTime < 16) return { status: 'good', color: 'blue' };
    if (stats.averageRenderTime < 32) return { status: 'fair', color: 'yellow' };
    return { status: 'poor', color: 'red' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-3 bg-black/80 text-white rounded-full shadow-lg hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Activity className="w-5 h-5" />
      </motion.button>

      {/* Performance panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 20,
          scale: isVisible ? 1 : 0.9
        }}
        className={cn(
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto',
          !isVisible && 'pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Performance Monitor</h3>
          <Badge 
            variant={performanceStatus.color === 'green' ? 'default' : 'secondary'}
            className={cn(
              performanceStatus.color === 'green' && 'bg-green-100 text-green-800',
              performanceStatus.color === 'blue' && 'bg-blue-100 text-blue-800',
              performanceStatus.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
              performanceStatus.color === 'red' && 'bg-red-100 text-red-800'
            )}
          >
            {performanceStatus.status}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Render Performance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Render Performance</span>
            </div>
            <div className="pl-6 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Components:</span>
                <span className="font-medium">{stats.totalComponents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Render:</span>
                <span className="font-medium">{stats.averageRenderTime.toFixed(2)}ms</span>
              </div>
              {stats.slowestComponent && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Slowest:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {stats.slowestComponent.name} ({stats.slowestComponent.time.toFixed(2)}ms)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Memory Usage */}
          {stats.memoryUsage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div className="pl-6 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="font-medium">{formatBytes(stats.memoryUsage.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{formatBytes(stats.memoryUsage.totalJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Limit:</span>
                  <span className="font-medium">{formatBytes(stats.memoryUsage.jsHeapSizeLimit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {stats.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Recommendations</span>
              </div>
              <div className="pl-6 space-y-1">
                {stats.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Quick Tips</span>
            </div>
            <div className="pl-6 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use React.memo for expensive components</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Implement virtualization for large lists</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use lazy loading for heavy components</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const PerformanceSummary = memo(PerformanceSummaryComponent);