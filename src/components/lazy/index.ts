/**
 * Lazy-loaded components for performance optimization
 * This file provides code-split versions of heavy UI components
 */

import { lazy } from 'react';

// Dashboard Components - Heavy with animations and data processing
export const LazyActivityTimeline = lazy(() => 
  import('../ui/activity-timeline').then(module => ({ default: module.ActivityTimeline }))
);

export const LazyDataVisualization = lazy(() => 
  import('../ui/data-visualization').then(module => ({ default: module.default }))
);

export const LazyTrendChart = lazy(() => 
  import('../ui/trend-chart').then(module => ({ default: module.TrendChart }))
);

export const LazyGradeDistribution = lazy(() => 
  import('../ui/grade-distribution').then(module => ({ default: module.GradeDistribution }))
);

export const LazyAttendanceHeatmap = lazy(() => 
  import('../ui/attendance-heatmap').then(module => ({ default: module.AttendanceHeatmap }))
);

// Content Management Components - Heavy with rich text editing
export const LazyContentOrganizer = lazy(() => 
  import('../ui/content-organizer').then(module => ({ default: module.ContentOrganizer }))
);

export const LazyFileManager = lazy(() => 
  import('../ui/file-manager').then(module => ({ default: module.FileManager }))
);

export const LazyDragDropUpload = lazy(() => 
  import('../ui/drag-drop-upload').then(module => ({ default: module.DragDropUpload }))
);

// Widget System - Heavy with drag and drop functionality
export const LazyWidgetSystem = lazy(() => 
  import('../ui/widget-system').then(module => ({ default: module.WidgetSystem }))
);

// Performance Monitor - Development only
export const LazyPerformanceMonitor = lazy(() => 
  import('../ui/performance-monitor').then(module => ({ default: module.PerformanceMonitor }))
);

// Virtualized Components - For large data sets
export const LazyVirtualizedList = lazy(() => 
  import('../ui/virtualized-list').then(module => ({ default: module.VirtualizedList }))
);

// Mobile-specific heavy components
export const LazyMobileChart = lazy(() => 
  import('../ui/mobile-chart').then(module => ({ default: module.MobileChart }))
);

export const LazyMobileTable = lazy(() => 
  import('../ui/mobile-table').then(module => ({ default: module.MobileTable }))
);