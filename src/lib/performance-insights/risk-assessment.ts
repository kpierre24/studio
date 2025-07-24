import { 
  StudentPerformanceData, 
  RiskAssessment, 
  PerformanceInsightsConfig 
} from '@/types/performance-insights'

/**
 * At-risk student identification algorithms
 */

export class RiskAssessmentEngine {
  private config: PerformanceInsightsConfig

  constructor(config: PerformanceInsightsConfig) {
    this.config = config
  }

  /**
   * Calculate comprehensive risk score for a student
   */
  assessStudentRisk(performanceData: StudentPerformanceData): RiskAssessment {
    const riskFactors = this.identifyRiskFactors(performanceData)
    const riskScore = this.calculateRiskScore(riskFactors, performanceData)
    const riskLevel = this.determineRiskLevel(riskScore)
    const predictedOutcome = this.predictOutcome(performanceData, riskScore)

    return {
      studentId: performanceData.studentId,
      courseId: performanceData.courseId,
      riskLevel,
      riskScore,
      riskFactors: riskFactors.map(factor => ({
        ...factor,
        severity: factor.severity as 'low' | 'medium' | 'high'
      })),
      predictedOutcome,
      lastAssessed: new Date()
    }
  }

  /**
   * Identify specific risk factors for a student
   */
  private identifyRiskFactors(data: StudentPerformanceData) {
    const factors = []

    // Grade performance risk
    if (data.currentGrade < this.config.riskThresholds.gradeThreshold) {
      const severity = data.currentGrade < 60 ? 'high' : data.currentGrade < 70 ? 'medium' : 'low'
      factors.push({
        factor: 'low_grades',
        severity,
        description: `Current grade (${data.currentGrade}%) is below threshold`,
        impact: this.calculateGradeImpact(data.currentGrade)
      })
    }

    // Attendance risk
    if (data.attendanceRate < this.config.riskThresholds.attendanceThreshold) {
      const severity = data.attendanceRate < 0.6 ? 'high' : data.attendanceRate < 0.8 ? 'medium' : 'low'
      factors.push({
        factor: 'poor_attendance',
        severity,
        description: `Attendance rate (${(data.attendanceRate * 100).toFixed(1)}%) is below threshold`,
        impact: this.calculateAttendanceImpact(data.attendanceRate)
      })
    }

    // Engagement risk
    const engagementScore = this.calculateEngagementScore(data.engagementMetrics)
    if (engagementScore < this.config.riskThresholds.engagementThreshold) {
      const severity = engagementScore < 0.4 ? 'high' : engagementScore < 0.6 ? 'medium' : 'low'
      factors.push({
        factor: 'low_engagement',
        severity,
        description: `Engagement score (${(engagementScore * 100).toFixed(1)}%) indicates low participation`,
        impact: this.calculateEngagementImpact(engagementScore)
      })
    }

    // Assignment submission pattern risk
    const submissionRate = data.engagementMetrics.assignmentSubmissionRate
    if (submissionRate < this.config.riskThresholds.submissionRateThreshold) {
      const severity = submissionRate < 0.5 ? 'high' : submissionRate < 0.7 ? 'medium' : 'low'
      factors.push({
        factor: 'missed_assignments',
        severity,
        description: `Assignment submission rate (${(submissionRate * 100).toFixed(1)}%) is concerning`,
        impact: this.calculateSubmissionImpact(submissionRate)
      })
    }

    // Late submission pattern
    const lateSubmissions = data.assignmentScores.filter(a => a.isLate).length
    const lateSubmissionRate = lateSubmissions / data.assignmentScores.length
    if (lateSubmissionRate > 0.3) {
      const severity = lateSubmissionRate > 0.6 ? 'high' : lateSubmissionRate > 0.4 ? 'medium' : 'low'
      factors.push({
        factor: 'late_submissions',
        severity,
        description: `High rate of late submissions (${(lateSubmissionRate * 100).toFixed(1)}%)`,
        impact: lateSubmissionRate * 0.3
      })
    }

    // Declining performance trend
    const gradeTrend = this.calculateGradeTrend(data.assignmentScores)
    if (gradeTrend.direction === 'declining' && gradeTrend.slope < -0.1) {
      const severity = gradeTrend.slope < -0.3 ? 'high' : gradeTrend.slope < -0.2 ? 'medium' : 'low'
      factors.push({
        factor: 'declining_performance',
        severity,
        description: `Performance is declining with slope ${gradeTrend.slope.toFixed(2)}`,
        impact: Math.abs(gradeTrend.slope) * 0.5
      })
    }

    // Inactivity risk
    const daysSinceLastActivity = Math.floor(
      (Date.now() - data.engagementMetrics.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastActivity > 7) {
      const severity = daysSinceLastActivity > 21 ? 'high' : daysSinceLastActivity > 14 ? 'medium' : 'low'
      factors.push({
        factor: 'inactivity',
        severity,
        description: `No activity for ${daysSinceLastActivity} days`,
        impact: Math.min(daysSinceLastActivity / 30, 1) * 0.4
      })
    }

    return factors
  }

  /**
   * Calculate overall risk score based on identified factors
   */
  private calculateRiskScore(riskFactors: any[], data: StudentPerformanceData): number {
    if (riskFactors.length === 0) return 0

    // Base score from risk factors
    const factorScore = riskFactors.reduce((sum, factor) => sum + factor.impact, 0)
    
    // Weight factors based on severity
    const severityWeights = { low: 1, medium: 1.5, high: 2 }
    const weightedScore = riskFactors.reduce((sum, factor) => {
      return sum + (factor.impact * severityWeights[factor.severity as keyof typeof severityWeights])
    }, 0)

    // Normalize to 0-100 scale
    const normalizedScore = Math.min(weightedScore * 100, 100)

    // Apply additional context-based adjustments
    let adjustedScore = normalizedScore

    // Boost score for multiple concurrent issues
    if (riskFactors.length > 3) {
      adjustedScore *= 1.2
    }

    // Boost score for high-severity factors
    const highSeverityFactors = riskFactors.filter(f => f.severity === 'high').length
    if (highSeverityFactors > 0) {
      adjustedScore *= (1 + highSeverityFactors * 0.1)
    }

    return Math.min(Math.round(adjustedScore), 100)
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  /**
   * Predict student outcomes based on current performance
   */
  private predictOutcome(data: StudentPerformanceData, riskScore: number) {
    // Simple linear regression model for prediction
    const gradeWeight = 0.4
    const attendanceWeight = 0.3
    const engagementWeight = 0.3

    const engagementScore = this.calculateEngagementScore(data.engagementMetrics)
    
    // Predict final grade
    const predictedGrade = Math.max(0, Math.min(100,
      data.currentGrade * gradeWeight +
      data.attendanceRate * 100 * attendanceWeight +
      engagementScore * 100 * engagementWeight -
      (riskScore * 0.2) // Risk penalty
    ))

    // Predict pass likelihood (assuming 60% is passing)
    const passLikelihood = Math.max(0, Math.min(1,
      (predictedGrade - 40) / 40 // Sigmoid-like function
    ))

    // Predict completion likelihood
    const completionLikelihood = Math.max(0, Math.min(1,
      data.engagementMetrics.lessonCompletionRate * 0.6 +
      data.attendanceRate * 0.4 -
      (riskScore / 100) * 0.3
    ))

    return {
      finalGrade: Math.round(predictedGrade),
      passLikelihood: Math.round(passLikelihood * 100) / 100,
      completionLikelihood: Math.round(completionLikelihood * 100) / 100
    }
  }

  /**
   * Helper methods for calculating specific impacts and scores
   */
  private calculateGradeImpact(grade: number): number {
    return Math.max(0, (70 - grade) / 70)
  }

  private calculateAttendanceImpact(rate: number): number {
    return Math.max(0, (0.8 - rate) / 0.8)
  }

  private calculateEngagementScore(metrics: StudentPerformanceData['engagementMetrics']): number {
    const weights = {
      loginFrequency: 0.2,
      timeSpent: 0.2,
      lessonCompletion: 0.3,
      assignmentSubmission: 0.2,
      forumParticipation: 0.1
    }

    // Normalize metrics to 0-1 scale
    const normalizedLoginFreq = Math.min(metrics.loginFrequency / 7, 1) // 7 logins per week = 1.0
    const normalizedTimeSpent = Math.min(metrics.timeSpentOnPlatform / 300, 1) // 5 hours per week = 1.0
    const normalizedForum = Math.min(metrics.forumParticipation / 5, 1) // 5 posts per week = 1.0

    return (
      normalizedLoginFreq * weights.loginFrequency +
      normalizedTimeSpent * weights.timeSpent +
      metrics.lessonCompletionRate * weights.lessonCompletion +
      metrics.assignmentSubmissionRate * weights.assignmentSubmission +
      normalizedForum * weights.forumParticipation
    )
  }

  private calculateEngagementImpact(score: number): number {
    return Math.max(0, (0.7 - score) / 0.7)
  }

  private calculateSubmissionImpact(rate: number): number {
    return Math.max(0, (0.8 - rate) / 0.8)
  }

  private calculateGradeTrend(scores: StudentPerformanceData['assignmentScores']) {
    if (scores.length < 3) {
      return { direction: 'stable' as const, slope: 0 }
    }

    // Sort by submission date
    const sortedScores = [...scores].sort((a, b) => 
      a.submittedAt.getTime() - b.submittedAt.getTime()
    )

    // Calculate percentage scores
    const percentages = sortedScores.map(s => (s.score / s.maxScore) * 100)
    
    // Simple linear regression
    const n = percentages.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = percentages

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

    let direction: 'improving' | 'declining' | 'stable'
    if (slope > 0.1) direction = 'improving'
    else if (slope < -0.1) direction = 'declining'
    else direction = 'stable'

    return { direction, slope }
  }
}

/**
 * Default configuration for risk assessment
 */
export const defaultRiskConfig: PerformanceInsightsConfig = {
  riskThresholds: {
    gradeThreshold: 70,
    attendanceThreshold: 0.8,
    engagementThreshold: 0.6,
    submissionRateThreshold: 0.8
  },
  alertSettings: {
    enableAutomaticAlerts: true,
    alertFrequency: 'daily',
    escalationRules: [
      {
        condition: 'risk_level_critical',
        action: 'immediate_alert',
        delay: 0
      },
      {
        condition: 'risk_level_high',
        action: 'daily_alert',
        delay: 24
      }
    ]
  },
  predictionSettings: {
    enablePredictions: true,
    updateFrequency: 'weekly',
    confidenceThreshold: 0.7
  }
}