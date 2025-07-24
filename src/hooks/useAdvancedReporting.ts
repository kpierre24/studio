import { useState, useEffect, useCallback } from 'react';
import { 
  ReportConfig, 
  ReportData, 
  DashboardLayout, 
  DashboardWidget,
  ReportExport,
  ExportFormat,
  ComparativeAnalysis,
  AnalyticsMetric
} from '@/types/reporting';
import { UserRole, User, Course, Assignment, Submission, AttendanceRecord, Payment } from '@/types';

import { ReportGenerator } from '@/lib/reporting/report-generator';
import { DashboardManager } from '@/lib/reporting/dashboard-manager';
import { ExportManager } from '@/lib/reporting/export-manager';
import { AnalyticsEngine } from '@/lib/reporting/analytics-engine';
import { ComparativeAnalysisEngine } from '@/lib/reporting/comparative-analysis';
import { RealtimeDataManager } from '@/lib/reporting/realtime-data';

interface UseAdvancedReportingProps {
  userRole: UserRole;
  userId: string;
  data: {
    users: User[];
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
    attendance: AttendanceRecord[];
    payments: Payment[];
  };
}

export function useAdvancedReporting({
  userRole,
  userId,
  data
}: UseAdvancedReportingProps) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout | null>(null);
  const [exports, setExports] = useState<ReportExport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize managers
  const reportGenerator = ReportGenerator.getInstance();
  const dashboardManager = DashboardManager.getInstance();
  const exportManager = ExportManager.getInstance();
  const analyticsEngine = AnalyticsEngine.getInstance();
  const comparativeEngine = ComparativeAnalysisEngine.getInstance();
  const realtimeManager = RealtimeDataManager.getInstance();

  // Load initial data
  useEffect(() => {
    loadDashboard();
    loadAnalytics();
  }, [userRole, userId]);

  const loadDashboard = async () => {
    try {
      const layout = await dashboardManager.getDefaultDashboardLayout(userRole);
      if (!layout) {
        // Create default dashboard if none exists
        await dashboardManager.createDefaultDashboards();
        const newLayout = await dashboardManager.getDefaultDashboardLayout(userRole);
        setDashboardLayout(newLayout);
      } else {
        setDashboardLayout(layout);
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard loading error:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const timeframe = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const engagementMetrics = await analyticsEngine.calculateEngagementMetrics(
        data.users,
        data.submissions,
        data.attendance,
        timeframe
      );

      const performanceMetrics = await analyticsEngine.calculatePerformanceMetrics(
        data.submissions,
        data.assignments,
        timeframe
      );

      const financialMetrics = await analyticsEngine.calculateFinancialMetrics(
        data.payments,
        data.courses,
        timeframe
      );

      setAnalytics([...engagementMetrics, ...performanceMetrics, ...financialMetrics]);
    } catch (err) {
      console.error('Analytics loading error:', err);
    }
  };

  // Report Management
  const generateReport = useCallback(async (config: ReportConfig): Promise<ReportData> => {
    setIsLoading(true);
    setError(null);

    try {
      const reportData = await reportGenerator.generateReport(config, {}, data);
      setReports(prev => [reportData, ...prev]);
      return reportData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const getReport = useCallback((reportId: string): ReportData | null => {
    return reports.find(report => report.id === reportId) || null;
  }, [reports]);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  }, []);

  // Export Management
  const exportReport = useCallback(async (
    reportId: string, 
    format: ExportFormat,
    filename?: string
  ): Promise<ReportExport> => {
    const report = getReport(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    try {
      const exportRecord = await exportManager.exportReport(report, format, filename);
      setExports(prev => [exportRecord, ...prev]);
      return exportRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report';
      setError(errorMessage);
      throw err;
    }
  }, [reports]);

  const batchExportReports = useCallback(async (
    reportIds: string[],
    format: ExportFormat
  ): Promise<ReportExport> => {
    const reportsToExport = reports.filter(report => reportIds.includes(report.id));
    
    try {
      const exportRecord = await exportManager.exportMultipleReports(reportsToExport, format);
      setExports(prev => [exportRecord, ...prev]);
      return exportRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch export reports';
      setError(errorMessage);
      throw err;
    }
  }, [reports]);

  const getExport = useCallback((exportId: string): ReportExport | null => {
    return exports.find(exp => exp.id === exportId) || null;
  }, [exports]);

  // Dashboard Management
  const updateDashboard = useCallback(async (
    layoutId: string,
    updates: Partial<DashboardLayout>
  ): Promise<DashboardLayout> => {
    try {
      const updatedLayout = await dashboardManager.updateDashboardLayout(layoutId, updates);
      setDashboardLayout(updatedLayout);
      return updatedLayout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dashboard';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addWidget = useCallback(async (widget: Omit<DashboardWidget, 'id'>): Promise<DashboardWidget> => {
    try {
      const newWidget = await dashboardManager.createWidget(
        widget.type,
        widget.title,
        widget.position,
        widget.config,
        widget.dataSource,
        widget.userRole as any,
        widget.refreshInterval
      );

      if (dashboardLayout) {
        const updatedLayout = await dashboardManager.updateDashboardLayout(dashboardLayout.id, {
          widgets: [...dashboardLayout.widgets, newWidget]
        });
        setDashboardLayout(updatedLayout);
      }

      return newWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add widget';
      setError(errorMessage);
      throw err;
    }
  }, [dashboardLayout]);

  const updateWidget = useCallback(async (
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): Promise<DashboardWidget> => {
    try {
      const updatedWidget = await dashboardManager.updateWidget(widgetId, updates);

      if (dashboardLayout) {
        const updatedLayout = await dashboardManager.updateDashboardLayout(dashboardLayout.id, {
          widgets: dashboardLayout.widgets.map(widget => 
            widget.id === widgetId ? updatedWidget : widget
          )
        });
        setDashboardLayout(updatedLayout);
      }

      return updatedWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update widget';
      setError(errorMessage);
      throw err;
    }
  }, [dashboardLayout]);

  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    try {
      await dashboardManager.deleteWidget(widgetId);

      if (dashboardLayout) {
        const updatedLayout = await dashboardManager.updateDashboardLayout(dashboardLayout.id, {
          widgets: dashboardLayout.widgets.filter(widget => widget.id !== widgetId)
        });
        setDashboardLayout(updatedLayout);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove widget';
      setError(errorMessage);
      throw err;
    }
  }, [dashboardLayout]);

  // Analytics Functions
  const predictStudentPerformance = useCallback(async (studentId: string) => {
    try {
      return await analyticsEngine.predictStudentPerformance(
        studentId,
        data.submissions,
        data.attendance
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict student performance';
      setError(errorMessage);
      throw err;
    }
  }, [data]);

  const analyzeTrends = useCallback(async (
    metricId: string,
    dataPoints: number[],
    timePoints: Date[]
  ) => {
    try {
      return await analyticsEngine.analyzeTrends(metricId, dataPoints, timePoints);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze trends';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Comparative Analysis
  const compareCourses = useCallback(async (
    baselineCourseId: string,
    comparisonCourseIds: string[]
  ): Promise<ComparativeAnalysis> => {
    try {
      return await comparativeEngine.compareCourses(baselineCourseId, comparisonCourseIds, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare courses';
      setError(errorMessage);
      throw err;
    }
  }, [data]);

  const compareSemesters = useCallback(async (
    baselineSemester: string,
    comparisonSemesters: string[]
  ): Promise<ComparativeAnalysis> => {
    try {
      return await comparativeEngine.compareSemesters(baselineSemester, comparisonSemesters, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare semesters';
      setError(errorMessage);
      throw err;
    }
  }, [data]);

  // Real-time Data Management
  const subscribeToRealtimeData = useCallback((
    dataSourceId: string,
    callback: (data: any) => void
  ): (() => void) => {
    return realtimeManager.subscribe(dataSourceId, callback);
  }, []);

  const registerDataSource = useCallback(async (
    name: string,
    endpoint: string,
    updateInterval: number
  ) => {
    try {
      return await realtimeManager.registerDataSource(name, endpoint, updateInterval);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register data source';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Utility Functions
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadDashboard(),
        loadAnalytics()
      ]);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      realtimeManager.destroy();
    };
  }, []);

  return {
    // State
    reports,
    dashboardLayout,
    exports,
    analytics,
    isLoading,
    error,

    // Report Management
    generateReport,
    getReport,
    deleteReport,

    // Export Management
    exportReport,
    batchExportReports,
    getExport,

    // Dashboard Management
    updateDashboard,
    addWidget,
    updateWidget,
    removeWidget,

    // Analytics
    predictStudentPerformance,
    analyzeTrends,

    // Comparative Analysis
    compareCourses,
    compareSemesters,

    // Real-time Data
    subscribeToRealtimeData,
    registerDataSource,

    // Utilities
    refreshData,
    clearError
  };
}