"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Bug,
  TrendingUp
} from 'lucide-react';

// Import error tracking utilities
import { withErrorTracking, useErrorTracking } from '@/components/ui/with-error-tracking';
import { 
  trackComponentError, 
  trackPerformanceIssue, 
  trackAccessibilityError,
  useComponentErrorTracking 
} from '@/lib/error-tracking';
import { ErrorMonitoringDashboard } from '@/components/ui/error-monitoring-dashboard';

// Example enhanced component with error tracking
const EnhancedDashboardWidget = withErrorTracking(
  function DashboardWidget({ title, data, onError }: {
    title: string;
    data: any[];
    onError?: (error: Error) => void;
  }) {
    const { trackError, trackPerformance } = useComponentErrorTracking('DashboardWidget');
    const [isLoading, setIsLoading] = useState(false);

    const handleDataProcessing = async () => {
      const startTime = performance.now();
      setIsLoading(true);

      try {
        // Simulate data processing that might fail
        if (Math.random() > 0.7) {
          throw new Error('Data processing failed due to invalid format');
        }

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        const renderTime = performance.now() - startTime;
        
        // Track performance metrics
        trackPerformance({
          renderTime,
          componentSize: data.length * 100, // Simulate component size
          memoryUsage: Math.random() * 50 + 10, // Simulate memory usage
        });

      } catch (error) {
        // Track the error with context
        trackError(error as Error, {
          component: {
            componentName: 'DashboardWidget',
            componentProps: { title, dataLength: data.length },
          },
          userInteraction: {
            type: 'click',
            target: 'process-data-button',
            timestamp: Date.now(),
          },
        });

        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Enhanced widget with error tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Data items: {data.length}
            </div>
            <Button 
              onClick={handleDataProcessing} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Process Data'}
            </Button>
          </div>
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

// Example component that demonstrates accessibility error tracking
function AccessibilityAwareComponent() {
  const { trackError } = useComponentErrorTracking('AccessibilityAwareComponent');

  const checkAccessibility = () => {
    // Simulate accessibility validation
    const elements = document.querySelectorAll('button, input, a');
    
    elements.forEach((element, index) => {
      // Check for missing aria-label on buttons without text
      if (element.tagName === 'BUTTON' && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
        const error = new Error(`Button missing aria-label: element ${index}`);
        trackAccessibilityError(error, 'AccessibilityAwareComponent', {
          violationType: 'aria',
          element: `button[${index}]`,
          expectedValue: 'aria-label attribute',
          actualValue: 'missing',
        });
      }

      // Check for insufficient color contrast (simulated)
      if (Math.random() > 0.8) {
        const error = new Error(`Insufficient color contrast detected`);
        trackAccessibilityError(error, 'AccessibilityAwareComponent', {
          violationType: 'contrast',
          element: element.tagName.toLowerCase(),
          expectedValue: '4.5:1',
          actualValue: '3.2:1',
        });
      }
    });
  };

  React.useEffect(() => {
    checkAccessibility();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Monitoring</CardTitle>
        <CardDescription>Component with accessibility error tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={checkAccessibility}>
          Run Accessibility Check
        </Button>
      </CardContent>
    </Card>
  );
}

// Example component that demonstrates performance tracking
function PerformanceMonitoredList({ items }: { items: any[] }) {
  const { trackError, trackPerformance } = useComponentErrorTracking('PerformanceMonitoredList');
  const [renderTime, setRenderTime] = useState<number>(0);

  React.useEffect(() => {
    const startTime = performance.now();
    
    // Simulate heavy rendering work
    const timer = setTimeout(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);

      // Track performance
      trackPerformance({
        renderTime: duration,
        componentSize: items.length,
        memoryUsage: items.length * 0.1, // Simulate memory usage
      }, {
        renderTime: 100, // Threshold: 100ms
        memoryUsage: 20, // Threshold: 20MB
      });

      // Simulate performance issue
      if (duration > 100) {
        const error = new Error(`Slow rendering detected: ${duration.toFixed(1)}ms`);
        trackError(error, {
          performance: {
            renderTime: duration,
            componentSize: items.length,
          },
        });
      }
    }, Math.random() * 200); // Random delay to simulate work

    return () => clearTimeout(timer);
  }, [items, trackError, trackPerformance]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Monitored List</CardTitle>
        <CardDescription>
          Rendering {items.length} items • Last render: {renderTime.toFixed(1)}ms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="p-2 bg-muted rounded text-sm">
              Item {index + 1}: {item.name || `Item ${index + 1}`}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant={renderTime > 100 ? 'destructive' : 'secondary'}>
            {renderTime > 100 ? 'Slow' : 'Fast'} Render
          </Badge>
          <span className="text-xs text-muted-foreground">
            {renderTime.toFixed(1)}ms
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main example component
export function ErrorTrackingIntegrationExample() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Generate sample data
  const sampleData = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Sample Item ${i + 1}`,
    value: Math.random() * 100,
  }));

  const handleError = (error: Error) => {
    setErrors(prev => [...prev, error]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const simulateError = () => {
    const error = new Error('Simulated error for testing');
    trackComponentError(error, 'ErrorTrackingIntegrationExample', {
      component: {
        componentName: 'ErrorTrackingIntegrationExample',
      },
      userInteraction: {
        type: 'click',
        target: 'simulate-error-button',
        timestamp: Date.now(),
      },
    });
    handleError(error);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Error Tracking Integration Example</h2>
        <p className="text-muted-foreground">
          Demonstrates how enhanced components integrate with error tracking and monitoring.
        </p>
      </div>

      {/* Error Status */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.length} error{errors.length > 1 ? 's' : ''} detected. 
            <Button variant="link" className="p-0 h-auto ml-2" onClick={clearErrors}>
              Clear errors
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={simulateError} variant="outline">
          <Bug className="w-4 h-4 mr-2" />
          Simulate Error
        </Button>
        <Button onClick={() => setShowDashboard(!showDashboard)} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          {showDashboard ? 'Hide' : 'Show'} Monitoring Dashboard
        </Button>
      </div>

      {/* Monitoring Dashboard */}
      {showDashboard && (
        <Card>
          <CardHeader>
            <CardTitle>Error Monitoring Dashboard</CardTitle>
            <CardDescription>Real-time error tracking and performance monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorMonitoringDashboard />
          </CardContent>
        </Card>
      )}

      {/* Example Components */}
      <Tabs defaultValue="widgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="widgets">Enhanced Widgets</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedDashboardWidget
              title="Sales Data"
              data={sampleData.slice(0, 10)}
              onError={handleError}
            />
            <EnhancedDashboardWidget
              title="User Analytics"
              data={sampleData.slice(10, 20)}
              onError={handleError}
            />
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <AccessibilityAwareComponent />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerformanceMonitoredList items={sampleData.slice(0, 25)} />
            <PerformanceMonitoredList items={sampleData.slice(25, 50)} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Log */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Error Log
            </CardTitle>
            <CardDescription>Recent errors captured by the tracking system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="p-3 bg-destructive/5 border border-destructive/20 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-destructive">{error.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}