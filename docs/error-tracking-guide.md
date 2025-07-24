# Error Tracking Guide for Enhanced UI Components

This guide explains how to implement and use the error tracking system for ClassroomHQ's enhanced UI components.

## Overview

The error tracking system provides comprehensive monitoring for enhanced UI components, including:

- **Component-specific error tracking** with contextual information
- **Performance monitoring** with render time and memory usage tracking
- **Accessibility error detection** and reporting
- **Animation and motion error tracking**
- **Real-time monitoring dashboard** for deployment health
- **Automatic rollback capabilities** based on error thresholds

## Quick Start

### 1. Basic Error Tracking

Use the `withErrorTracking` HOC to automatically add error tracking to any component:

```typescript
import { withErrorTracking } from '@/components/ui/with-error-tracking';

const MyEnhancedComponent = withErrorTracking(
  function MyComponent({ data }: { data: any[] }) {
    // Your component logic
    return <div>My Component</div>;
  },
  {
    componentName: 'MyComponent',
    trackPerformance: true,
    performanceThresholds: { renderTime: 100, memoryUsage: 30 },
  }
);
```

### 2. Manual Error Tracking

For functional components, use the `useComponentErrorTracking` hook:

```typescript
import { useComponentErrorTracking } from '@/lib/error-tracking';

function MyComponent() {
  const { trackError, trackPerformance } = useComponentErrorTracking('MyComponent');

  const handleOperation = async () => {
    try {
      // Your operation
    } catch (error) {
      trackError(error as Error, {
        userInteraction: {
          type: 'click',
          target: 'operation-button',
          timestamp: Date.now(),
        },
      });
    }
  };

  return <button onClick={handleOperation}>Perform Operation</button>;
}
```

## Error Tracking Features

### Component Error Tracking

Track errors with rich contextual information:

```typescript
import { trackComponentError } from '@/lib/error-tracking';

trackComponentError(error, 'ComponentName', {
  component: {
    componentName: 'ComponentName',
    componentProps: { prop1: 'value1' },
    renderCount: 5,
    lastRenderTime: 150,
  },
  userInteraction: {
    type: 'click',
    target: 'button-id',
    timestamp: Date.now(),
  },
  accessibility: {
    screenReaderActive: false,
    keyboardNavigation: true,
    reducedMotion: false,
    highContrast: false,
  },
});
```

### Performance Monitoring

Track component performance metrics:

```typescript
import { trackPerformanceIssue } from '@/lib/error-tracking';

trackPerformanceIssue('ComponentName', {
  renderTime: 250, // milliseconds
  componentSize: 1000, // pixels or data size
  memoryUsage: 45, // MB
  interactionLatency: 50, // milliseconds
}, {
  renderTime: 200, // threshold
  memoryUsage: 50, // threshold
});
```

### Accessibility Error Tracking

Track accessibility violations:

```typescript
import { trackAccessibilityError } from '@/lib/error-tracking';

trackAccessibilityError(
  new Error('Missing aria-label on button'),
  'ComponentName',
  {
    violationType: 'aria',
    element: 'button#submit',
    expectedValue: 'aria-label attribute',
    actualValue: 'missing',
  }
);
```

### Animation Error Tracking

Track animation-related errors:

```typescript
import { trackAnimationError } from '@/lib/error-tracking';

trackAnimationError(
  new Error('Animation failed to complete'),
  'ComponentName',
  {
    animationType: 'slide-in',
    duration: 300,
    easing: 'ease-in-out',
    reducedMotionPreference: false,
  }
);
```

## Monitoring Dashboard

### Using the Error Monitoring Dashboard

Add the monitoring dashboard to your admin interface:

```typescript
import { ErrorMonitoringDashboard } from '@/components/ui/error-monitoring-dashboard';

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ErrorMonitoringDashboard 
        autoRefresh={true}
        refreshInterval={30000} // 30 seconds
      />
    </div>
  );
}
```

### Dashboard Features

- **Real-time error statistics** with severity levels
- **Component-specific error breakdown** with performance metrics
- **Error pattern analysis** to identify recurring issues
- **Recent error reports** with detailed context
- **Export functionality** for error data analysis
- **Data clearing** for maintenance

## Deployment Monitoring

### Running Deployment Monitoring

Use the deployment monitoring script to track deployment health:

```bash
# Basic monitoring
node scripts/deployment-monitor.js

# Custom thresholds
node scripts/deployment-monitor.js --error-threshold=3 --performance-threshold=150 --duration=600

# Disable automatic rollback
node scripts/deployment-monitor.js --no-rollback
```

### Monitoring Features

- **Health check endpoints** validation
- **New feature monitoring** with specific indicators
- **Performance threshold** monitoring
- **Automatic rollback** on failure detection
- **Comprehensive reporting** with recommendations

## Integration Examples

### Enhanced Dashboard Widget

