import { 
  StudentPerformanceData, 
  CohortComparison 
} from '@/types/performance-insights'

/**
 * Comparative performance analysis across different student cohorts
 */

export class CohortAnalysisEngine {
  /**
   * Analyze performance across student cohorts
   */
  analyzeCohortPerformance(
    studentsData: StudentPerformanceData[],
    courseId: string,
    timeframe: 'week' | 'month' | 'semester' = 'month'
  ): CohortComparison {
    const courseStudents = studentsData.filter(s => s.courseId === courseId)
    
    if (courseStudents.length === 0) {
      throw new Error('No student data found for the specified course')
    }

    const metrics = this.calculateCohortMetrics(courseStudents)
    const studentComparisons = this.generateStudentComparisons(courseStudents, metrics)

    return {
      courseId,
      timeframe,
      metrics,
      studentComparisons
    }
  }

  /**
   * Calculate overall cohort metrics
   */
  private calculateCohortMetrics(studentsData: StudentPerformanceData[]) {
    const grades = studentsData.map(s => s.currentGrade).filter(g => g > 0)
    const attendanceRates = studentsData.map(s => s.attendanceRate)
    const engagementScores = studentsData.map(s => this.calculateEngagementScore(s.engagementMetrics))
    const completionRates = studentsData.map(s => s.engagementMetrics.lessonCompletionRate)

    // Calculate basic statistics
    const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    const sortedGrades = [...grades].sort((a, b) => a - b)
    const medianGrade = this.calculateMedian(sortedGrades)
    const averageAttendance = attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length
    const averageCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const averageEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length

    // Calculate grade distribution
    const gradeDistribution = this.calculateGradeDistribution(grades)

    return {
      averageGrade: Math.round(averageGrade * 100) / 100,
      medianGrade: Math.round(medianGrade * 100) / 100,
      gradeDistribution,
      attendanceRate: Math.round(averageAttendance * 100) / 100,
      completionRate: Math.round(averageCompletion * 100) / 100,
      engagementScore: Math.round(averageEngagement * 100) / 100
    }
  }

  /**
   * Generate individual student comparisons
   */
  private generateStudentComparisons(
    studentsData: StudentPerformanceData[],
    cohortMetrics: CohortComparison['metrics']
  ) {
    return studentsData.map(student => {
      const studentEngagement = this.calculateEngagementScore(student.engagementMetrics)
      
      // Calculate percentile rank based on current grade
      const grades = studentsData.map(s => s.currentGrade).filter(g => g > 0).sort((a, b) => a - b)
      const percentileRank = this.calculatePercentileRank(student.currentGrade, grades)
      
      // Calculate performance relative to average
      const performanceRelativeToAverage = student.currentGrade - cohortMetrics.averageGrade

      // Identify strengths and improvement areas
      const { strengths, improvementAreas } = this.identifyStrengthsAndWeaknesses(
        student,
        cohortMetrics,
        studentEngagement
      )

      return {
        studentId: student.studentId,
        percentileRank,
        performanceRelativeToAverage: Math.round(performanceRelativeToAverage * 100) / 100,
        strengths,
        improvementAreas
      }
    })
  }

  /**
   * Calculate median value
   */
  private calculateMedian(sortedArray: number[]): number {
    const mid = Math.floor(sortedArray.length / 2)
    return sortedArray.length % 2 !== 0 
      ? sortedArray[mid] 
      : (sortedArray[mid - 1] + sortedArray[mid]) / 2
  }

  /**
   * Calculate grade distribution
   */
  private calculateGradeDistribution(grades: number[]) {
    const ranges = [
      { min: 90, max: 100, label: 'A (90-100)' },
      { min: 80, max: 89, label: 'B (80-89)' },
      { min: 70, max: 79, label: 'C (70-79)' },
      { min: 60, max: 69, label: 'D (60-69)' },
      { min: 0, max: 59, label: 'F (0-59)' }
    ]

    return ranges.map(range => {
      const count = grades.filter(grade => grade >= range.min && grade <= range.max).length
      const percentage = Math.round((count / grades.length) * 100)
      
      return {
        range: range.label,
        count,
        percentage
      }
    }).filter(item => item.count > 0)
  }

