import { 
  StudentPerformanceData, 
  PerformanceTrend 
} from '@/types/performance-insights'

/**
 * Performance trend analysis with visual indicators and recommendations
 */

export class TrendAnalysisEngine {
  /**
   * Analyze performance trends for a student
   */
  analyzePerformanceTrends(
    performanceData: StudentPerformanceData,
    timeframe: 'week' | 'month' | 'semester' = 'month'
  ): PerformanceTrend {
    const gradesTrend = this.analyzeGradesTrend(performanceData.assignmentScores, timeframe)
    const engagementTrend = this.analyzeEngagementTrend(performanceData.engagementMetrics, timeframe)
    const attendanceTrend = this.analyzeAttendanceTrend(performanceData.attendanceRate, timeframe)

    return {
      studentId: performanceData.studentId,
      courseId: performanceData.courseId,
      timeframe,
      trends: {
        gradesTrend,
        engagementTrend,
        attendanceTrend
      }
    }
  }

  /**
   * Analyze grades trend over time
   */
  private analyzeGradesTrend(
    assignmentScores: StudentPerformanceData['assignmentScores'],
    timeframe: string
  ) {
    const cutoffDate = this.getCutoffDate(timeframe)
    const recentScores = assignmentScores
      .filter(score => score.submittedAt >= cutoffDate)
      .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())

    if (recentScores.length < 2) {
      return {
        direction: 'stable' as const,
        slope: 0,
        confidence: 0,
        dataPoints: []
      }
    }

    // Convert to percentage scores and create data points
    const dataPoints = recentScores.map(score => ({
      date: score.submittedAt,
      value: (score.score / score.maxScore) * 100,
      assignment: score.assignmentId
    }))

    // Calculate trend using linear regression
    const { slope, confidence } = this.calculateLinearTrend(
      dataPoints.map((_, i) => i),
      dataPoints.map(p => p.value)
    )

    const direction = this.determineTrendDirection(slope)

