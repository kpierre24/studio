"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Zap, 
  Eye, 
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { enhancedErrorTracker } from '@/lib/error-tracking';
import { errorReporting } from '@/lib/error-reporting';

interface ErrorMonitoringDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ErrorMonitoringDashboard({ 
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: ErrorMonitoringDashboardProps) {
  const [errorStats, setErrorStats] = useState<any>({});
  const [errorPatterns, setErrorPatterns] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshData = React.useCallback(() => {
    // Get error patterns
    const patterns = enhancedErrorTracker.getErrorPatterns();
    setErrorPatterns(patterns);

    // Get all reports
    const allReports = errorReporting.getReports();
    setReports(allReports);

    // Get component-specific stats
    const componentNames = Array.from(new Set(
      allReports
        .filter(report => report.metadata?.componentName)
        .map(report => report.metadata?.componentName)
    ));

    const stats: any = {};
    componentNames.forEach(componentName => {
      stats[componentName] = enhancedErrorTracker.getComponentErrorStats(componentName);
    });
    setErrorStats(stats);

    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    refreshData();

    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, autoRefresh, refreshInterval]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPerformanceStatus = (renderTime?: number) => {
    if (!renderTime) return 'unknown';
    if (renderTime < 50) return 'excellent';
    if (renderTime < 100) return 'good';
    if (renderTime < 200) return 'fair';
    return 'poor';
  };

  const exportData = () => {
    const data = {
      errorStats,
      errorPatterns,
      reports: reports.slice(-100), // Last 100 reports
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-monitoring-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    enhancedErrorTracker.clearTrackingData();
    errorReporting.clearReports();
    refreshData();
  };

  const totalErrors = reports.length;
  const criticalErrors = reports.filter(r => r.severity === 'critical').length;
  const recentErrors = reports.filter(r => 
    new Date(r.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Error Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={clearAllData}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              All time errors tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentErrors}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components Tracked</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(errorStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Enhanced components
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
          <TabsTrigger value="reports">Recent Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(errorStats).map(([componentName, stats]: [string, any]) => (
              <Card key={componentName} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedComponent(componentName)}>
                <CardHeader>
                  <CardTitle className="text-lg">{componentName}</CardTitle>
                  <CardDescription>
                    {stats.totalErrors} errors • Performance: {getPerformanceStatus(stats.averageRenderTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Count</span>
                      <Badge variant={stats.totalErrors > 5 ? 'destructive' : 'secondary'}>
                        {stats.totalErrors}
                      </Badge>
                    </div>
                    
                    {stats.averageRenderTime && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Avg Render Time</span>
                          <span>{stats.averageRenderTime.toFixed(1)}ms</span>
                        </div>
                        <Progress 
                          value={Math.min((stats.averageRenderTime / 200) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stats.errorTypes).map(([type, count]: [string, any]) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="space-y-3">
            {errorPatterns.map((pattern, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{pattern.pattern}</p>
                      <p className="text-sm text-muted-foreground">
                        Affects: {pattern.components.join(', ')}
                      </p>
                    </div>
                    <Badge variant={pattern.count > 10 ? 'destructive' : 'secondary'}>
                      {pattern.count} occurrences
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-3">
            {reports.slice(-20).reverse().map((report, index) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(report.severity) as any}>
                          {report.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{report.error.message}</p>
                      {report.metadata?.componentName && (
                        <p className="text-sm text-muted-foreground">
                          Component: {report.metadata.componentName}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {report.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Critical Errors Alert */}
      {criticalErrors > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {criticalErrors} critical error{criticalErrors > 1 ? 's' : ''} that require immediate attention.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}