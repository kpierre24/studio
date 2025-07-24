// Performance Insights and Early Intervention System Types

export interface StudentPerformanceData {
  studentId: string
  courseId: string
  currentGrade: number
  assignmentScores: Array<{
    assignmentId: string
    score: number
    maxScore: number
    submittedAt: Date
    isLate: boolean
    timeSpent?: number // in minutes
  }>
  attendanceRate: number
  engagementMetrics: {
    loginFrequency: number // logins per week
    timeSpentOnPlatform: number // minutes per week
    lessonCompletionRate: number
    assignmentSubmissionRate: number
    forumParticipation: number
    lastActivity: Date
  }
  learningVelocity: {
    averageTimePerLesson: number
    averageTimePerAssignment: number
    completionTrend: 'improving' | 'declining' | 'stable'
  }
}

export interface RiskAssessment {
  studentId: string
  courseId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number // 0-100
  riskFactors: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high'
    description: string
    impact: number // 0-1
  }>
  predictedOutcome: {
    finalGrade: number
    passLikelihood: number
    completionLikelihood: number
  }
  lastAssessed: Date
}

export interface PerformanceTrend {
  studentId: string
  courseId: string
  timeframe: 'week' | 'month' | 'semester'
  trends: {
    gradesTrend: {
      direction: 'improving' | 'declining' | 'stable'
      slope: number
      confidence: number
      dataPoints: Array<{
        date: Date
        value: number
        assignment?: string
      }>
    }
    engagementTrend: {
      direction: 'improving' | 'declining' | 'stable'
      slope: number
      confidence: number
      dataPoints: Array<{
        date: Date
        value: number
        metric: string
      }>
    }
    attendanceTrend: {
      direction: 'improving' | 'declining' | 'stable'
      slope: number
      confidence: number
      dataPoints: Array<{
        date: Date
        value: number
      }>
    }
  }
}

export interface InterventionRecommendation {
  id: string
  studentId: string
  courseId: string
  type: 'academic' | 'engagement' | 'attendance' | 'behavioral'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  suggestedActions: Array<{
    action: string
    timeline: string
    responsible: 'teacher' | 'student' | 'admin'
    resources?: string[]
  }>
  expectedOutcome: string
  createdAt: Date
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
}

export interface TeacherAlert {
  id: string
  teacherId: string
  courseId: string
  studentId: string
  type: 'performance_decline' | 'attendance_issue' | 'engagement_drop' | 'assignment_pattern' | 'risk_escalation'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  data: Record<string, any>
  actionRequired: boolean
  createdAt: Date
  readAt?: Date
  resolvedAt?: Date
}

export interface LearningRecommendation {
  id: string
  studentId: string
  courseId: string
  type: 'content' | 'study_method' | 'schedule' | 'resource'
  title: string
  description: string
  reasoning: string
  resources: Array<{
    type: 'lesson' | 'assignment' | 'external' | 'practice'
    title: string
    url?: string
    estimatedTime?: number
  }>
  priority: number // 1-10
  createdAt: Date
  status: 'active' | 'completed' | 'dismissed'
}

export interface CohortComparison {
  courseId: string
  timeframe: 'week' | 'month' | 'semester'
  metrics: {
    averageGrade: number
    medianGrade: number
    gradeDistribution: Array<{
      range: string
      count: number
      percentage: number
    }>
    attendanceRate: number
    completionRate: number
    engagementScore: number
  }
  studentComparisons: Array<{
    studentId: string
    percentileRank: number
    performanceRelativeToAverage: number
    strengths: string[]
    improvementAreas: string[]
  }>
}

export interface PredictiveModel {
  modelId: string
  type: 'grade_prediction' | 'completion_prediction' | 'risk_assessment'
  accuracy: number
  lastTrained: Date
  features: string[]
  predictions: Array<{
    studentId: string
    courseId: string
    prediction: number
    confidence: number
    factors: Array<{
      feature: string
      importance: number
      value: number
    }>
  }>
}

export interface PerformanceInsightsConfig {
  riskThresholds: {
    gradeThreshold: number
    attendanceThreshold: number
    engagementThreshold: number
    submissionRateThreshold: number
  }
  alertSettings: {
    enableAutomaticAlerts: boolean
    alertFrequency: 'immediate' | 'daily' | 'weekly'
    escalationRules: Array<{
      condition: string
      action: string
      delay: number // hours
    }>
  }
  predictionSettings: {
    enablePredictions: boolean
    updateFrequency: 'daily' | 'weekly'
    confidenceThreshold: number
  }
}