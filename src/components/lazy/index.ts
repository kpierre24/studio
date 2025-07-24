/**
 * Lazy-loaded components for code splitting and performance optimization
 */

import { createLazyComponent } from '@/lib/performance';

// Lazy load heavy dashboard components
export const LazyDashboardWidget = createLazyComponent(
  () => import('@/components/ui/dashboard-widget')
);

export const LazyActivityTimeline = createLazyComponent(
  () => import('@/components/ui/activity-timeline')
);

export const LazyDataVisualization = createLazyComponent(
  () => import('@/components/ui/data-visualization')
);

export const LazyTrendChart = createLazyComponent(
  () => import('@/components/ui/trend-chart')
);

export const LazyGradeDistribution = createLazyComponent(
  () => import('@/components/ui/grade-distribution')
);

export const LazyAttendanceHeatmap = createLazyComponent(
  () => import('@/components/ui/attendance-heatmap')
);

// Lazy load content management components
export const LazyContentOrganizer = createLazyComponent(
  () => import('@/components/ui/content-organizer')
);

export const LazyDragDropUpload = createLazyComponent(
  () => import('@/components/ui/drag-drop-upload')
);

export const LazyFileManager = createLazyComponent(
  () => import('@/components/ui/file-manager')
);

export const LazyContentCreationWizard = createLazyComponent(
  () => import('@/components/ui/content-creation-wizard')
);

export const LazyAssignmentCreationWizard = createLazyComponent(
  () => import('@/components/ui/assignment-creation-wizard')
);

// Lazy load accessibility components
export const LazyAccessibilityControls = createLazyComponent(
  () => import('@/components/ui/accessibility-controls')
);

export const LazyColorContrastChecker = createLazyComponent(
  () => import('@/components/ui/color-contrast-checker')
);

// Lazy load mobile components
export const LazyMobileForm = createLazyComponent(
  () => import('@/components/ui/mobile-form')
);

export const LazyMobileTable = createLazyComponent(
  () => import('@/components/ui/mobile-table')
);

export const LazyMobileChart = createLazyComponent(
  () => import('@/components/ui/mobile-chart')
);

// Lazy load example components (for development/demo)
export const LazyDashboardExample = createLazyComponent(
  () => import('@/components/examples/dashboard-example')
);

export const LazyAccessibilityDemo = createLazyComponent(
  () => import('@/components/examples/accessibility-demo')
);

export const LazyResponsiveDataExample = createLazyComponent(
  () => import('@/components/examples/responsive-data-example')
);

// Lazy load performance monitoring components
export const LazyPerformanceMetrics = createLazyComponent(
  () => import('@/components/ui/performance-monitor').then(module => ({ 
    default: module.PerformanceMetrics 
  }))
);

export const LazyMemoryMonitor = createLazyComponent(
  () => import('@/components/ui/performance-monitor').then(module => ({ 
    default: module.MemoryMonitor 
  }))
);