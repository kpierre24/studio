// Grade Prediction Models

import { GradePredictionModel, StudentGradeData } from '@/types/grade-analytics'
import { StatisticalAnalysis } from './statistical-analysis'

export class GradePredictionEngine {
  /**
   * Create a linear regression model for grade prediction
   */
  static createLinearRegressionModel(
    studentData: StudentGradeData[],
    modelId: string = `model_${Date.now()}`
  ): GradePredictionModel {
    const trainingData = this.prepareTrainingData(studentData)
    
    if (trainingData.length < 3) {
      throw new Error('Insufficient data for prediction model (minimum 3 data points required)')
    }

    // Extract features and targets
    const features = trainingData.map(d => d.features)
    const targets = trainingData.map(d => d.finalGrade)

    // Perform multiple linear regression
    const model = this.multipleLinearRegression(features, targets)
    
    // Calculate model performance metrics
    const predictions = features.map(f => this.predictWithLinearModel(f, model.coefficients))
    const rmse = this.calculateRMSE(targets, predictions)
    const r2Score = this.calculateR2Score(targets, predictions)

    // Generate predictions for current students
    const currentPredictions = studentData.map(student => {
      const currentFeatures = this.extractCurrentFeatures(student)
      const prediction = this.predictWithLinearModel(currentFeatures, model.coefficients)
      const confidence = this.calculatePredictionConfidence(prediction, rmse, r2Score)
      
      return {
        studentId: student.studentId,
        currentGrade: this.calculateCurrentGrade(student),
        predictedFinalGrade: Math.round(Math.max(0, Math.min(100, prediction)) * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        confidenceInterval: {
          lower: Math.round(Math.max(0, prediction - 1.96 * rmse) * 100) / 100,
          upper: Math.round(Math.min(100, prediction + 1.96 * rmse) * 100) / 100
        },
        riskLevel: this.assessRiskLevel(prediction),
        factors: this.identifyKeyFactors(currentFeatures, model.coefficients, model.featureNames)
      }
    })

    return {
      modelId,
      type: 'linear_regression',
      accuracy: Math.round((1 - rmse / 100) * 10000) / 100, // Convert RMSE to accuracy percentage
      rmse: Math.round(rmse * 100) / 100,
      r2Score: Math.round(r2Score * 1000) / 1000,
      features: model.featureNames.map((name, index) => ({
        name,
        importance: Math.abs(model.coefficients[index]) / Math.max(...model.coefficients.map(Math.abs)),
        coefficient: Math.round(model.coefficients[index] * 1000) / 1000
      })),
      predictions: currentPredictions,
      lastTrained: new Date(),
      trainingData: {
        sampleSize: trainingData.length,
        timeframe: this.getTrainingTimeframe(studentData),
        features: model.featureNames
      }
    }
  }

  /**
   * Prepare training data from student grade data
   */
  private static prepareTrainingData(studentData: StudentGradeData[]) {
    return studentData
      .filter(student => student.grades.length >= 3) // Need minimum assignments for prediction
      .map(student => {
        const sortedGrades = student.grades.sort((a, b) => 
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        )

        // Use first 70% of assignments as features, remaining as target
        const splitPoint = Math.floor(sortedGrades.length * 0.7)
        const earlyGrades = sortedGrades.slice(0, Math.max(2, splitPoint))
        const laterGrades = sortedGrades.slice(splitPoint)

        const features = this.extractFeatures(earlyGrades, student)
        const finalGrade = this.calculateAverageGrade(laterGrades.length > 0 ? laterGrades : sortedGrades)

        return {
          studentId: student.studentId,
          features,
          finalGrade
        }
      })
  }

  /**
   * Extract features from early assignment grades
   */
  private static extractFeatures(grades: StudentGradeData['grades'], student: StudentGradeData): number[] {
    const averageGrade = this.calculateAverageGrade(grades)
    const gradeValues = grades.map(g => (g.grade / g.maxGrade) * 100)
    
    // Calculate trend
    const trend = this.calculateTrend(gradeValues)
    
    // Calculate consistency (inverse of standard deviation)
    const consistency = gradeValues.length > 1 ? 
      100 - StatisticalAnalysis.calculateStatistics(gradeValues).standardDeviation : 100

    // Calculate submission timeliness
    const lateSubmissions = grades.filter(g => g.isLate).length
    const timelinessScore = 100 - (lateSubmissions / grades.length) * 100

    // Calculate assignment completion rate (assuming all assignments should be submitted)
    const completionRate = 100 // Simplified - in real implementation, compare with total assignments

    return [
      averageGrade,
      trend,
      consistency,
      timelinessScore,
      completionRate,
      grades.length // Number of assignments completed
    ]
  }

  /**
   * Extract current features for prediction
   */
  private static extractCurrentFeatures(student: StudentGradeData): number[] {
    return this.extractFeatures(student.grades, student)
  }

  /**
   * Get feature names
   */
  private static getFeatureNames(): string[] {
    return [
      'Average Grade',
      'Grade Trend',
      'Consistency',
      'Timeliness',
      'Completion Rate',
      'Assignments Completed'
    ]
  }

  /**
   * Perform multiple linear regression
   */
  private static multipleLinearRegression(features: number[][], targets: number[]) {
    const n = features.length
    const m = features[0].length

    // Add bias term (intercept)
    const X = features.map(row => [1, ...row])
    const y = targets

    // Calculate coefficients using normal equation: β = (X'X)^(-1)X'y
    const XTranspose = this.transpose(X)
    const XTX = this.matrixMultiply(XTranspose, X)
    const XTXInverse = this.matrixInverse(XTX)
    const XTy = this.matrixVectorMultiply(XTranspose, y)
    const coefficients = this.matrixVectorMultiply(XTXInverse, XTy)

    return {
      coefficients,
      featureNames: ['Intercept', ...this.getFeatureNames()]
    }
  }

  /**
   * Predict with linear model
   */
  private static predictWithLinearModel(features: number[], coefficients: number[]): number {
    const featuresWithBias = [1, ...features]
    return featuresWithBias.reduce((sum, feature, index) => sum + feature * coefficients[index], 0)
  }

  /**
   * Calculate RMSE (Root Mean Square Error)
   */
  private static calculateRMSE(actual: number[], predicted: number[]): number {
    const mse = actual.reduce((sum, actual, index) => {
      const error = actual - predicted[index]
      return sum + error * error
    }, 0) / actual.length

    return Math.sqrt(mse)
  }

  /**
   * Calculate R² score (coefficient of determination)
   */
  private static calculateR2Score(actual: number[], predicted: number[]): number {
    const actualMean = StatisticalAnalysis.calculateStatistics(actual).mean
    
    const totalSumSquares = actual.reduce((sum, value) => sum + Math.pow(value - actualMean, 2), 0)
    const residualSumSquares = actual.reduce((sum, value, index) => 
      sum + Math.pow(value - predicted[index], 2), 0)

    return totalSumSquares === 0 ? 1 : 1 - (residualSumSquares / totalSumSquares)
  }

  /**
   * Calculate prediction confidence
   */
  private static calculatePredictionConfidence(prediction: number, rmse: number, r2Score: number): number {
    // Confidence based on model performance and prediction range
    const baseConfidence = r2Score * 100
    const rangeConfidence = prediction >= 0 && prediction <= 100 ? 100 : 
      Math.max(0, 100 - Math.abs(prediction < 0 ? prediction : prediction - 100))
    
    return Math.min(100, (baseConfidence + rangeConfidence) / 2)
  }

  /**
   * Assess risk level based on predicted grade
   */
  private static assessRiskLevel(predictedGrade: number): 'low' | 'medium' | 'high' {
    if (predictedGrade >= 80) return 'low'
    if (predictedGrade >= 65) return 'medium'
    return 'high'
  }

  /**
   * Identify key factors affecting prediction
   */
  private static identifyKeyFactors(
    features: number[], 
    coefficients: number[], 
    featureNames: string[]
  ) {
    return featureNames
      .slice(1) // Skip intercept
      .map((name, index) => ({
        factor: name,
        impact: Math.abs(coefficients[index + 1]) * features[index],
        value: features[index]
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3) // Top 3 factors
      .map(factor => ({
        ...factor,
        impact: Math.round(factor.impact * 100) / 100,
        value: Math.round(factor.value * 100) / 100
      }))
  }

  /**
   * Calculate current grade for a student
   */
  private static calculateCurrentGrade(student: StudentGradeData): number {
    return this.calculateAverageGrade(student.grades)
  }

  /**
   * Calculate average grade from assignments
   */
  private static calculateAverageGrade(grades: StudentGradeData['grades']): number {
    if (grades.length === 0) return 0
    
    const totalPoints = grades.reduce((sum, grade) => sum + grade.grade, 0)
    const maxPoints = grades.reduce((sum, grade) => sum + grade.maxGrade, 0)
    
    return maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0
  }

  /**
   * Calculate grade trend
   */
  private static calculateTrend(grades: number[]): number {
    if (grades.length < 2) return 0

    // Simple linear regression to find slope
    const n = grades.length
    const x = Array.from({ length: n }, (_, i) => i + 1)
    const y = grades

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    return slope * 10 // Scale for feature importance
  }

  /**
   * Get training timeframe description
   */
  private static getTrainingTimeframe(studentData: StudentGradeData[]): string {
    const allDates = studentData.flatMap(s => s.grades.map(g => new Date(g.submittedAt)))
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
  }

  // Matrix operations for linear regression
  private static transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))
  }

  private static matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result = Array(a.length).fill(null).map(() => Array(b[0].length).fill(0))
    
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j]
        }
      }
    }
    
    return result
  }

  private static matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, index) => sum + val * vector[index], 0)
    )
  }

  private static matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length
    
    // Create augmented matrix [A|I]
    const augmented = matrix.map((row, i) => [
      ...row,
      ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    ])

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]
      
      // Make diagonal element 1
      const pivot = augmented[i][i]
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Matrix is singular and cannot be inverted')
      }
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i]
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j]
          }
        }
      }
    }

    // Extract inverse matrix
    return augmented.map(row => row.slice(n))
  }
}