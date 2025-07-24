import { 
  TeacherAlert, 
  RiskAssessment, 
  StudentPerformanceData, 
  PerformanceTrend,
  PerformanceInsightsConfig 
} from '@/types/performance-insights'

/**
 * Automated alert system for teachers when students show declining performance
 */

export class AlertSystem {
  private config: PerformanceInsightsConfig

  constructor(config: PerformanceInsightsConfig) {
    this.config = config
  }

  /**
   * Generate alerts based on risk assessment and performance data
   */
  generateAlerts(
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData,
    teacherId: string,
    trends?: PerformanceTrend
  ): TeacherAlert[] {
    const alerts: TeacherAlert[] = []

    // Risk level escalation alerts
    if (riskAssessment.riskLevel === 'critical') {
      alerts.push(this.createCriticalRiskAlert(riskAssessment, performanceData, teacherId))
    } else if (riskAssessment.riskLevel === 'high') {
      alerts.push(this.createHighRiskAlert(riskAssessment, performanceData, teacherId))
    }

    // Performance decline alerts
    if (trends) {
      const declineAlert = this.createPerformanceDeclineAlert(trends, performanceData, teacherId)
      if (declineAlert) {
        alerts.push(declineAlert)
      }
    }

    // Attendance alerts
    if (performanceData.attendanceRate < this.config.riskThresholds.attendanceThreshold) {
      alerts.push(this.createAttendanceAlert(performanceData, teacherId))
    }

    // Engagement alerts
    const engagementScore = this.calculateEngagementScore(performanceData.engagementMetrics)
    if (engagementScore < this.config.riskThresholds.engagementThreshold) {
      alerts.push(this.createEngagementAlert(performanceData, teacherId, engagementScore))
    }

    // Assignment pattern alerts
    const assignmentAlert = this.createAssignmentPatternAlert(performanceData, teacherId)
    if (assignmentAlert) {
      alerts.push(assignmentAlert)
    }

    // Inactivity alerts
    const inactivityAlert = this.createInactivityAlert(performanceData, teacherId)
    if (inactivityAlert) {
      alerts.push(inactivityAlert)
    }

    return alerts.filter(alert => this.shouldSendAlert(alert))
  }