  /**
   * Calculate percentile rank for a student
   */
  private calculatePercentileRank(studentGrade: number, allGrades: number[]): number {
    const belowCount = allGrades.filter(grade => grade < studentGrade).length
    const equalCount = allGrades.filter(grade => grade === studentGrade).length
    
    // Use the standard percentile rank formula
    const percentile = ((belowCount + 0.5 * equalCount) / allGrades.length) * 100
    return Math.round(percentile)
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
   * Identify student strengths and improvement areas
   */
  private identifyStrengthsAndWeaknesses(
    student: StudentPerformanceData,
    cohortMetrics: CohortComparison['metrics'],
    studentEngagement: number
  ) {
    const strengths: string[] = []
    const improvementAreas: string[] = []

    // Grade performance
    if (student.currentGrade > cohortMetrics.averageGrade + 10) {
      strengths.push('Academic Performance')
    } else if (student.currentGrade < cohortMetrics.averageGrade - 10) {
      improvementAreas.push('Academic Performance')
    }

    // Attendance
    if (student.attendanceRate > cohortMetrics.attendanceRate + 0.1) {
      strengths.push('Attendance')
    } else if (student.attendanceRate < cohortMetrics.attendanceRate - 0.1) {
      improvementAreas.push('Attendance')
    }

    // Engagement
    if (studentEngagement > cohortMetrics.engagementScore + 0.1) {
      strengths.push('Engagement')
    } else if (studentEngagement < cohortMetrics.engagementScore - 0.1) {
      improvementAreas.push('Engagement')
    }

    // Lesson completion
    if (student.engagementMetrics.lessonCompletionRate > cohortMetrics.completionRate + 0.1) {
      strengths.push('Lesson Completion')
    } else if (student.engagementMetrics.lessonCompletionRate < cohortMetrics.completionRate - 0.1) {
      improvementAreas.push('Lesson Completion')
    }

    // Assignment submission
    if (student.engagementMetrics.assignmentSubmissionRate > 0.9) {
      strengths.push('Assignment Submission')
    } else if (student.engagementMetrics.assignmentSubmissionRate < 0.7) {
      improvementAreas.push('Assignment Submission')
    }

    // Time management (based on assignment patterns)
    const lateSubmissions = student.assignmentScores.filter(a => a.isLate).length
    const lateRate = lateSubmissions / student.assignmentScores.length
    
    if (lateRate < 0.1) {
      strengths.push('Time Management')
    } else if (lateRate > 0.3) {
      improvementAreas.push('Time Management')
    }

    // Learning velocity
    if (student.learningVelocity.completionTrend === 'improving') {
      strengths.push('Learning Progress')
    } else if (student.learningVelocity.completionTrend === 'declining') {
      improvementAreas.push('Learning Progress')
    }

    return { strengths, improvementAreas }
  }

  /**
   * Generate cohort insights and recommendations
   */
  generateCohortInsights(comparison: CohortComparison): {
    insights: string[]
    recommendations: string[]
    concerningTrends: string[]
    positiveHighlights: string[]
  } {
    const insights: string[] = []
    const recommendations: string[] = []
    const concerningTrends: string[] = []
    const positiveHighlights: string[] = []

    // Analyze grade distribution
    const failingStudents = comparison.metrics.gradeDistribution
      .filter(d => d.range.includes('F'))
      .reduce((sum, d) => sum + d.count, 0)
    
    const excellentStudents = comparison.metrics.gradeDistribution
      .filter(d => d.range.includes('A'))
      .reduce((sum, d) => sum + d.count, 0)

    const totalStudents = comparison.studentComparisons.length

    if (failingStudents > totalStudents * 0.2) {
      concerningTrends.push(`${Math.round((failingStudents / totalStudents) * 100)}% of students are failing`)
      recommendations.push('Implement additional support programs for struggling students')
      recommendations.push('Review course difficulty and pacing')
    }

    if (excellentStudents > totalStudents * 0.3) {
      positiveHighlights.push(`${Math.round((excellentStudents / totalStudents) * 100)}% of students are performing excellently`)
    }

    // Analyze attendance patterns
    if (comparison.metrics.attendanceRate < 0.8) {
      concerningTrends.push(`Average attendance is ${Math.round(comparison.metrics.attendanceRate * 100)}%`)
      recommendations.push('Investigate attendance barriers and implement engagement strategies')
    } else if (comparison.metrics.attendanceRate > 0.9) {
      positiveHighlights.push(`Excellent attendance rate of ${Math.round(comparison.metrics.attendanceRate * 100)}%`)
    }

    // Analyze engagement
    if (comparison.metrics.engagementScore < 0.6) {
      concerningTrends.push(`Low average engagement score of ${Math.round(comparison.metrics.engagementScore * 100)}%`)
      recommendations.push('Introduce more interactive and engaging content')
      recommendations.push('Consider gamification elements to boost engagement')
    }

    // Analyze completion rates
    if (comparison.metrics.completionRate < 0.7) {
      concerningTrends.push(`Low lesson completion rate of ${Math.round(comparison.metrics.completionRate * 100)}%`)
      recommendations.push('Review lesson structure and difficulty progression')
      recommendations.push('Provide additional support for lesson completion')
    }

    // Performance distribution insights
    const highPerformers = comparison.studentComparisons.filter(s => s.percentileRank > 80).length
    const lowPerformers = comparison.studentComparisons.filter(s => s.percentileRank < 20).length

    insights.push(`${highPerformers} students (${Math.round((highPerformers / totalStudents) * 100)}%) are in the top 20%`)
    insights.push(`${lowPerformers} students (${Math.round((lowPerformers / totalStudents) * 100)}%) are in the bottom 20%`)

    // Common strengths and weaknesses
    const allStrengths = comparison.studentComparisons.flatMap(s => s.strengths)
    const allWeaknesses = comparison.studentComparisons.flatMap(s => s.improvementAreas)

    const strengthCounts = this.countOccurrences(allStrengths)
    const weaknessCounts = this.countOccurrences(allWeaknesses)

    const topStrength = this.getTopItem(strengthCounts)
    const topWeakness = this.getTopItem(weaknessCounts)

    if (topStrength) {
      positiveHighlights.push(`${topStrength.item} is a common strength across ${topStrength.count} students`)
    }

    if (topWeakness) {
      concerningTrends.push(`${topWeakness.item} needs improvement for ${topWeakness.count} students`)
      recommendations.push(`Focus on improving ${topWeakness.item} through targeted interventions`)
    }

    return {
      insights,
      recommendations,
      concerningTrends,
      positiveHighlights
    }
  }

  /**
   * Count occurrences of items in array
   */
  private countOccurrences(items: string[]): Record<string, number> {
    return items.reduce((counts, item) => {
      counts[item] = (counts[item] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  /**
   * Get the most frequent item
   */
  private getTopItem(counts: Record<string, number>): { item: string; count: number } | null {
    const entries = Object.entries(counts)
    if (entries.length === 0) return null

    const [item, count] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )

    return { item, count }
  }

  /**
   * Compare student performance across different time periods
   */
  comparePerformanceOverTime(
    currentData: StudentPerformanceData[],
    previousData: StudentPerformanceData[],
    courseId: string
  ): {
    improvement: number
    studentsImproved: number
    studentsDeclined: number
    averageGradeChange: number
    attendanceChange: number
    engagementChange: number
  } {
    const currentCohort = this.analyzeCohortPerformance(currentData, courseId)
    const previousCohort = this.analyzeCohortPerformance(previousData, courseId)

    const averageGradeChange = currentCohort.metrics.averageGrade - previousCohort.metrics.averageGrade
    const attendanceChange = currentCohort.metrics.attendanceRate - previousCohort.metrics.attendanceRate
    const engagementChange = currentCohort.metrics.engagementScore - previousCohort.metrics.engagementScore

    // Count students who improved or declined
    let studentsImproved = 0
    let studentsDeclined = 0

    for (const currentStudent of currentData.filter(s => s.courseId === courseId)) {
      const previousStudent = previousData.find(s => 
        s.studentId === currentStudent.studentId && s.courseId === courseId
      )
      
      if (previousStudent) {
        if (currentStudent.currentGrade > previousStudent.currentGrade) {
          studentsImproved++
        } else if (currentStudent.currentGrade < previousStudent.currentGrade) {
          studentsDeclined++
        }
      }
    }

    const totalStudents = currentData.filter(s => s.courseId === courseId).length
    const improvement = totalStudents > 0 ? (studentsImproved / totalStudents) * 100 : 0

    return {
      improvement: Math.round(improvement),
      studentsImproved,
      studentsDeclined,
      averageGradeChange: Math.round(averageGradeChange * 100) / 100,
      attendanceChange: Math.round(attendanceChange * 100) / 100,
      engagementChange: Math.round(engagementChange * 100) / 100
    }
  }
}