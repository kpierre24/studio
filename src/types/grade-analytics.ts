// Grade Distribution Analysis Types

export interface GradeStatistics {
  mean: number
  median: number
  mode: number[]
  standardDeviation: number
  variance: number
  min: number
  max: number
  range: number
  quartiles: {
    q1: number
    q2: number // median
    q3: number
    iqr: number // interquartile range
  }
  percentiles: {
    p10: number
    p25: number
    p50: number // median
    p75: number
    p90: number
    p95: number
  }
}

export interface GradeDistributionBin {
  range: string
  min: number
  max: number
  count: number
  percentage: number
  students: string[] // student IDs
  color?: string
}

export interface HistogramData {
  bins: GradeDistributionBin[]
  binWidth: number
  totalCount: number
  statistics: GradeStatistics
}

export interface BoxPlotData {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: Array<{
    value: number
    studentId: string
    studentName?: string
  }>
  statistics: GradeStatistics
}

export interface GradeTrendPoint {
  date: string
  assignmentId: string
  assignmentName: string
  statistics: GradeStatistics
  distribution: GradeDistributionBin[]
  metadata?: Record<string, any>
}

export interface ComparativeAnalysis {
  current: {
    courseId: string
    courseName: string
    timeframe: string
    statistics: GradeStatistics
    distribution: GradeDistributionBin[]
  }
  historical: Array<{
    timeframe: string
    statistics: GradeStatistics
    distribution: GradeDistributionBin[]
    comparisonMetrics: {
      meanDifference: number
      medianDifference: number
      distributionShift: 'improved' | 'declined' | 'stable'
      significanceLevel: number
    }
  }>
  benchmarks: {
    departmentAverage?: GradeStatistics
    institutionAverage?: GradeStatistics
    nationalAverage?: GradeStatistics
  }
}

export interface CorrelationAnalysis {
  assignments: Array<{
    assignmentId: string
    assignmentName: string
    correlations: Array<{
      withAssignmentId: string
      withAssignmentName: string
      correlationCoefficient: number
      pValue: number
      significance: 'strong' | 'moderate' | 'weak' | 'none'
      relationship: 'positive' | 'negative' | 'none'
    }>
  }>
  courses: Array<{
    courseId: string
    courseName: string
    correlations: Array<{
      withCourseId: string
      withCourseName: string
      correlationCoefficient: number
      pValue: number
      significance: 'strong' | 'moderate' | 'weak' | 'none'
      relationship: 'positive' | 'negative' | 'none'
    }>
  }>
}

export interface GradePredictionModel {
  modelId: string
  type: 'linear_regression' | 'polynomial' | 'neural_network'
  accuracy: number
  rmse: number // root mean square error
  r2Score: number // coefficient of determination
  features: Array<{
    name: string
    importance: number
    coefficient?: number
  }>
  predictions: Array<{
    studentId: string
    currentGrade: number
    predictedFinalGrade: number
    confidence: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    riskLevel: 'low' | 'medium' | 'high'
    factors: Array<{
      factor: string
      impact: number
      value: number
    }>
  }>
  lastTrained: Date
  trainingData: {
    sampleSize: number
    timeframe: string
    features: string[]
  }
}

export interface GradeAnalyticsReport {
  id: string
  courseId: string
  courseName: string
  generatedAt: Date
  timeframe: {
    start: Date
    end: Date
    description: string
  }
  summary: {
    totalStudents: number
    totalAssignments: number
    overallStatistics: GradeStatistics
    keyInsights: string[]
    recommendations: string[]
  }
  sections: {
    distribution: {
      histogram: HistogramData
      boxPlot: BoxPlotData
      trends: GradeTrendPoint[]
    }
    comparative: ComparativeAnalysis
    correlations: CorrelationAnalysis
    predictions: GradePredictionModel
  }
  exportFormats: Array<{
    format: 'pdf' | 'excel' | 'csv' | 'json'
    url: string
    generatedAt: Date
  }>
}

export interface GradeAnalyticsConfig {
  binning: {
    method: 'equal_width' | 'equal_frequency' | 'custom'
    binCount?: number
    customRanges?: Array<{ min: number; max: number; label: string }>
  }
  outlierDetection: {
    method: 'iqr' | 'z_score' | 'modified_z_score'
    threshold: number
  }
  correlation: {
    method: 'pearson' | 'spearman' | 'kendall'
    significanceLevel: number
  }
  prediction: {
    enablePredictions: boolean
    modelType: 'linear_regression' | 'polynomial' | 'neural_network'
    updateFrequency: 'daily' | 'weekly' | 'monthly'
    minDataPoints: number
  }
  reporting: {
    autoGenerate: boolean
    frequency: 'weekly' | 'monthly' | 'semester'
    recipients: string[]
    includeStudentData: boolean
  }
}

// Input data structures
export interface StudentGradeData {
  studentId: string
  studentName: string
  grades: Array<{
    assignmentId: string
    assignmentName: string
    grade: number
    maxGrade: number
    submittedAt: Date
    isLate: boolean
    category?: string
  }>
  courseId: string
  enrollmentDate: Date
}

export interface AssignmentGradeData {
  assignmentId: string
  assignmentName: string
  courseId: string
  maxGrade: number
  dueDate: Date
  category?: string
  grades: Array<{
    studentId: string
    studentName: string
    grade: number
    submittedAt: Date
    isLate: boolean
  }>
}

// Analysis request types
export interface GradeAnalysisRequest {
  type: 'course' | 'assignment' | 'student' | 'comparative'
  courseId?: string
  assignmentId?: string
  studentId?: string
  timeframe?: {
    start: Date
    end: Date
  }
  includeHistorical?: boolean
  includePredictions?: boolean
  includeCorrelations?: boolean
  config?: Partial<GradeAnalyticsConfig>
}

export interface GradeAnalysisResponse {
  success: boolean
  data?: GradeAnalyticsReport
  error?: string
  processingTime: number
  cacheKey?: string
}