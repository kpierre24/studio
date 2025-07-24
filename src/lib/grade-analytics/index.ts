// Grade Analytics Engine - Main Entry Point

import { 
  GradeAnalyticsReport, 
  GradeAnalysisRequest, 
  GradeAnalysisResponse,
  StudentGradeData,
  AssignmentGradeData,
  ComparativeAnalysis,
  CorrelationAnalysis,
  GradeTrendPoint,
  GradeAnalyticsConfig
} from '@/types/grade-analytics'
import { StatisticalAnalysis } from './statistical-analysis'
import { GradePredictionEngine } from './prediction-models'

export class GradeAnalyticsEngine {
  private config: GradeAnalyticsConfig

  constructor(config?: Partial<GradeAnalyticsConfig>) {
    this.config = {
      binning: {
        method: 'equal_width',
        binCount: 10
      },
      outlierDetection: {
        method: 'iqr',
        threshold: 1.5
      },
      correlation: {
        method: 'pearson',
        significanceLevel: 0.05
      },
      prediction: {
        enablePredictions: true,
        modelType: 'linear_regression',
        updateFrequency: 'weekly',
        minDataPoints: 5
      },
      reporting: {
        autoGenerate: false,
        frequency: 'monthly',
        recipients: [],
        includeStudentData: true
      },
      ...config
    }
  }

