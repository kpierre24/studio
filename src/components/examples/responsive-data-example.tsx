"use client";

import { useState } from "react";
import { Eye, Edit, Trash2, Download, Users, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { CollapsibleSection, CollapsibleSections } from "@/components/ui/collapsible-section";
import { MobileChart, MobileChartGrid, ChartSummary } from "@/components/ui/mobile-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample data
const studentsData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    grade: "A",
    attendance: 95,
    lastActive: "2024-01-15",
    status: "active"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    grade: "B+",
    attendance: 87,
    lastActive: "2024-01-14",
    status: "active"
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol@example.com",
    grade: "A-",
    attendance: 92,
    lastActive: "2024-01-13",
    status: "inactive"
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david@example.com",
    grade: "B",
    attendance: 78,
    lastActive: "2024-01-12",
    status: "active"
  },
  {
    id: 5,
    name: "Eva Brown",
    email: "eva@example.com",
    grade: "A+",
    attendance: 98,
    lastActive: "2024-01-15",
    status: "active"
  }
];

const chartData = [
  { month: 'Jan', students: 120, assignments: 45 },
  { month: 'Feb', students: 135, assignments: 52 },
  { month: 'Mar', students: 148, assignments: 48 },
  { month: 'Apr', students: 162, assignments: 61 },
  { month: 'May', students: 175, assignments: 55 },
  { month: 'Jun', students: 188, assignments: 67 }
];

const gradeDistribution = [
  { grade: 'A+', count: 25 },
  { grade: 'A', count: 45 },
  { grade: 'B+', count: 35 },
  { grade: 'B', count: 28 },
  { grade: 'C+', count: 15 },
  { grade: 'C', count: 8 }
];

export function ResponsiveDataExample() {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      priority: 'high' as const,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground lg:hidden">{row.email}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      priority: 'low' as const
    },
    {
      key: 'grade',
      label: 'Grade',
      sortable: true,
      priority: 'high' as const,
      render: (value: string) => (
        <Badge variant={value.startsWith('A') ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      sortable: true,
      priority: 'medium' as const,
      render: (value: number) => `${value}%`
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      sortable: true,
      priority: 'low' as const
    },
    {
      key: 'status',
      label: 'Status',
      priority: 'medium' as const,
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    }
  ];

  const tableActions = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: any) => console.log('View', row)
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: any) => console.log('Edit', row)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: any) => console.log('Delete', row),
      variant: 'destructive' as const
    }
  ];

  const charts = [
    {
      id: 'students',
      title: 'Student Enrollment',
      type: 'line' as const,
      data: chartData,
      xKey: 'month',
      yKey: 'students',
      color: '#8884d8'
    },
    {
      id: 'assignments',
      title: 'Assignments Created',
      type: 'bar' as const,
      data: chartData,
      xKey: 'month',
      yKey: 'assignments',
      color: '#82ca9d'
    },
    {
      id: 'grades',
      title: 'Grade Distribution',
      type: 'pie' as const,
      data: gradeDistribution,
      xKey: 'grade',
      yKey: 'count',
      color: '#ffc658'
    }
  ];

  const collapsibleSections = [
    {
      id: 'overview',
      title: 'Course Overview',
      icon: <BookOpen className="h-4 w-4" />,
      badge: <Badge variant="secondary">5 courses</Badge>,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ChartSummary
              title="Total Students"
              value="188"
              change={{ value: 12.5, period: "last month" }}
            />
            <ChartSummary
              title="Active Courses"
              value="12"
              change={{ value: -2.1, period: "last month" }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your courses are performing well with steady enrollment growth.
          </p>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      icon: <TrendingUp className="h-4 w-4" />,
      content: (
        <MobileChartGrid charts={charts} />
      )
    },
    {
      id: 'schedule',
      title: 'Class Schedule',
      icon: <Calendar className="h-4 w-4" />,
      badge: <Badge>3 today</Badge>,
      content: (
        <div className="space-y-3">
          {[
            { time: '9:00 AM', class: 'Mathematics 101', room: 'Room A-201' },
            { time: '11:00 AM', class: 'Physics Lab', room: 'Lab B-105' },
            { time: '2:00 PM', class: 'Chemistry', room: 'Room C-301' }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">{item.class}</div>
                <div className="text-sm text-muted-foreground">{item.room}</div>
              </div>
              <div className="text-sm font-medium">{item.time}</div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Responsive Data Display</h1>
        <p className="text-muted-foreground">
          Examples of mobile-optimized data display components including tables, charts, and collapsible sections.
        </p>
      </div>

      {/* Chart Summaries with Horizontal Scroll */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
        <HorizontalScroll showScrollButtons showIndicators>
          <ChartSummary
            title="Total Students"
            value="188"
            change={{ value: 12.5, period: "last month" }}
            chart={{
              data: chartData,
              xKey: 'month',
              yKey: 'students',
              color: '#8884d8'
            }}
            className="min-w-[200px]"
          />
          <ChartSummary
            title="Active Courses"
            value="12"
            change={{ value: -2.1, period: "last month" }}
            className="min-w-[200px]"
          />
          <ChartSummary
            title="Assignments"
            value="67"
            change={{ value: 8.3, period: "last month" }}
            className="min-w-[200px]"
          />
          <ChartSummary
            title="Avg. Grade"
            value="B+"
            change={{ value: 5.2, period: "last month" }}
            className="min-w-[200px]"
          />
        </HorizontalScroll>
      </div>

      {/* Collapsible Sections */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dashboard Sections</h2>
        <CollapsibleSections
          sections={collapsibleSections}
          allowMultiple={true}
          variant="card"
        />
      </div>

      {/* Mobile-Optimized Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Student Management</h2>
        <MobileTable
          data={studentsData}
          columns={tableColumns}
          actions={tableActions}
          searchable
          selectable
          onRowClick={(row) => console.log('Row clicked:', row)}
          emptyMessage="No students found"
        />
      </div>

      {/* Chart Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Analytics Charts</h2>
        <MobileChartGrid charts={charts} />
      </div>

      {/* Wide Content with Horizontal Scroll */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Course Timeline</h2>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalScroll>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <Card key={day} className="min-w-[200px] bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[1, 2, 3].map((slot) => (
                      <div key={slot} className="p-2 bg-background rounded text-xs">
                        <div className="font-medium">Class {slot}</div>
                        <div className="text-muted-foreground">9:00 AM</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </HorizontalScroll>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}