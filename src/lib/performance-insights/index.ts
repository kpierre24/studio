// Performance Insights and Early Intervention System
// Main entry point for all performance analysis functionality

export { RiskAssessmentEngine, defaultRiskConfig } from './risk-assessment'
export { TrendAnalysisEngine } from './trend-analysis'
export { InterventionEngine } from './intervention-engine'
export { AlertSystem } from './alert-system'
export { CohortAnalysisEngine } from './cohort-analysis'

import { RiskAssessmentEngine, defaultRiskConfig } from './risk-assessment'
import { TrendAnalysisEngine } from './trend-analysis'
import { InterventionEngine } from './intervention-engine'
import { AlertSystem } from './alert-system'
import { CohortAnalysisEngine } from './cohort-analysis'

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

/**
 * Main Performance Insights Service
 * Orchestrates all performance analysis and intervention functionality
 */
export class PerformanceInsightsService {
  private riskEngine: RiskAssessmentEngine
  private trendEngine: TrendAnalysisEngine
  private interventionEngine: InterventionEngine
  private alertSystem: AlertSystem
  private cohortEngine: CohortAnalysisEngine
  private config: PerformanceInsightsConfig

  constructor(config: PerformanceInsightsConfig = defaultRiskConfig) {
    this.config = config
    this.riskEngine = new RiskAssessmentEngine(config)
    this.trendEngine = new TrendAnalysisEngine()
    this.interventionEngine = new InterventionEngine()
    this.alertSystem = new AlertSystem(config)
    this.cohortEngine = new CohortAnalysisEngine()
  }

  /**
   * Comprehensive analysis for a single student
   */
  async analyzeStudent(
    performanceData: StudentPerformanceData,
    teacherId: string,
    includeComparisons: boolean = true
  ): Promise<{
    riskAssessment: RiskAssessment
    trends: PerformanceTrend
    interventions: InterventionRecommendation[]
    learningRecommendations: LearningRecommendation[]
    alerts: TeacherAlert[]
    cohortComparison?: CohortComparison
  }> {
    // Perform risk assessment
    const riskAssessment = this.riskEngine.assessStudentRisk(performanceData)

    // Analyze performance trends
    const trends = this.trendEngine.analyzePerformanceTrends(performanceData)

    // Generate interventions
    const interventions = this.interventionEngine.generateInterventions(
      riskAssessment,
      performanceData,
      trends
    )

    // Generate learning recommendations
    const learningRecommendations = this.interventionEngine.generateLearningRecommendations(
      performanceData,
      riskAssessment
    )

    // Generate alerts for teachers
    const alerts = this.alertSystem.generateAlerts(
      riskAssessment,
      performanceData,
      teacherId,
      trends
    )

    const result = {
      riskAssessment,
      trends,
      interventions,
      learningRecommendations,
      alerts
    }

    // Add cohort comparison if requested
    if (includeComparisons) {
      // In a real implementation, this would fetch cohort data from the database
      // For demo purposes, we'll skip this or use mock data
      // const cohortData = await this.fetchCohortData(performanceData.courseId)
      // const cohortComparison = this.cohortEngine.analyzeCohortPerformance(cohortData, performanceData.courseId)
      // result.cohortComparison = cohortComparison
    }

    return result
  }

