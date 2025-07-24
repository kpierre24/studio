"use client"

import { useState, useEffect, useCallback } from 'react'
import { PerformanceInsightsService } from '@/lib/performance-insights'
import {
  StudentPerformanceData,
  RiskAssessment,
  PerformanceTrend,
  InterventionRecommendation,
  LearningRecommendation,
  TeacherAlert,
  CohortComparison,
  PerformanceInsightsConfig
} from '@/types/performance-insights'

interface UsePerformanceInsightsOptions {
  courseId: string
  teacherId: string
  config?: Partial<PerformanceInsightsConfig>
  refreshInterval?: number
}

interface PerformanceInsightsState {
  isLoading: boolean
  error: string | null
  dashboardData: {
    overview: {
      totalStudents: number
      atRiskStudents: number
      averagePerformance: number
      attendanceRate: number
      engagementScore: number
    }
    alerts: TeacherAlert[]
    trends: {
      performanceTrend: 'improving' | 'declining' | 'stable'
      engagementTrend: 'improving' | 'declining' | 'stable'
      attendanceTrend: 'improving' | 'declining' | 'stable'
    }
    actionItems: Array<{
      priority: 'urgent' | 'high' | 'medium'
      description: string
      studentCount: number
      suggestedAction: string
    }>
    studentAnalyses: Array<{
      studentId: string
      riskAssessment: RiskAssessment
      trends: PerformanceTrend
      interventions: InterventionRecommendation[]
      alerts: TeacherAlert[]
    }>
    cohortAnalysis: CohortComparison
    summaryInsights: {
      highRiskStudents: number
      studentsNeedingIntervention: number
      commonIssues: string[]
      recommendations: string[]
    }
  } | null
  lastUpdated: Date | null
}

// Mock data generator for development
function generateMockStudentData(courseId: string, count: number = 25): StudentPerformanceData[] {
  const students: StudentPerformanceData[] = []
  
  for (let i = 1; i <= count; i++) {
    const studentId = `student-${i}`
    const currentGrade = Math.random() * 40 + 60 // 60-100 range
    const attendanceRate = Math.random() * 0.3 + 0.7 // 70-100% range
    
    // Generate assignment scores
    const assignmentScores = []
    for (let j = 1; j <= 8; j++) {
      const score = Math.random() * 30 + 70 // 70-100 range
      const maxScore = 100
      const submittedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const isLate = Math.random() < 0.2 // 20% chance of being late
      
      assignmentScores.push({
        assignmentId: `assignment-${j}`,
        score,
        maxScore,
        submittedAt,
        isLate,
        timeSpent: Math.random() * 120 + 30 // 30-150 minutes
      })
    }

    students.push({
      studentId,
      courseId,
      currentGrade,
      assignmentScores,
      attendanceRate,
      engagementMetrics: {
        loginFrequency: Math.random() * 5 + 2, // 2-7 logins per week
        timeSpentOnPlatform: Math.random() * 200 + 100, // 100-300 minutes per week
        lessonCompletionRate: Math.random() * 0.3 + 0.7, // 70-100%
        assignmentSubmissionRate: Math.random() * 0.2 + 0.8, // 80-100%
        forumParticipation: Math.random() * 3, // 0-3 posts per week
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
      },
      learningVelocity: {
        averageTimePerLesson: Math.random() * 30 + 45, // 45-75 minutes
        averageTimePerAssignment: Math.random() * 60 + 90, // 90-150 minutes
        completionTrend: Math.random() > 0.6 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'declining'
      }
    })
  }
  
  return students
}

