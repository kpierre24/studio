'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  RefreshCw, 
  Settings, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  ReportConfig, 
  ReportData, 
  DashboardLayout, 
  DashboardWidget, 
  WidgetType,
  ExportFormat,
  ReportType 
} from '@/types/reporting';
import { UserRole } from '@/types';

interface AdvancedReportingDashboardProps {
  userRole: UserRole;
  userId: string;
  onReportGenerate?: (config: ReportConfig) => Promise<ReportData>;
  onExportReport?: (reportId: string, format: ExportFormat) => Promise<void>;
  onDashboardSave?: (layout: DashboardLayout) => Promise<void>;
}

export function AdvancedReportingDashboard({
  userRole,
  userId,
  onReportGenerate,
  onExportReport,
  onDashboardSave
}: AdvancedReportingDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // Load default dashboard layout
  useEffect(() => {
    loadDefaultDashboard();
  }, [userRole]);

  const loadDefaultDashboard = async () => {
    // Mock loading default dashboard
    const mockLayout: DashboardLayout = {
      id: `default_${userRole.toLowerCase()}`,
      name: `${userRole} Dashboard`,
      userRole,
      widgets: getDefaultWidgets(userRole),
      isDefault: true,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDashboardLayout(mockLayout);
  };

  const getDefaultWidgets = (role: UserRole): DashboardWidget[] => {
    const baseWidgets: DashboardWidget[] = [];

    if (role === UserRole.SUPER_ADMIN) {
      baseWidgets.push(
        {
          id: 'total_users',
          type: WidgetType.METRIC_CARD,
          title: 'Total Users',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { aggregation: 'count' },
          dataSource: 'users',
          userRole: role
        },
        {
          id: 'revenue_chart',
          type: WidgetType.CHART,
          title: 'Revenue Trends',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: { 
            chartType: 'line',
            showGrid: true,
            colors: ['#3B82F6', '#10B981']
          },
          dataSource: 'revenue_data',
          userRole: role
        }
      );
    } else if (role === UserRole.TEACHER) {
      baseWidgets.push(
        {
          id: 'my_courses',
          type: WidgetType.METRIC_CARD,
          title: 'My Courses',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { aggregation: 'count' },
          dataSource: 'teacher_courses',
          userRole: role
        },
        {
          id: 'student_performance',
          type: WidgetType.CHART,
          title: 'Student Performance',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: { 
            chartType: 'bar',
            showGrid: true,
            colors: ['#EF4444', '#F59E0B', '#10B981']
          },
          dataSource: 'performance_data',
          userRole: role
        }
      );
    } else {
      baseWidgets.push(
        {
          id: 'my_grades',
          type: WidgetType.METRIC_CARD,
          title: 'Average Grade',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { aggregation: 'avg' },
          dataSource: 'student_grades',
          userRole: role
        },
        {
          id: 'progress_chart',
          type: WidgetType.PROGRESS_BAR,
          title: 'Course Progress',
          position: { x: 3, y: 0, w: 6, h: 3 },
          config: {},
          dataSource: 'course_progress',
          userRole: role
        }
      );
    }

    return baseWidgets;
  };

  const generateReport = async (type: ReportType, parameters: Record<string, any>) => {
    if (!onReportGenerate) return;

    setIsLoading(true);
    try {
      const config: ReportConfig = {
        id: `report_${Date.now()}`,
        name: `${type} Report`,
        description: `Generated ${type} report`,
        type,
        userRole,
        parameters: [],
        format: [ExportFormat.JSON],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      };

      const reportData = await onReportGenerate(config);
      setReports(prev => [reportData, ...prev]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (reportId: string, format: ExportFormat) => {
    if (!onExportReport) return;
    
    try {
      await onExportReport(reportId, format);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const mockData = generateMockWidgetData(widget);

    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {renderWidgetContent(widget, mockData)}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderWidgetContent = (widget: DashboardWidget, data: any) => {
    switch (widget.type) {
      case WidgetType.METRIC_CARD:
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{data.value}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              {data.trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : data.trend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500 mr-1" />
              )}
              {Math.abs(data.trend)}% vs last period
            </div>
          </div>
        );

      case WidgetType.CHART:
        return (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {widget.config.chartType === 'line' ? (
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={widget.config.colors?.[0] || '#3B82F6'} 
                  />
                </LineChart>
              ) : widget.config.chartType === 'bar' ? (
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill={widget.config.colors?.[0] || '#3B82F6'} 
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data.chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#3B82F6"
                    dataKey="value"
                  >
                    {data.chartData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={widget.config.colors?.[index] || `hsl(${index * 45}, 70%, 50%)`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.PROGRESS_BAR:
        return (
          <div className="space-y-3">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case WidgetType.LIST:
        return (
          <div className="space-y-2">
            {data.items.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm truncate">{item.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-sm text-muted-foreground">Widget type not supported</div>;
    }
  };

  const generateMockWidgetData = (widget: DashboardWidget) => {
    switch (widget.type) {
      case WidgetType.METRIC_CARD:
        return {
          value: Math.floor(Math.random() * 1000) + 100,
          trend: (Math.random() - 0.5) * 20
        };

      case WidgetType.CHART:
        return {
          chartData: Array.from({ length: 7 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 100) + 20
          }))
        };

      case WidgetType.PROGRESS_BAR:
        return {
          items: Array.from({ length: 3 }, (_, i) => ({
            label: `Course ${i + 1}`,
            percentage: Math.floor(Math.random() * 100)
          }))
        };

      case WidgetType.LIST:
        return {
          items: Array.from({ length: 8 }, (_, i) => ({
            title: `Item ${i + 1}`,
            status: ['Active', 'Pending', 'Completed'][Math.floor(Math.random() * 3)]
          }))
        };

      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reporting Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for {userRole.toLowerCase()}s
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Interactive Dashboard</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>

          {dashboardLayout && (
            <div className="grid grid-cols-12 gap-4">
              {dashboardLayout.widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
                  style={{
                    gridColumn: `span ${widget.position.w}`,
                    minHeight: `${widget.position.h * 100}px`
                  }}
                >
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Generation</h2>
            <div className="flex space-x-2">
              <Button 
                onClick={() => generateReport(ReportType.STUDENT_PERFORMANCE, {})}
                disabled={isLoading}
              >
                {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ReportType).map(type => (
              <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{type.replace('_', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate detailed {type.toLowerCase().replace('_', ' ')} analysis
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport(type, {})}
                    disabled={isLoading}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Reports</h3>
              <div className="space-y-2">
                {reports.map(report => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Report #{report.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Generated {report.metadata.generatedAt.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportReport(report.id, ExportFormat.PDF)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">Advanced Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Jan', value: 85 },
                      { name: 'Feb', value: 88 },
                      { name: 'Mar', value: 82 },
                      { name: 'Apr', value: 90 },
                      { name: 'May', value: 87 },
                      { name: 'Jun', value: 92 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High', value: 35 },
                          { name: 'Medium', value: 45 },
                          { name: 'Low', value: 20 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#3B82F6"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <h2 className="text-xl font-semibold">Export Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(ExportFormat).map(format => (
              <Card key={format} className="text-center">
                <CardContent className="p-6">
                  <Download className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-medium mb-2">{format.toUpperCase()}</h3>
                  <Button size="sm" variant="outline">
                    Export as {format.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}