  /**
   * Batch analysis for multiple students
   */
  async analyzeMultipleStudents(
    studentsData: StudentPerformanceData[],
    teacherId: string
  ): Promise<{
    studentAnalyses: Array<{
      studentId: string
      riskAssessment: RiskAssessment
      trends: PerformanceTrend
      interventions: InterventionRecommendation[]
      alerts: TeacherAlert[]
    }>
    cohortAnalysis: CohortComparison
    priorityAlerts: TeacherAlert[]
    summaryInsights: {
      highRiskStudents: number
      studentsNeedingIntervention: number
      commonIssues: string[]
      recommendations: string[]
    }
  }> {
    const studentAnalyses = []
    const allAlerts: TeacherAlert[] = []

    // Analyze each student
    for (const studentData of studentsData) {
      const riskAssessment = this.riskEngine.assessStudentRisk(studentData)
      const trends = this.trendEngine.analyzePerformanceTrends(studentData)
      const interventions = this.interventionEngine.generateInterventions(
        riskAssessment,
        studentData,
        trends
      )
      const alerts = this.alertSystem.generateAlerts(
        riskAssessment,
        studentData,
        teacherId,
        trends
      )

      studentAnalyses.push({
        studentId: studentData.studentId,
        riskAssessment,
        trends,
        interventions,
        alerts
      })

      allAlerts.push(...alerts)
    }

    // Perform cohort analysis
    const courseId = studentsData[0]?.courseId
    const cohortAnalysis = courseId 
      ? this.cohortEngine.analyzeCohortPerformance(studentsData, courseId)
      : this.createEmptyCohortAnalysis(courseId || '')

    // Generate priority alerts
    const priorityAlerts = allAlerts
      .filter(alert => alert.severity === 'critical' || alert.actionRequired)
      .sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 }
        return severityOrder[b.severity as keyof typeof severityOrder] - 
               severityOrder[a.severity as keyof typeof severityOrder]
      })

    // Generate summary insights
    const summaryInsights = this.generateSummaryInsights(studentAnalyses, cohortAnalysis)

    return {
      studentAnalyses,
      cohortAnalysis,
      priorityAlerts,
      summaryInsights
    }
  }

  /**
   * Generate dashboard insights for teachers
   */
  generateTeacherDashboard(
    studentsData: StudentPerformanceData[],
    teacherId: string
  ): {
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
  } {
    const totalStudents = studentsData.length
    const riskAssessments = studentsData.map(data => this.riskEngine.assessStudentRisk(data))
    const atRiskStudents = riskAssessments.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length
    
    const averagePerformance = studentsData.reduce((sum, s) => sum + s.currentGrade, 0) / totalStudents
    const attendanceRate = studentsData.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents
    const engagementScore = studentsData.reduce((sum, s) => {
      return sum + this.calculateEngagementScore(s.engagementMetrics)
    }, 0) / totalStudents

    // Generate alerts for all students
    const allAlerts: TeacherAlert[] = []
    for (const studentData of studentsData) {
      const riskAssessment = riskAssessments.find(r => r.studentId === studentData.studentId)!
      const trends = this.trendEngine.analyzePerformanceTrends(studentData)
      const alerts = this.alertSystem.generateAlerts(riskAssessment, studentData, teacherId, trends)
      allAlerts.push(...alerts)
    }

    // Analyze overall trends (simplified)
    const performanceTrend = this.calculateOverallTrend(studentsData.map(s => s.currentGrade))
    const engagementTrend = this.calculateOverallTrend(studentsData.map(s => 
      this.calculateEngagementScore(s.engagementMetrics)
    ))
    const attendanceTrend = this.calculateOverallTrend(studentsData.map(s => s.attendanceRate))

    // Generate action items
    const actionItems = this.generateActionItems(riskAssessments, allAlerts)

    return {
      overview: {
        totalStudents,
        atRiskStudents,
        averagePerformance: Math.round(averagePerformance * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        engagementScore: Math.round(engagementScore * 100) / 100
      },
      alerts: allAlerts.filter(a => a.severity === 'critical' || a.actionRequired).slice(0, 10),
      trends: {
        performanceTrend,
        engagementTrend,
        attendanceTrend
      },
      actionItems
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceInsightsConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.riskEngine = new RiskAssessmentEngine(this.config)
    this.alertSystem = new AlertSystem(this.config)
  }

  /**
   * Helper methods
   */
  private calculateEngagementScore(metrics: StudentPerformanceData['engagementMetrics']): number {
    const weights = {
      loginFrequency: 0.2,
      timeSpent: 0.2,
      lessonCompletion: 0.3,
      assignmentSubmission: 0.2,
      forumParticipation: 0.1
    }

    const normalizedLoginFreq = Math.min(metrics.loginFrequency / 7, 1)
    const normalizedTimeSpent = Math.min(metrics.timeSpentOnPlatform / 300, 1)
    const normalizedForum = Math.min(metrics.forumParticipation / 5, 1)

    return (
      normalizedLoginFreq * weights.loginFrequency +
      normalizedTimeSpent * weights.timeSpent +
      metrics.lessonCompletionRate * weights.lessonCompletion +
      metrics.assignmentSubmissionRate * weights.assignmentSubmission +
      normalizedForum * weights.forumParticipation
    )
  }

  private calculateOverallTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable'
    
    // Simple trend calculation - in a real implementation, this would use historical data
    const recent = values.slice(-Math.ceil(values.length / 2))
    const earlier = values.slice(0, Math.floor(values.length / 2))
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, v) => sum + v, 0) / earlier.length
    
    const difference = recentAvg - earlierAvg
    const threshold = 0.05 // 5% threshold
    
    if (difference > threshold) return 'improving'
    if (difference < -threshold) return 'declining'
    return 'stable'
  }

  private generateActionItems(
    riskAssessments: RiskAssessment[],
    alerts: TeacherAlert[]
  ): Array<{
    priority: 'urgent' | 'high' | 'medium'
    description: string
    studentCount: number
    suggestedAction: string
  }> {
    const actionItems = []

    // Critical risk students
    const criticalRisk = riskAssessments.filter(r => r.riskLevel === 'critical')
    if (criticalRisk.length > 0) {
      actionItems.push({
        priority: 'urgent' as const,
        description: 'Students at critical risk of failure',
        studentCount: criticalRisk.length,
        suggestedAction: 'Schedule immediate one-on-one meetings and implement intensive support'
      })
    }

    // High risk students
    const highRisk = riskAssessments.filter(r => r.riskLevel === 'high')
    if (highRisk.length > 0) {
      actionItems.push({
        priority: 'high' as const,
        description: 'Students showing high risk indicators',
        studentCount: highRisk.length,
        suggestedAction: 'Implement targeted interventions and increase monitoring'
      })
    }

    // Attendance issues
    const attendanceAlerts = alerts.filter(a => a.type === 'attendance_issue')
    if (attendanceAlerts.length > 0) {
      actionItems.push({
        priority: 'high' as const,
        description: 'Students with attendance concerns',
        studentCount: attendanceAlerts.length,
        suggestedAction: 'Contact students to address attendance barriers'
      })
    }

    // Engagement issues
    const engagementAlerts = alerts.filter(a => a.type === 'engagement_drop')
    if (engagementAlerts.length > 0) {
      actionItems.push({
        priority: 'medium' as const,
        description: 'Students with low engagement',
        studentCount: engagementAlerts.length,
        suggestedAction: 'Introduce interactive activities and check motivation levels'
      })
    }

    return actionItems.slice(0, 5) // Limit to top 5 action items
  }

  private generateSummaryInsights(
    studentAnalyses: any[],
    cohortAnalysis: CohortComparison
  ) {
    const highRiskStudents = studentAnalyses.filter(s => 
      s.riskAssessment.riskLevel === 'high' || s.riskAssessment.riskLevel === 'critical'
    ).length

    const studentsNeedingIntervention = studentAnalyses.filter(s => 
      s.interventions.length > 0
    ).length

    // Identify common issues
    const allRiskFactors = studentAnalyses.flatMap(s => 
      s.riskAssessment.riskFactors.map((f: any) => f.factor)
    )
    const factorCounts = allRiskFactors.reduce((counts: any, factor: string) => {
      counts[factor] = (counts[factor] || 0) + 1
      return counts
    }, {})

    const commonIssues = Object.entries(factorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([factor]) => factor)

    // Generate recommendations
    const recommendations = []
    if (highRiskStudents > studentAnalyses.length * 0.2) {
      recommendations.push('Consider reviewing course difficulty and support resources')
    }
    if (commonIssues.includes('low_engagement')) {
      recommendations.push('Implement more interactive and engaging learning activities')
    }
    if (commonIssues.includes('poor_attendance')) {
      recommendations.push('Investigate and address attendance barriers')
    }

    return {
      highRiskStudents,
      studentsNeedingIntervention,
      commonIssues,
      recommendations
    }
  }

  private createEmptyCohortAnalysis(courseId: string): CohortComparison {
    return {
      courseId,
      timeframe: 'month',
      metrics: {
        averageGrade: 0,
        medianGrade: 0,
        gradeDistribution: [],
        attendanceRate: 0,
        completionRate: 0,
        engagementScore: 0
      },
      studentComparisons: []
    }
  }
}