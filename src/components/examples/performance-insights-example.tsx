"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Bell, 
  Settings,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PerformanceInsightsDashboard } from '@/components/ui/performance-insights-dashboard'
import { usePerformanceInsights, usePerformanceAlerts } from '@/hooks/usePerformanceInsights'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

interface PerformanceInsightsExampleProps {
  className?: string
}

export function PerformanceInsightsExample({ className }: PerformanceInsightsExampleProps) {
  const [selectedCourse, setSelectedCourse] = useState('math-101')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const teacherId = 'teacher-1'
  
  // Use the performance insights hook
  const {
    isLoading,
    error,
    dashboardData,
    lastUpdated,
    refresh
  } = usePerformanceInsights({
    courseId: selectedCourse,
    teacherId,
    refreshInterval: alertsEnabled ? 60000 : undefined // Refresh every minute if alerts enabled
  })

  // Use the alerts hook
  const {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissAlert
  } = usePerformanceAlerts(selectedCourse, teacherId)

  const mockCourses = [
    { id: 'math-101', name: 'Advanced Mathematics', students: 25 },
    { id: 'physics-201', name: 'Quantum Physics', students: 18 },
    { id: 'cs-301', name: 'Data Structures', students: 32 }
  ]

  const mockStudentsData = [
    {
      studentId: 'student-1',
      courseId: selectedCourse,
      currentGrade: 78,
      assignmentScores: [],
      attendanceRate: 0.85,
      engagementMetrics: {
        loginFrequency: 4,
        timeSpentOnPlatform: 180,
        lessonCompletionRate: 0.8,
        assignmentSubmissionRate: 0.9,
        forumParticipation: 2,
        lastActivity: new Date()
      },
      learningVelocity: {
        averageTimePerLesson: 60,
        averageTimePerAssignment: 120,
        completionTrend: 'stable' as const
      }
    }
  ]

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Performance Insights</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Insights & Early Intervention</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered student analytics and automated intervention recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Course Selector */}
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {mockCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} ({course.students} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Alerts Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="relative"
          >
            <Bell className="w-4 h-4 mr-2" />
            Alerts
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          variants={staggerItem}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights Settings</CardTitle>
              <CardDescription>
                Configure alerts, thresholds, and monitoring preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Alert Settings</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alerts-enabled">Enable Automatic Alerts</Label>
                    <Switch
                      id="alerts-enabled"
                      checked={alertsEnabled}
                      onCheckedChange={setAlertsEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alert Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Risk Thresholds</h4>
                  <div className="space-y-2">
                    <Label>Grade Threshold</Label>
                    <Select defaultValue="70">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="65">65%</SelectItem>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance Threshold</Label>
                    <Select defaultValue="80">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="85">85%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Monitoring</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="predictions-enabled">Enable Predictions</Label>
                    <Switch id="predictions-enabled" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Update Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowSettings(false)}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Status Bar */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isLoading ? "bg-yellow-500" : "bg-green-500"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? 'Analyzing...' : 'System Active'}
                  </span>
                </div>
                
                {lastUpdated && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {mockCourses.find(c => c.id === selectedCourse)?.students || 0} students monitored
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Alerts
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      !alert.readAt && "bg-muted/50"
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        {alert.readAt ? 'Read' : 'Mark Read'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Dashboard */}
      <motion.div variants={staggerItem}>
        {dashboardData ? (
          <PerformanceInsightsDashboard
            courseId={selectedCourse}
            teacherId={teacherId}
            studentsData={mockStudentsData}
          />
        ) : (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading performance insights...</p>
          </div>
        )}
      </motion.div>

      {/* Feature Highlights */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>
              Advanced analytics and intervention capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<AlertTriangle className="w-6 h-6" />}
                title="At-Risk Identification"
                description="AI algorithms identify students at risk of failure based on multiple performance indicators"
                status="Active"
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Performance Trends"
                description="Visual trend analysis with predictive modeling for grade and engagement patterns"
                status="Active"
              />
              <FeatureCard
                icon={<Bell className="w-6 h-6" />}
                title="Automated Alerts"
                description="Real-time notifications for teachers when students show declining performance"
                status="Active"
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Cohort Analysis"
                description="Comparative performance analysis across different student groups and time periods"
                status="Active"
              />
              <FeatureCard
                icon={<Settings className="w-6 h-6" />}
                title="Intervention Engine"
                description="Personalized recommendations for struggling students with actionable intervention strategies"
                status="Active"
              />
              <FeatureCard
                icon={<RefreshCw className="w-6 h-6" />}
                title="Predictive Models"
                description="Grade prediction and completion likelihood based on assignment submission patterns"
                status="Active"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  status 
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: string
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="text-primary">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{title}</h4>
            <Badge variant="secondary" className="text-xs">
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}