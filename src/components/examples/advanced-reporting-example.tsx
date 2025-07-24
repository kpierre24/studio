'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

import { AdvancedReportingDashboard } from '@/components/ui/advanced-reporting-dashboard';
import { ReportBuilder } from '@/components/ui/report-builder';
import { useAdvancedReporting } from '@/hooks/useAdvancedReporting';

import { 
  UserRole, 
  User, 
  Course, 
  Assignment, 
  Submission, 
  AttendanceRecord, 
  Payment 
} from '@/types';
import { ReportType, ExportFormat } from '@/types/reporting';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.STUDENT
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: UserRole.TEACHER
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.SUPER_ADMIN
  }
];

const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Mathematics 101',
    description: 'Basic mathematics course',
    teacherId: '2',
    studentIds: ['1'],
    cost: 500,
    category: 'Mathematics'
  },
  {
    id: '2',
    name: 'Science 201',
    description: 'Advanced science course',
    teacherId: '2',
    studentIds: ['1'],
    cost: 600,
    category: 'Science'
  }
];

const mockAssignments: Assignment[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Math Assignment 1',
    description: 'Basic algebra problems',
    dueDate: new Date().toISOString(),
    type: 'standard' as any,
    totalPoints: 100
  }
];

const mockSubmissions: Submission[] = [
  {
    id: '1',
    assignmentId: '1',
    studentId: '1',
    submittedAt: new Date().toISOString(),
    grade: 85,
    feedback: 'Good work!'
  }
];

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    date: new Date().toISOString().split('T')[0],
    status: 'Present' as any
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    amount: 500,
    status: 'Paid' as any,
    paymentDate: new Date().toISOString()
  }
];

interface AdvancedReportingExampleProps {
  userRole?: UserRole;
  userId?: string;
}

export function AdvancedReportingExample({
  userRole = UserRole.TEACHER,
  userId = '2'
}: AdvancedReportingExampleProps) {
  const [activeDemo, setActiveDemo] = useState('dashboard');

  const mockData = {
    users: mockUsers,
    courses: mockCourses,
    assignments: mockAssignments,
    submissions: mockSubmissions,
    attendance: mockAttendance,
    payments: mockPayments
  };

  const {
    reports,
    dashboardLayout,
    exports,
    analytics,
    isLoading,
    error,
    generateReport,
    exportReport,
    updateDashboard,
    addWidget,
    predictStudentPerformance,
    compareCourses,
    refreshData,
    clearError
  } = useAdvancedReporting({
    userRole,
    userId,
    data: mockData
  });

  const handleGenerateReport = async (config: any): Promise<any> => {
    try {
      const report = await generateReport(config);
      console.log('Generated report:', report);
      // Process report but don't return it as the interface expects void
    } catch (err) {
      console.error('Failed to generate report:', err);
      throw err;
    }
  };

  const handleExportReport = async (reportId: string, format: ExportFormat) => {
    try {
      const exportRecord = await exportReport(reportId, format);
      console.log('Export created:', exportRecord);
      
      // In a real app, you would handle the download
      if (exportRecord.downloadUrl) {
        window.open(exportRecord.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  const handleDashboardSave = async (layout: any) => {
    try {
      await updateDashboard(layout.id, layout);
      console.log('Dashboard saved:', layout);
    } catch (err) {
      console.error('Failed to save dashboard:', err);
    }
  };

  const demoActions = [
    {
      id: 'generate-performance',
      label: 'Generate Performance Report',
      icon: BarChart3,
      action: () => handleGenerateReport({
        id: 'demo-performance',
        name: 'Student Performance Report',
        type: ReportType.STUDENT_PERFORMANCE,
        userRole,
        parameters: [],
        format: [ExportFormat.PDF]
      })
    },
    {
      id: 'predict-performance',
      label: 'Predict Student Performance',
      icon: TrendingUp,
      action: async () => {
        try {
          const prediction = await predictStudentPerformance('1');
          console.log('Performance prediction:', prediction);
          alert(`Predicted grade: ${prediction.predictedGrade}% (Risk: ${prediction.riskLevel})`);
        } catch (err) {
          console.error('Prediction failed:', err);
        }
      }
    },
    {
      id: 'compare-courses',
      label: 'Compare Courses',
      icon: BookOpen,
      action: async () => {
        try {
          const comparison = await compareCourses('1', ['2']);
          console.log('Course comparison:', comparison);
          alert('Course comparison completed - check console for details');
        } catch (err) {
          console.error('Comparison failed:', err);
        }
      }
    },
    {
      id: 'refresh-data',
      label: 'Refresh Data',
      icon: RefreshCw,
      action: refreshData
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reporting System Demo</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and analytics dashboard for {userRole.toLowerCase()}s
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Role: {userRole}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoActions.map(action => (
          <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <action.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <Button
                variant="ghost"
                size="sm"
                onClick={action.action}
                disabled={isLoading}
                className="w-full"
              >
                {action.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{mockData.users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Courses</p>
                <p className="text-2xl font-bold">{mockData.courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Reports Generated</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${mockData.payments.reduce((sum, p) => sum + p.amount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeDemo} onValueChange={setActiveDemo}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdvancedReportingDashboard
            userRole={userRole}
            userId={userId}
            onReportGenerate={handleGenerateReport}
            onExportReport={handleExportReport}
            onDashboardSave={handleDashboardSave}
          />
        </TabsContent>

        <TabsContent value="builder">
          <ReportBuilder
            userRole={userRole}
            onSave={async (config) => {
              console.log('Saving report config:', config);
              // In a real app, you would save to backend
            }}
            onGenerate={handleGenerateReport}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.map(metric => (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {metric.value}{metric.unit}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        {metric.trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                        )}
                        {metric.trend.percentage}% {metric.trend.period}
                      </div>
                      {metric.benchmark && (
                        <div className="text-xs text-muted-foreground">
                          Benchmark: {metric.benchmark}{metric.unit}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {reports.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Reports</h3>
                <div className="space-y-2">
                  {reports.slice(0, 5).map(report => (
                    <Card key={report.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Report #{report.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.metadata.totalRecords} records • 
                              Generated {report.metadata.generatedAt.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportReport(report.id, ExportFormat.PDF)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportReport(report.id, ExportFormat.CSV)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export CSV
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p>Processing...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}