export function usePerformanceInsights(options: UsePerformanceInsightsOptions) {
  const { courseId, teacherId, config, refreshInterval } = options
  
  const [state, setState] = useState<PerformanceInsightsState>({
    isLoading: true,
    error: null,
    dashboardData: null,
    lastUpdated: null
  })

  const [service] = useState(() => new PerformanceInsightsService(config || {
    riskThresholds: {
      gradeThreshold: 70,
      attendanceThreshold: 80,
      engagementThreshold: 60,
      submissionRateThreshold: 85
    },
    alertSettings: {
      enableEmailAlerts: true,
      enablePushNotifications: true,
      alertFrequency: 'daily' as const
    },
    interventionSettings: {
      autoTriggerInterventions: false,
      interventionTypes: ['email', 'meeting', 'resource']
    }
  }))

  const fetchInsights = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Generate mock student data for demonstration
      const studentsData = generateMockStudentData(courseId, 25)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Analyze multiple students
      const analysisResult = await service.analyzeMultipleStudents(studentsData, teacherId)
      
      // Generate teacher dashboard
      const dashboardOverview = service.generateTeacherDashboard(studentsData, teacherId)
      
      // Combine results
      const dashboardData = {
        overview: dashboardOverview.overview,
        alerts: dashboardOverview.alerts,
        trends: dashboardOverview.trends,
        actionItems: dashboardOverview.actionItems,
        studentAnalyses: analysisResult.studentAnalyses,
        cohortAnalysis: analysisResult.cohortAnalysis,
        summaryInsights: analysisResult.summaryInsights
      }
      
      setState({
        isLoading: false,
        error: null,
        dashboardData,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch performance insights'
      }))
    }
  }, [courseId, teacherId, service])

  const analyzeStudent = useCallback(async (studentData: StudentPerformanceData) => {
    try {
      const result = await service.analyzeStudent(studentData, teacherId, true)
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze student')
    }
  }, [service, teacherId])

  const updateConfig = useCallback((newConfig: Partial<PerformanceInsightsConfig>) => {
    service.updateConfig(newConfig)
  }, [service])

  const refresh = useCallback(() => {
    fetchInsights()
  }, [fetchInsights])

  // Initial fetch
  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchInsights()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchInsights, refreshInterval])

  return {
    ...state,
    analyzeStudent,
    updateConfig,
    refresh
  }
}

// Hook for individual student analysis
export function useStudentAnalysis(
  studentData: StudentPerformanceData | null,
  teacherId: string,
  config?: Partial<PerformanceInsightsConfig>
) {
  const [state, setState] = useState<{
    isLoading: boolean
    error: string | null
    analysis: {
      riskAssessment: RiskAssessment
      trends: PerformanceTrend
      interventions: InterventionRecommendation[]
      learningRecommendations: LearningRecommendation[]
      alerts: TeacherAlert[]
    } | null
  }>({
    isLoading: false,
    error: null,
    analysis: null
  })

  const [service] = useState(() => new PerformanceInsightsService(config || {
    riskThresholds: {
      gradeThreshold: 70,
      attendanceThreshold: 80,
      engagementThreshold: 60,
      submissionRateThreshold: 85
    },
    alertSettings: {
      enableEmailAlerts: true,
      enablePushNotifications: true,
      alertFrequency: 'daily' as const
    },
    interventionSettings: {
      autoTriggerInterventions: false,
      interventionTypes: ['email', 'meeting', 'resource']
    }
  }))

  const analyzeStudent = useCallback(async () => {
    if (!studentData) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await service.analyzeStudent(studentData, teacherId, false)
      
      setState({
        isLoading: false,
        error: null,
        analysis: result
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze student'
      }))
    }
  }, [studentData, teacherId, service])

  useEffect(() => {
    if (studentData) {
      analyzeStudent()
    }
  }, [analyzeStudent, studentData])

  return {
    ...state,
    refresh: analyzeStudent
  }
}

// Hook for real-time alerts
export function usePerformanceAlerts(
  courseId: string,
  teacherId: string,
  config?: Partial<PerformanceInsightsConfig>
) {
  const [alerts, setAlerts] = useState<TeacherAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, readAt: new Date() } : alert
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, readAt: new Date() })))
    setUnreadCount(0)
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Simulate real-time alerts (in a real app, this would use WebSocket or Server-Sent Events)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate new alerts for demo
      if (Math.random() < 0.1) { // 10% chance every interval
        const newAlert: TeacherAlert = {
          id: `alert-${Date.now()}`,
          teacherId,
          courseId,
          studentId: `student-${Math.floor(Math.random() * 25) + 1}`,
          type: 'performance_decline',
          severity: Math.random() > 0.7 ? 'critical' : 'warning',
          title: 'Performance Alert',
          message: 'Student showing declining performance indicators',
          data: {},
          actionRequired: true,
          createdAt: new Date()
        }
        
        setAlerts(prev => [newAlert, ...prev].slice(0, 50)) // Keep only latest 50
        setUnreadCount(prev => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [courseId, teacherId])

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissAlert
  }
}