```typescript
import { withErrorTracking } from '@/components/ui/with-error-tracking';

const EnhancedDashboardWidget = withErrorTracking(
  function DashboardWidget({ title, data }: { title: string; data: any[] }) {
    const { trackError, trackPerformance } = useComponentErrorTracking('DashboardWidget');
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      // Simulate data processing
      setTimeout(() => {
        const renderTime = performance.now() - startTime;
        trackPerformance({
          renderTime,
          componentSize: data.length * 100,
          memoryUsage: Math.random() * 50 + 10,
        });
      }, 100);
    }, [data]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Widget content */}
        </CardContent>
      </Card>
    );
  },
  {
    componentName: 'DashboardWidget',
    trackPerformance: true,
    performanceThresholds: { renderTime: 200, memoryUsage: 30 },
  }
);
```

### Error Boundary Integration

```typescript
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { trackComponentError } from '@/lib/error-tracking';

function MyApp() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        trackComponentError(error, 'AppErrorBoundary', {
          component: { componentName: 'AppErrorBoundary' },
        }, errorInfo);
      }}
    >
      <MyEnhancedComponents />
    </ErrorBoundary>
  );
}
```

## Configuration

### Error Tracking Configuration

Configure error tracking thresholds and behavior:

```typescript
// In your app configuration
const errorTrackingConfig = {
  performanceThresholds: {
    renderTime: 200, // ms
    memoryUsage: 50, // MB
    interactionLatency: 100, // ms
  },
  errorReporting: {
    enabled: process.env.NODE_ENV === 'production',
    endpoint: '/api/errors',
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  },
  accessibility: {
    enableAutomaticChecking: true,
    contrastThreshold: 4.5,
    checkInterval: 60000, // 1 minute
  },
};
```

### Deployment Monitoring Configuration

Configure deployment monitoring in your CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Monitor Deployment
  run: |
    node scripts/deployment-monitor.js \
      --error-threshold=5 \
      --performance-threshold=200 \
      --duration=300
  env:
    DEPLOYMENT_URL: ${{ secrets.DEPLOYMENT_URL }}
```

## Best Practices

### 1. Component Naming

Use consistent, descriptive component names:

```typescript
// Good
trackComponentError(error, 'DashboardProgressWidget', context);

// Avoid
trackComponentError(error, 'Widget1', context);
```

### 2. Error Context

Provide rich context for better debugging:

```typescript
trackComponentError(error, 'ComponentName', {
  component: {
    componentName: 'ComponentName',
    componentProps: sanitizeProps(props), // Remove sensitive data
    renderCount: renderCount,
  },
  userInteraction: {
    type: 'click',
    target: event.target.id,
    timestamp: Date.now(),
  },
});
```

### 3. Performance Thresholds

Set realistic performance thresholds based on component complexity:

```typescript
// Simple components
{ renderTime: 50, memoryUsage: 10 }

// Complex data visualization
{ renderTime: 200, memoryUsage: 50 }

// Heavy interactive components
{ renderTime: 300, memoryUsage: 100 }
```

### 4. Error Categorization

Use consistent error categorization:

```typescript
// Network errors
trackComponentError(networkError, 'ComponentName', {
  category: 'network',
  severity: 'high',
});

// Validation errors
trackComponentError(validationError, 'ComponentName', {
  category: 'validation',
  severity: 'medium',
});

// UI errors
trackComponentError(uiError, 'ComponentName', {
  category: 'ui',
  severity: 'low',
});
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Check for memory leaks in event listeners and subscriptions
2. **Slow Render Times**: Optimize component re-renders with React.memo and useMemo
3. **Accessibility Violations**: Use automated accessibility testing tools
4. **Animation Errors**: Respect reduced motion preferences

### Debugging Tips

1. **Enable Development Logging**: Set `NODE_ENV=development` for detailed error logs
2. **Use Browser DevTools**: Monitor performance and memory usage
3. **Check Network Tab**: Verify error reporting requests
4. **Review Error Patterns**: Look for recurring error patterns in the dashboard

## API Reference

### Functions

- `trackComponentError(error, componentName, context, errorInfo)`: Track component errors
- `trackPerformanceIssue(componentName, metrics, thresholds)`: Track performance issues
- `trackAccessibilityError(error, componentName, context)`: Track accessibility violations
- `trackAnimationError(error, componentName, context)`: Track animation errors

### Hooks

- `useComponentErrorTracking(componentName)`: Hook for component error tracking
- `useErrorTracking(componentName, options)`: Hook for functional component error tracking

### Components

- `withErrorTracking(Component, options)`: HOC for automatic error tracking
- `ErrorMonitoringDashboard`: Real-time error monitoring dashboard
- `ErrorBoundary`: Enhanced error boundary with tracking integration

### Types

```typescript
interface PerformanceMetrics {
  renderTime: number;
  componentSize: number;
  memoryUsage?: number;
  interactionLatency?: number;
}

interface EnhancedErrorContext {
  component: ComponentError;
  performance?: PerformanceMetrics;
  userInteraction?: UserInteraction;
  accessibility?: AccessibilityContext;
}
```

## Support

For questions or issues with the error tracking system:

1. Check the [Error Monitoring Dashboard](#monitoring-dashboard) for real-time insights
2. Review error patterns and recommendations
3. Consult the [troubleshooting section](#troubleshooting)
4. Contact the development team with specific error IDs for investigation