    return {
      direction,
      slope,
      confidence,
      dataPoints
    }
  }

  /**
   * Analyze engagement trend over time
   */
  private analyzeEngagementTrend(
    engagementMetrics: StudentPerformanceData['engagementMetrics'],
    timeframe: string
  ) {
    // For demo purposes, we'll simulate engagement data points over time
    // In a real implementation, this would come from historical data
    const cutoffDate = this.getCutoffDate(timeframe)
    const dataPoints = this.generateEngagementDataPoints(engagementMetrics, cutoffDate)

    if (dataPoints.length < 2) {
      return {
        direction: 'stable' as const,
        slope: 0,
        confidence: 0,
        dataPoints: []
      }
    }

    const { slope, confidence } = this.calculateLinearTrend(
      dataPoints.map((_, i) => i),
      dataPoints.map(p => p.value)
    )

    const direction = this.determineTrendDirection(slope)

    return {
      direction,
      slope,
      confidence,
      dataPoints
    }
  }

  /**
   * Analyze attendance trend over time
   */
  private analyzeAttendanceTrend(
    currentAttendanceRate: number,
    timeframe: string
  ) {
    // For demo purposes, we'll simulate attendance data points
    // In a real implementation, this would come from historical attendance records
    const cutoffDate = this.getCutoffDate(timeframe)
    const dataPoints = this.generateAttendanceDataPoints(currentAttendanceRate, cutoffDate)

    if (dataPoints.length < 2) {
      return {
        direction: 'stable' as const,
        slope: 0,
        confidence: 0,
        dataPoints: []
      }
    }

    const { slope, confidence } = this.calculateLinearTrend(
      dataPoints.map((_, i) => i),
      dataPoints.map(p => p.value)
    )

    const direction = this.determineTrendDirection(slope)

    return {
      direction,
      slope,
      confidence,
      dataPoints
    }
  }

  /**
   * Calculate linear trend using least squares regression
   */
  private calculateLinearTrend(x: number[], y: number[]) {
    const n = x.length
    if (n < 2) return { slope: 0, confidence: 0 }

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    // Calculate R-squared for confidence
    const meanY = sumY / n
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + (sumY - slope * sumX) / n
      return sum + Math.pow(yi - predicted, 2)
    }, 0)
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
    
    const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot)
    const confidence = Math.max(0, Math.min(1, rSquared))

    return { slope, confidence }
  }

  /**
   * Determine trend direction based on slope
   */
  private determineTrendDirection(slope: number): 'improving' | 'declining' | 'stable' {
    const threshold = 0.1
    if (slope > threshold) return 'improving'
    if (slope < -threshold) return 'declining'
    return 'stable'
  }

  /**
   * Get cutoff date based on timeframe
   */
  private getCutoffDate(timeframe: string): Date {
    const now = new Date()
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case 'semester':
        return new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
  }

  /**
   * Generate simulated engagement data points for demo
   */
  private generateEngagementDataPoints(
    currentMetrics: StudentPerformanceData['engagementMetrics'],
    cutoffDate: Date
  ) {
    const dataPoints = []
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate weekly data points
    for (let i = 0; i < Math.min(daysDiff / 7, 12); i++) {
      const date = new Date(cutoffDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      
      // Simulate engagement score with some variation
      const baseScore = (
        currentMetrics.loginFrequency * 0.2 +
        Math.min(currentMetrics.timeSpentOnPlatform / 300, 1) * 0.3 +
        currentMetrics.lessonCompletionRate * 0.3 +
        currentMetrics.assignmentSubmissionRate * 0.2
      ) * 100

      const variation = (Math.random() - 0.5) * 20 // ±10 points variation
      const value = Math.max(0, Math.min(100, baseScore + variation))

      dataPoints.push({
        date,
        value: Math.round(value),
        metric: 'engagement_score'
      })
    }

    return dataPoints
  }

  /**
   * Generate simulated attendance data points for demo
   */
  private generateAttendanceDataPoints(currentRate: number, cutoffDate: Date) {
    const dataPoints = []
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 1000))
    
    // Generate weekly data points
    for (let i = 0; i < Math.min(daysDiff / 7, 12); i++) {
      const date = new Date(cutoffDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      
      // Simulate attendance with some variation around current rate
      const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
      const value = Math.max(0, Math.min(1, currentRate + variation)) * 100

      dataPoints.push({
        date,
        value: Math.round(value)
      })
    }

    return dataPoints
  }

  /**
   * Generate trend insights and recommendations
   */
  generateTrendInsights(trend: PerformanceTrend): {
    insights: string[]
    recommendations: string[]
    visualIndicators: {
      color: string
      icon: string
      severity: 'success' | 'warning' | 'danger' | 'info'
    }
  } {
    const insights = []
    const recommendations = []
    let overallSeverity: 'success' | 'warning' | 'danger' | 'info' = 'info'
    let color = '#6B7280'
    let icon = '📊'

    // Analyze grades trend
    if (trend.trends.gradesTrend.direction === 'declining') {
      insights.push(`Grades have been declining with a slope of ${trend.trends.gradesTrend.slope.toFixed(2)}`)
      recommendations.push('Schedule a one-on-one meeting to discuss academic challenges')
      recommendations.push('Consider additional tutoring or study resources')
      overallSeverity = 'danger'
      color = '#EF4444'
      icon = '📉'
    } else if (trend.trends.gradesTrend.direction === 'improving') {
      insights.push(`Grades are improving with positive momentum`)
      recommendations.push('Continue current study strategies')
      recommendations.push('Consider peer tutoring opportunities')
      overallSeverity = 'success'
      color = '#10B981'
      icon = '📈'
    }

    // Analyze engagement trend
    if (trend.trends.engagementTrend.direction === 'declining') {
      insights.push('Student engagement has been decreasing')
      recommendations.push('Implement interactive learning activities')
      recommendations.push('Check in with student about course interest and motivation')
      if (overallSeverity !== 'danger') overallSeverity = 'warning'
      if (color === '#6B7280') {
        color = '#F59E0B'
        icon = '⚠️'
      }
    }

    // Analyze attendance trend
    if (trend.trends.attendanceTrend.direction === 'declining') {
      insights.push('Attendance pattern shows concerning decline')
      recommendations.push('Contact student about attendance issues')
      recommendations.push('Explore flexible attendance options if needed')
      if (overallSeverity === 'info') overallSeverity = 'warning'
      if (color === '#6B7280') {
        color = '#F59E0B'
        icon = '⚠️'
      }
    }

    // Default positive case
    if (insights.length === 0) {
      insights.push('Performance trends are stable')
      recommendations.push('Continue monitoring progress')
      overallSeverity = 'success'
      color = '#10B981'
      icon = '✅'
    }

    return {
      insights,
      recommendations,
      visualIndicators: {
        color,
        icon,
        severity: overallSeverity
      }
    }
  }
}