  /**
   * Create critical risk alert
   */
  private createCriticalRiskAlert(
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert {
    const topRiskFactors = riskAssessment.riskFactors
      .filter(f => f.severity === 'high')
      .map(f => f.factor)
      .join(', ')

    return {
      id: `critical-${performanceData.studentId}-${Date.now()}`,
      teacherId,
      courseId: performanceData.courseId,
      studentId: performanceData.studentId,
      type: 'risk_escalation',
      severity: 'critical',
      title: 'URGENT: Student at Critical Risk',
      message: `Student is at critical risk (${riskAssessment.riskScore}% risk score) due to: ${topRiskFactors}. Immediate intervention required.`,
      data: {
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        riskFactors: riskAssessment.riskFactors,
        predictedGrade: riskAssessment.predictedOutcome.finalGrade,
        passLikelihood: riskAssessment.predictedOutcome.passLikelihood
      },
      actionRequired: true,
      createdAt: new Date()
    }
  }

  /**
   * Create high risk alert
   */
  private createHighRiskAlert(
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert {
    const primaryRiskFactors = riskAssessment.riskFactors
      .slice(0, 2)
      .map(f => f.factor)
      .join(', ')

    return {
      id: `high-risk-${performanceData.studentId}-${Date.now()}`,
      teacherId,
      courseId: performanceData.courseId,
      studentId: performanceData.studentId,
      type: 'risk_escalation',
      severity: 'warning',
      title: 'Student at High Risk',
      message: `Student shows high risk indicators (${riskAssessment.riskScore}% risk score) primarily due to: ${primaryRiskFactors}. Consider intervention.`,
      data: {
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        riskFactors: riskAssessment.riskFactors,
        predictedGrade: riskAssessment.predictedOutcome.finalGrade
      },
      actionRequired: true,
      createdAt: new Date()
    }
  }

  /**
   * Create performance decline alert
   */
  private createPerformanceDeclineAlert(
    trends: PerformanceTrend,
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert | null {
    const decliningTrends = []
    
    if (trends.trends.gradesTrend.direction === 'declining') {
      decliningTrends.push(`grades (slope: ${trends.trends.gradesTrend.slope.toFixed(2)})`)
    }
    if (trends.trends.engagementTrend.direction === 'declining') {
      decliningTrends.push(`engagement (slope: ${trends.trends.engagementTrend.slope.toFixed(2)})`)
    }
    if (trends.trends.attendanceTrend.direction === 'declining') {
      decliningTrends.push(`attendance (slope: ${trends.trends.attendanceTrend.slope.toFixed(2)})`)
    }

    if (decliningTrends.length === 0) return null

    const severity = decliningTrends.length >= 2 ? 'critical' : 'warning'

    return {
      id: `decline-${performanceData.studentId}-${Date.now()}`,
      teacherId,
      courseId: performanceData.courseId,
      studentId: performanceData.studentId,
      type: 'performance_decline',
      severity,
      title: 'Performance Decline Detected',
      message: `Student showing declining trends in: ${decliningTrends.join(', ')}. Early intervention recommended.`,
      data: {
        decliningTrends,
        timeframe: trends.timeframe,
        gradesTrend: trends.trends.gradesTrend,
        engagementTrend: trends.trends.engagementTrend,
        attendanceTrend: trends.trends.attendanceTrend
      },
      actionRequired: severity === 'critical',
      createdAt: new Date()
    }
  }

  /**
   * Create attendance alert
   */
  private createAttendanceAlert(
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert {
    const attendancePercentage = Math.round(performanceData.attendanceRate * 100)
    const severity = attendancePercentage < 60 ? 'critical' : attendancePercentage < 80 ? 'warning' : 'info'

    return {
      id: `attendance-${performanceData.studentId}-${Date.now()}`,
      teacherId,
      courseId: performanceData.courseId,
      studentId: performanceData.studentId,
      type: 'attendance_issue',
      severity,
      title: 'Low Attendance Alert',
      message: `Student attendance is ${attendancePercentage}%, below the required threshold of ${Math.round(this.config.riskThresholds.attendanceThreshold * 100)}%.`,
      data: {
        currentAttendance: performanceData.attendanceRate,
        threshold: this.config.riskThresholds.attendanceThreshold,
        attendancePercentage
      },
      actionRequired: severity !== 'info',
      createdAt: new Date()
    }
  }

  /**
   * Create engagement alert
   */
  private createEngagementAlert(
    performanceData: StudentPerformanceData,
    teacherId: string,
    engagementScore: number
  ): TeacherAlert {
    const engagementPercentage = Math.round(engagementScore * 100)
    const severity = engagementPercentage < 40 ? 'critical' : engagementPercentage < 60 ? 'warning' : 'info'

    return {
      id: `engagement-${performanceData.studentId}-${Date.now()}`,
      teacherId,
      courseId: performanceData.courseId,
      studentId: performanceData.studentId,
      type: 'engagement_drop',
      severity,
      title: 'Low Engagement Alert',
      message: `Student engagement score is ${engagementPercentage}%, indicating low participation in course activities.`,
      data: {
        engagementScore,
        engagementPercentage,
        metrics: performanceData.engagementMetrics,
        threshold: this.config.riskThresholds.engagementThreshold
      },
      actionRequired: severity !== 'info',
      createdAt: new Date()
    }
  }

  /**
   * Create assignment pattern alert
   */
  private createAssignmentPatternAlert(
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert | null {
    const totalAssignments = performanceData.assignmentScores.length
    if (totalAssignments < 3) return null

    const lateSubmissions = performanceData.assignmentScores.filter(a => a.isLate).length
    const lateRate = lateSubmissions / totalAssignments
    const missedAssignments = Math.max(0, totalAssignments - performanceData.assignmentScores.length)
    const submissionRate = performanceData.engagementMetrics.assignmentSubmissionRate

    if (lateRate > 0.4 || submissionRate < 0.7) {
      const issues = []
      if (lateRate > 0.4) issues.push(`${Math.round(lateRate * 100)}% late submissions`)
      if (submissionRate < 0.7) issues.push(`${Math.round(submissionRate * 100)}% submission rate`)

      const severity = (lateRate > 0.6 || submissionRate < 0.5) ? 'warning' : 'info'

      return {
        id: `assignment-${performanceData.studentId}-${Date.now()}`,
        teacherId,
        courseId: performanceData.courseId,
        studentId: performanceData.studentId,
        type: 'assignment_pattern',
        severity,
        title: 'Assignment Pattern Concern',
        message: `Student showing concerning assignment patterns: ${issues.join(', ')}.`,
        data: {
          lateRate,
          submissionRate,
          lateSubmissions,
          totalAssignments,
          missedAssignments
        },
        actionRequired: severity === 'warning',
        createdAt: new Date()
      }
    }

    return null
  }

  /**
   * Create inactivity alert
   */
  private createInactivityAlert(
    performanceData: StudentPerformanceData,
    teacherId: string
  ): TeacherAlert | null {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - performanceData.engagementMetrics.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActivity > 7) {
      const severity = daysSinceLastActivity > 21 ? 'critical' : daysSinceLastActivity > 14 ? 'warning' : 'info'

      return {
        id: `inactivity-${performanceData.studentId}-${Date.now()}`,
        teacherId,
        courseId: performanceData.courseId,
        studentId: performanceData.studentId,
        type: 'engagement_drop',
        severity,
        title: 'Student Inactivity Alert',
        message: `Student has been inactive for ${daysSinceLastActivity} days. Last activity: ${performanceData.engagementMetrics.lastActivity.toLocaleDateString()}.`,
        data: {
          daysSinceLastActivity,
          lastActivity: performanceData.engagementMetrics.lastActivity,
          loginFrequency: performanceData.engagementMetrics.loginFrequency
        },
        actionRequired: severity !== 'info',
        createdAt: new Date()
      }
    }

    return null
  }

  /**
   * Calculate engagement score
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

  /**
   * Determine if alert should be sent based on configuration
   */
  private shouldSendAlert(alert: TeacherAlert): boolean {
    if (!this.config.alertSettings.enableAutomaticAlerts) {
      return false
    }

    // Always send critical alerts
    if (alert.severity === 'critical') {
      return true
    }

    // Check frequency settings for other alerts
    const frequency = this.config.alertSettings.alertFrequency
    
    // For immediate alerts, send all
    if (frequency === 'immediate') {
      return true
    }

    // For daily/weekly, implement batching logic (simplified for demo)
    // In a real implementation, this would check against last sent times
    return alert.actionRequired || alert.severity === 'warning'
  }

  /**
   * Process escalation rules
   */
  processEscalationRules(alerts: TeacherAlert[]): TeacherAlert[] {
    const escalatedAlerts = [...alerts]

    for (const rule of this.config.alertSettings.escalationRules) {
      for (const alert of escalatedAlerts) {
        if (this.matchesEscalationCondition(alert, rule.condition)) {
          // In a real implementation, this would check timing and escalate
          // For demo, we'll just mark as requiring action
          alert.actionRequired = true
        }
      }
    }

    return escalatedAlerts
  }

  /**
   * Check if alert matches escalation condition
   */
  private matchesEscalationCondition(alert: TeacherAlert, condition: string): boolean {
    switch (condition) {
      case 'risk_level_critical':
        return alert.type === 'risk_escalation' && alert.severity === 'critical'
      case 'risk_level_high':
        return alert.type === 'risk_escalation' && alert.severity === 'warning'
      default:
        return false
    }
  }
}