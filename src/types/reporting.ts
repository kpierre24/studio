// Advanced Reporting and Dashboard System Types

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  userRole: 'SuperAdmin' | 'Teacher' | 'Student';
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  format: ExportFormat[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum ReportType {
  STUDENT_PERFORMANCE = 'student_performance',
  COURSE_ANALYTICS = 'course_analytics',
  ATTENDANCE_SUMMARY = 'attendance_summary',
  GRADE_DISTRIBUTION = 'grade_distribution',
  ENGAGEMENT_METRICS = 'engagement_metrics',
  FINANCIAL_SUMMARY = 'financial_summary',
  COMPARATIVE_ANALYSIS = 'comparative_analysis',
  CUSTOM_DASHBOARD = 'custom_dashboard'
}

export interface ReportParameter {
  key: string;
  label: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'number' | 'text';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  recipients: string[]; // email addresses
  enabled: boolean;
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  dataSource: string;
  refreshInterval?: number; // in seconds
  userRole: 'SuperAdmin' | 'Teacher' | 'Student';
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  PROGRESS_BAR = 'progress_bar',
  HEATMAP = 'heatmap',
  LIST = 'list',
  GAUGE = 'gauge'
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  filters?: FilterConfig[];
  drillDown?: DrillDownConfig;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

export interface DrillDownConfig {
  enabled: boolean;
  targetReport?: string;
  parameters?: Record<string, string>;
}

export interface ReportData {
  id: string;
  reportId: string;
  data: any[];
  metadata: {
    generatedAt: Date;
    parameters: Record<string, any>;
    totalRecords: number;
    executionTime: number;
  };
  summary?: ReportSummary;
}

export interface ReportSummary {
  keyMetrics: { label: string; value: string | number; trend?: number }[];
  insights: string[];
  recommendations?: string[];
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  benchmark?: number;
  target?: number;
}

export interface ComparativeAnalysis {
  id: string;
  type: 'course' | 'semester' | 'year' | 'cohort';
  baseline: {
    id: string;
    name: string;
    metrics: AnalyticsMetric[];
  };
  comparisons: Array<{
    id: string;
    name: string;
    metrics: AnalyticsMetric[];
    variance: Record<string, number>;
  }>;
}

export interface ReportExport {
  id: string;
  reportId: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  expiresAt: Date;
  fileSize?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  userRole: 'SuperAdmin' | 'Teacher' | 'Student';
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealtimeDataSource {
  id: string;
  name: string;
  endpoint: string;
  updateInterval: number;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface AnalyticsAPI {
  endpoint: string;
  method: 'GET' | 'POST';
  authentication: 'apiKey' | 'oauth' | 'basic';
  parameters: Record<string, any>;
  responseFormat: 'json' | 'xml' | 'csv';
}