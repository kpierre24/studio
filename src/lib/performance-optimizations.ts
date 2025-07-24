/**
 * Performance Optimizations Index
 * 
 * This file exports all performance-optimized components and utilities
 * for the ClassroomHQ UI/UX enhancements.
 */

// Performance utilities
export {
  createLazyComponent,
  getOptimizedImageSrc,
  createIntersectionObserver,
  PerformanceMonitor,
  debounce,
  throttle,
  getMemoryUsage,
  logBundleInfo,
  type OptimizedImageProps,
  type PerformanceMetrics
} from './performance';

// Optimized image component
export { OptimizedImage } from '@/components/ui/optimized-image';

// Virtualization components
export { VirtualizedList, VirtualizedTable } from '@/components/ui/virtualized-list';

// Performance monitoring components
export { 
  withPerformanceMonitoring,
  PerformanceMetrics,
  MemoryMonitor
} from '@/components/ui/performance-monitor';

export { PerformanceSummary } from '@/components/ui/performance-summary';

// Lazy-loaded components
export * from '@/components/lazy';

// Performance optimization recommendations
export const PERFORMANCE_RECOMMENDATIONS = {
  // Component optimization
  MEMO_THRESHOLD: 16, // ms - components slower than this should use React.memo
  VIRTUALIZATION_THRESHOLD: 100, // items - lists longer than this should use virtualization
  LAZY_LOADING_THRESHOLD: 50, // KB - components larger than this should be lazy loaded
  
  // Memory optimization
  MEMORY_WARNING_THRESHOLD: 0.8, // 80% of heap limit
  MEMORY_CRITICAL_THRESHOLD: 0.9, // 90% of heap limit
  
  // Bundle optimization
  CHUNK_SIZE_LIMIT: 244 * 1024, // 244KB - recommended chunk size limit
  VENDOR_CHUNK_LIMIT: 500 * 1024, // 500KB - vendor chunk size limit
  
  // Image optimization
  IMAGE_FORMATS: ['webp', 'avif', 'jpeg', 'png'],
  IMAGE_SIZES: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024, 1280, 1920],
  LAZY_LOADING_MARGIN: '50px',
  
  // Animation optimization
  ANIMATION_DURATION_LIMIT: 300, // ms - animations longer than this may feel slow
  REDUCED_MOTION_FALLBACK: true,
  
  // Network optimization
  PREFETCH_PRIORITY_ROUTES: ['/dashboard', '/courses', '/assignments'],
  PRELOAD_CRITICAL_RESOURCES: ['fonts', 'critical-css'],
};

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  // Enable performance monitoring in development
  ENABLE_IN_DEVELOPMENT: true,
  
  // Enable performance monitoring in production (with user consent)
  ENABLE_IN_PRODUCTION: false,
  
  // Metrics collection interval
  METRICS_INTERVAL: 2000, // ms
  
  // Maximum number of metrics to store
  MAX_METRICS_HISTORY: 100,
  
  // Performance budget thresholds
  BUDGETS: {
    // Core Web Vitals
    LCP: 2500, // ms - Largest Contentful Paint
    FID: 100,  // ms - First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    
    // Custom metrics
    TTI: 3800, // ms - Time to Interactive
    FCP: 1800, // ms - First Contentful Paint
    
    // Bundle size budgets
    MAIN_BUNDLE: 200 * 1024,    // 200KB
    VENDOR_BUNDLE: 500 * 1024,  // 500KB
    TOTAL_BUNDLE: 1024 * 1024,  // 1MB
  },
  
  // Component performance thresholds
  COMPONENT_THRESHOLDS: {
    RENDER_TIME_WARNING: 16,  // ms
    RENDER_TIME_ERROR: 50,    // ms
    MEMORY_USAGE_WARNING: 10 * 1024 * 1024, // 10MB
    MEMORY_USAGE_ERROR: 50 * 1024 * 1024,   // 50MB
  }
};

// Performance optimization checklist
export const OPTIMIZATION_CHECKLIST = [
  {
    category: 'Code Splitting',
    items: [
      'Implement route-based code splitting',
      'Split vendor libraries into separate chunks',
      'Use dynamic imports for heavy components',
      'Implement component-level code splitting'
    ]
  },
  {
    category: 'Component Optimization',
    items: [
      'Use React.memo for expensive components',
      'Implement proper prop comparison functions',
      'Avoid inline object/function creation in render',
      'Use useMemo and useCallback appropriately'
    ]
  },
  {
    category: 'List Optimization',
    items: [
      'Implement virtualization for large lists',
      'Use proper key props for list items',
      'Implement pagination for data tables',
      'Use intersection observer for infinite scroll'
    ]
  },
  {
    category: 'Image Optimization',
    items: [
      'Use WebP format with fallbacks',
      'Implement lazy loading for images',
      'Use appropriate image sizes and srcsets',
      'Optimize image compression and quality'
    ]
  },
  {
    category: 'Bundle Optimization',
    items: [
      'Analyze bundle size regularly',
      'Remove unused dependencies',
      'Use tree shaking for libraries',
      'Implement proper chunk splitting strategy'
    ]
  },
  {
    category: 'Runtime Performance',
    items: [
      'Monitor component render times',
      'Track memory usage patterns',
      'Implement performance budgets',
      'Use performance profiling tools'
    ]
  }
];

// Utility function to check if performance monitoring should be enabled
export function shouldEnablePerformanceMonitoring(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return PERFORMANCE_CONFIG.ENABLE_IN_DEVELOPMENT;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return PERFORMANCE_CONFIG.ENABLE_IN_PRODUCTION;
  }
  
  return false;
}

// Utility function to get performance recommendations based on current metrics
export function getPerformanceRecommendations(metrics: any[]): string[] {
  const recommendations: string[] = [];
  
  if (metrics.length === 0) {
    return ['No performance data available yet'];
  }
  
  // Calculate average render time
  const avgRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
  
  if (avgRenderTime > PERFORMANCE_RECOMMENDATIONS.MEMO_THRESHOLD) {
    recommendations.push('Consider using React.memo for components with slow render times');
  }
  
  // Check for memory usage
  const memoryInfo = getMemoryUsage();
  if (memoryInfo) {
    const memoryUsageRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
    
    if (memoryUsageRatio > PERFORMANCE_RECOMMENDATIONS.MEMORY_WARNING_THRESHOLD) {
      recommendations.push('Memory usage is high - consider implementing virtualization or lazy loading');
    }
    
    if (memoryUsageRatio > PERFORMANCE_RECOMMENDATIONS.MEMORY_CRITICAL_THRESHOLD) {
      recommendations.push('Critical memory usage - immediate optimization required');
    }
  }
  
  // Check for slow components
  const slowComponents = metrics.filter(m => m.renderTime > PERFORMANCE_CONFIG.COMPONENT_THRESHOLDS.RENDER_TIME_WARNING);
  if (slowComponents.length > 0) {
    const slowestComponent = slowComponents.reduce((prev, current) => 
      prev.renderTime > current.renderTime ? prev : current
    );
    recommendations.push(`${slowestComponent.componentName} is rendering slowly (${slowestComponent.renderTime.toFixed(2)}ms)`);
  }
  
  return recommendations;
}