  /**
   * Analyze grades and generate comprehensive report
   */
  async analyzeGrades(request: GradeAnalysisRequest): Promise<GradeAnalysisResponse> {
    const startTime = Date.now()

    try {
      // Fetch and prepare data based on request type
      const data = await this.prepareAnalysisData(request)
      
      if (!data || data.students.length === 0) {
        return {
          success: false,
          error: 'No data available for analysis',
          processingTime: Date.now() - startTime
        }
      }

      // Generate comprehensive report
      const report = await this.generateReport(data, request)

      return {
        success: true,
        data: report,
        processingTime: Date.now() - startTime,
        cacheKey: this.generateCacheKey(request)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  private async generateReport(
    data: { students: StudentGradeData[], assignments: AssignmentGradeData[] },
    request: GradeAnalysisRequest
  ): Promise<GradeAnalyticsReport> {
    const { students, assignments } = data

    // Extract all grades for overall analysis
    const allGrades = students.flatMap(s => 
      s.grades.map(g => (g.grade / g.maxGrade) * 100)
    )
    const studentIds = students.flatMap(s => 
      s.grades.map(() => s.studentId)
    )

    // Calculate overall statistics
    const overallStatistics = StatisticalAnalysis.calculateStatistics(allGrades)

    // Generate distribution analysis
    const histogram = StatisticalAnalysis.createHistogram(
      allGrades, 
      this.config.binning.binCount,
      studentIds
    )
    const boxPlot = StatisticalAnalysis.createBoxPlot(
      allGrades,
      studentIds,
      students.map(s => s.studentName)
    )

    // Generate trend analysis
    const trends = this.generateTrendAnalysis(assignments)

    // Generate comparative analysis
    const comparative = request.includeHistorical ? 
      await this.generateComparativeAnalysis(data, request) : undefined

    // Generate correlation analysis
    const correlations = request.includeCorrelations ?
      this.generateCorrelationAnalysis(students, assignments) : undefined

    // Generate predictions
    const predictions = request.includePredictions && this.config.prediction.enablePredictions ?
      this.generatePredictions(students) : undefined

    // Generate insights and recommendations
    const insights = this.generateInsights(overallStatistics, histogram, trends)
    const recommendations = this.generateRecommendations(overallStatistics, predictions)

    return {
      id: `report_${Date.now()}`,
      courseId: request.courseId || 'unknown',
      courseName: 'Course Analysis', // Would be fetched from course data
      generatedAt: new Date(),
      timeframe: {
        start: request.timeframe?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: request.timeframe?.end || new Date(),
        description: this.getTimeframeDescription(request.timeframe)
      },
      summary: {
        totalStudents: students.length,
        totalAssignments: assignments.length,
        overallStatistics,
        keyInsights: insights,
        recommendations
      },
      sections: {
        distribution: {
          histogram,
          boxPlot,
          trends
        },
        comparative: comparative || {} as any,
        correlations: correlations || {} as any,
        predictions: predictions || {} as any
      },
      exportFormats: [] // Would be populated with actual export URLs
    }
  }

  /**
   * Generate trend analysis from assignment data
   */
  private generateTrendAnalysis(assignments: AssignmentGradeData[]): GradeTrendPoint[] {
    return assignments
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .map(assignment => {
        const grades = assignment.grades.map(g => (g.grade / assignment.maxGrade) * 100)
        const statistics = StatisticalAnalysis.calculateStatistics(grades)
        const distribution = StatisticalAnalysis.createHistogram(grades, 5).bins

        return {
          date: assignment.dueDate.toISOString().split('T')[0],
          assignmentId: assignment.assignmentId,
          assignmentName: assignment.assignmentName,
          statistics,
          distribution,
          metadata: {
            totalSubmissions: assignment.grades.length,
            lateSubmissions: assignment.grades.filter(g => g.isLate).length,
            category: assignment.category
          }
        }
      })
  }

  /**
   * Generate comparative analysis with historical data
   */
  private async generateComparativeAnalysis(
    data: { students: StudentGradeData[], assignments: AssignmentGradeData[] },
    request: GradeAnalysisRequest
  ): Promise<ComparativeAnalysis> {
    // In a real implementation, this would fetch historical data
    // For now, we'll create a mock comparative analysis
    
    const currentGrades = data.students.flatMap(s => 
      s.grades.map(g => (g.grade / g.maxGrade) * 100)
    )
    const currentStats = StatisticalAnalysis.calculateStatistics(currentGrades)
    const currentDistribution = StatisticalAnalysis.createHistogram(currentGrades, 5).bins

    return {
      current: {
        courseId: request.courseId || 'current',
        courseName: 'Current Course',
        timeframe: 'Current Semester',
        statistics: currentStats,
        distribution: currentDistribution
      },
      historical: [
        {
          timeframe: 'Previous Semester',
          statistics: {
            ...currentStats,
            mean: currentStats.mean - 2.5 // Mock historical difference
          },
          distribution: currentDistribution,
          comparisonMetrics: {
            meanDifference: 2.5,
            medianDifference: 1.8,
            distributionShift: 'improved' as const,
            significanceLevel: 0.03
          }
        }
      ],
      benchmarks: {
        departmentAverage: {
          ...currentStats,
          mean: currentStats.mean - 1.2
        }
      }
    }
  }

  /**
   * Generate correlation analysis
   */
  private generateCorrelationAnalysis(
    students: StudentGradeData[],
    assignments: AssignmentGradeData[]
  ): CorrelationAnalysis {
    const assignmentCorrelations = assignments.map(assignment => {
      const correlations = assignments
        .filter(other => other.assignmentId !== assignment.assignmentId)
        .map(other => {
          // Get grades for both assignments from same students
          const assignment1Grades: number[] = []
          const assignment2Grades: number[] = []

          students.forEach(student => {
            const grade1 = student.grades.find(g => g.assignmentId === assignment.assignmentId)
            const grade2 = student.grades.find(g => g.assignmentId === other.assignmentId)
            
            if (grade1 && grade2) {
              assignment1Grades.push((grade1.grade / grade1.maxGrade) * 100)
              assignment2Grades.push((grade2.grade / grade2.maxGrade) * 100)
            }
          })

          if (assignment1Grades.length < 3) {
            return null
          }

          const correlation = StatisticalAnalysis.calculateCorrelation(
            assignment1Grades,
            assignment2Grades,
            this.config.correlation.method as 'pearson' | 'spearman'
          )

          return {
            withAssignmentId: other.assignmentId,
            withAssignmentName: other.assignmentName,
            correlationCoefficient: Math.round(correlation * 1000) / 1000,
            pValue: 0.05, // Simplified - would calculate actual p-value
            significance: this.getCorrelationSignificance(Math.abs(correlation)),
            relationship: correlation > 0 ? 'positive' as const : 
                         correlation < 0 ? 'negative' as const : 'none' as const
          }
        })
        .filter(Boolean) as any[]

      return {
        assignmentId: assignment.assignmentId,
        assignmentName: assignment.assignmentName,
        correlations
      }
    })

    return {
      assignments: assignmentCorrelations,
      courses: [] // Would be populated with cross-course correlations
    }
  }

  /**
   * Generate grade predictions
   */
  private generatePredictions(students: StudentGradeData[]) {
    try {
      return GradePredictionEngine.createLinearRegressionModel(students)
    } catch (error) {
      console.warn('Failed to generate predictions:', error)
      return undefined
    }
  }

  /**
   * Generate insights from statistical analysis
   */
  private generateInsights(
    statistics: any,
    histogram: any,
    trends: GradeTrendPoint[]
  ): string[] {
    const insights: string[] = []

    // Grade distribution insights
    if (statistics.mean >= 85) {
      insights.push('Class performance is excellent with high average grades')
    } else if (statistics.mean >= 75) {
      insights.push('Class performance is good with solid average grades')
    } else if (statistics.mean >= 65) {
      insights.push('Class performance is average with room for improvement')
    } else {
      insights.push('Class performance is below average and needs attention')
    }

    // Variability insights
    if (statistics.standardDeviation > 15) {
      insights.push('High grade variability indicates diverse student performance levels')
    } else if (statistics.standardDeviation < 5) {
      insights.push('Low grade variability shows consistent student performance')
    }

    // Trend insights
    if (trends.length >= 2) {
      const firstAssignment = trends[0]
      const lastAssignment = trends[trends.length - 1]
      const meanChange = lastAssignment.statistics.mean - firstAssignment.statistics.mean

      if (meanChange > 5) {
        insights.push('Grade trends show improvement over time')
      } else if (meanChange < -5) {
        insights.push('Grade trends show decline over time - intervention may be needed')
      }
    }

    return insights
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(statistics: any, predictions: any): string[] {
    const recommendations: string[] = []

    if (statistics.mean < 70) {
      recommendations.push('Consider reviewing course difficulty and providing additional support')
      recommendations.push('Implement peer tutoring or study groups')
    }

    if (statistics.standardDeviation > 15) {
      recommendations.push('Provide differentiated instruction to address varying performance levels')
      recommendations.push('Consider additional support for struggling students')
    }

    if (predictions) {
      const highRiskStudents = predictions.predictions.filter((p: any) => p.riskLevel === 'high').length
      if (highRiskStudents > 0) {
        recommendations.push(`${highRiskStudents} students are at high risk - consider early intervention`)
      }
    }

    return recommendations
  }

  /**
   * Prepare analysis data based on request
   */
  private async prepareAnalysisData(request: GradeAnalysisRequest) {
    // In a real implementation, this would fetch data from the database
    // For now, return mock data structure
    return {
      students: [] as StudentGradeData[],
      assignments: [] as AssignmentGradeData[]
    }
  }

  /**
   * Get correlation significance level
   */
  private getCorrelationSignificance(correlation: number): 'strong' | 'moderate' | 'weak' | 'none' {
    if (correlation >= 0.7) return 'strong'
    if (correlation >= 0.5) return 'moderate'
    if (correlation >= 0.3) return 'weak'
    return 'none'
  }

  /**
   * Get timeframe description
   */
  private getTimeframeDescription(timeframe?: { start: Date; end: Date }): string {
    if (!timeframe) return 'All time'
    
    const start = timeframe.start.toLocaleDateString()
    const end = timeframe.end.toLocaleDateString()
    return `${start} - ${end}`
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: GradeAnalysisRequest): string {
    const key = [
      request.type,
      request.courseId,
      request.assignmentId,
      request.studentId,
      request.timeframe?.start?.getTime(),
      request.timeframe?.end?.getTime()
    ].filter(Boolean).join('_')
    
    return `grade_analytics_${key}`
  }
}

// Export utility functions
export { StatisticalAnalysis } from './statistical-analysis'
export { GradePredictionEngine } from './prediction-models'

// Export default instance
export const gradeAnalytics = new GradeAnalyticsEngine()