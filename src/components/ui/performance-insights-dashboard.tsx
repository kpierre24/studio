"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendChart } from '@/components/ui/trend-chart'
import { GradeDistribution } from '@/components/ui/grade-distribution'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

import {
  StudentPerformanceData,
  RiskAssessment,
  PerformanceTrend,
  InterventionRecommendation,
  TeacherAlert,
  CohortComparison
} from '@/types/performance-insights'

interface PerformanceInsightsDashboardProps {
  courseId: string
  teacherId: string
  studentsData: StudentPerformanceData[]
  className?: string
}

export function PerformanceInsightsDashboard({
  courseId,
  teacherId,
  studentsData,
  className
}: PerformanceInsightsDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock dashboard data
      const mockData = generateMockDashboardData(studentsData, courseId, teacherId)
      setDashboardData(mockData)
      setIsLoading(false)
    }

    loadDashboardData()
  }, [studentsData, courseId, teacherId])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No performance data available
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("space-y-6", className)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Insights</h2>
          <p className="text-muted-foreground">
            Early intervention system and student analytics
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Bell className="w-4 h-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {dashboardData.priorityAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {dashboardData.priorityAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab data={dashboardData} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsTab alerts={dashboardData.priorityAlerts} />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentsTab 
            students={dashboardData.studentAnalyses}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
          />
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <CohortTab cohortData={dashboardData.cohortAnalysis} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// Overview Tab Component
function OverviewTab({ data }: { data: any }) {
  return (
    <motion.div variants={staggerContainer} className="space-y-6">
      {/* Key Metrics */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={data.overview.totalStudents}
          icon={Users}
          trend="stable"
        />
        <MetricCard
          title="At Risk"
          value={data.overview.atRiskStudents}
          icon={AlertTriangle}
          trend="warning"
          color="destructive"
        />
        <MetricCard
          title="Avg Performance"
          value={`${data.overview.averagePerformance}%`}
          icon={Target}
          trend={data.trends.performanceTrend}
        />
        <MetricCard
          title="Engagement"
          value={`${Math.round(data.overview.engagementScore * 100)}%`}
          icon={Activity}
          trend={data.trends.engagementTrend}
        />
      </motion.div>

      {/* Action Items */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Priority Action Items
            </CardTitle>
            <CardDescription>
              Immediate actions needed based on student performance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.actionItems.map((item: any, index: number) => (
                <ActionItem key={index} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Trends */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Overall class performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={generateMockTrendData('performance')}
              height={200}
              color="hsl(var(--primary))"
              showArea={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
            <CardDescription>Student engagement metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={generateMockTrendData('engagement')}
              height={200}
              color="hsl(var(--success))"
              showArea={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Alerts Tab Component
function AlertsTab({ alerts }: { alerts: TeacherAlert[] }) {
  return (
    <motion.div variants={staggerContainer} className="space-y-4">
      {alerts.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>No Priority Alerts</AlertTitle>
            <AlertDescription>
              All students are performing within acceptable ranges.
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        alerts.map((alert, index) => (
          <motion.div key={alert.id} variants={staggerItem}>
            <AlertCard alert={alert} />
          </motion.div>
        ))
      )}
    </motion.div>
  )
}

// Students Tab Component
function StudentsTab({ 
  students, 
  selectedStudent, 
  onSelectStudent 
}: { 
  students: any[]
  selectedStudent: string | null
  onSelectStudent: (studentId: string | null) => void
}) {
  return (
    <motion.div variants={staggerContainer} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>Click to view detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {students.map((student) => (
                  <StudentListItem
                    key={student.studentId}
                    student={student}
                    isSelected={selectedStudent === student.studentId}
                    onClick={() => onSelectStudent(
                      selectedStudent === student.studentId ? null : student.studentId
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Details */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          {selectedStudent ? (
            <StudentDetailView 
              student={students.find(s => s.studentId === selectedStudent)}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                Select a student to view detailed analysis
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// Cohort Tab Component
function CohortTab({ cohortData }: { cohortData: CohortComparison }) {
  return (
    <motion.div variants={staggerContainer} className="space-y-6">
      {/* Cohort Metrics */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Average Grade"
          value={`${cohortData.metrics.averageGrade}%`}
          icon={Target}
          trend="stable"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${Math.round(cohortData.metrics.attendanceRate * 100)}%`}
          icon={Clock}
          trend="stable"
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round(cohortData.metrics.completionRate * 100)}%`}
          icon={CheckCircle}
          trend="stable"
        />
      </motion.div>

      {/* Grade Distribution */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Distribution of grades across the cohort</CardDescription>
          </CardHeader>
          <CardContent>
            <GradeDistribution
              data={cohortData.metrics.gradeDistribution.map(d => ({
                grade: d.range.split(' ')[0],
                count: d.count,
                percentage: d.percentage
              }))}
              height={300}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "default" 
}: {
  title: string
  value: string | number
  icon: any
  trend: 'improving' | 'declining' | 'stable' | 'warning'
  color?: 'default' | 'destructive'
}) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl font-bold",
              color === 'destructive' && "text-destructive"
            )}>
              {value}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <Icon className={cn(
              "w-8 h-8",
              color === 'destructive' ? "text-destructive" : "text-muted-foreground"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionItem({ item }: { item: any }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      <Badge variant={getPriorityColor(item.priority)}>
        {item.priority}
      </Badge>
      <div className="flex-1">
        <p className="font-medium">{item.description}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
        </p>
        <p className="text-sm mt-2">{item.suggestedAction}</p>
      </div>
      <Button size="sm" variant="outline">
        Take Action
      </Button>
    </div>
  )
}

function AlertCard({ alert }: { alert: TeacherAlert }) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'warning': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <Alert variant={getSeverityVariant(alert.severity) as any}>
      {getSeverityIcon(alert.severity)}
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription className="mt-2">
        {alert.message}
        {alert.actionRequired && (
          <div className="mt-3">
            <Button size="sm" variant="outline">
              Take Action
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

function StudentListItem({ 
  student, 
  isSelected, 
  onClick 
}: { 
  student: any
  isSelected: boolean
  onClick: () => void
}) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 text-left hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Student {student.studentId}</p>
          <p className="text-sm text-muted-foreground">
            Risk: <span className={getRiskColor(student.riskAssessment.riskLevel)}>
              {student.riskAssessment.riskLevel}
            </span>
          </p>
        </div>
        <Badge variant="outline">
          {student.riskAssessment.riskScore}%
        </Badge>
      </div>
    </button>
  )
}

function StudentDetailView({ student }: { student: any }) {
  if (!student) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Analysis</CardTitle>
          <CardDescription>Detailed performance insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <Badge variant={student.riskAssessment.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                {student.riskAssessment.riskLevel} ({student.riskAssessment.riskScore}%)
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interventions</p>
              <p className="text-lg font-semibold">{student.interventions.length}</p>
            </div>
          </div>

          {student.interventions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recommended Interventions</h4>
              <div className="space-y-2">
                {student.interventions.slice(0, 3).map((intervention: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{intervention.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intervention.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// Mock data generators
function generateMockDashboardData(studentsData: StudentPerformanceData[], courseId: string, teacherId: string) {
  // This would normally come from the PerformanceInsightsService
  return {
    overview: {
      totalStudents: studentsData.length,
      atRiskStudents: Math.floor(studentsData.length * 0.2),
      averagePerformance: 78.5,
      engagementScore: 0.72
    },
    trends: {
      performanceTrend: 'stable' as const,
      engagementTrend: 'improving' as const,
      attendanceTrend: 'stable' as const
    },
    actionItems: [
      {
        priority: 'urgent',
        description: 'Students at critical risk of failure',
        studentCount: 2,
        suggestedAction: 'Schedule immediate one-on-one meetings'
      },
      {
        priority: 'high',
        description: 'Students with attendance concerns',
        studentCount: 5,
        suggestedAction: 'Contact students to address barriers'
      }
    ],
    priorityAlerts: [
      {
        id: '1',
        severity: 'critical',
        title: 'URGENT: Student at Critical Risk',
        message: 'Student shows multiple risk factors requiring immediate attention',
        actionRequired: true
      }
    ],
    studentAnalyses: studentsData.map(student => ({
      studentId: student.studentId,
      riskAssessment: {
        riskLevel: Math.random() > 0.7 ? 'high' : 'medium',
        riskScore: Math.floor(Math.random() * 40) + 30
      },
      interventions: [
        {
          title: 'Academic Support',
          description: 'Provide additional tutoring sessions'
        }
      ]
    })),
    cohortAnalysis: {
      courseId,
      metrics: {
        averageGrade: 78.5,
        attendanceRate: 0.85,
        completionRate: 0.78,
        gradeDistribution: [
          { range: 'A (90-100)', count: 5, percentage: 20 },
          { range: 'B (80-89)', count: 8, percentage: 32 },
          { range: 'C (70-79)', count: 7, percentage: 28 },
          { range: 'D (60-69)', count: 3, percentage: 12 },
          { range: 'F (0-59)', count: 2, percentage: 8 }
        ]
      }
    }
  }
}

function generateMockTrendData(type: 'performance' | 'engagement') {
  const data = []
  const baseValue = type === 'performance' ? 75 : 65
  
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: baseValue + Math.random() * 20 - 10
    })
  }
  
  return data
}