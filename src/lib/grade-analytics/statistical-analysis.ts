// Statistical Analysis Utilities for Grade Distribution

import { GradeStatistics, GradeDistributionBin, HistogramData, BoxPlotData } from '@/types/grade-analytics'

export class StatisticalAnalysis {
  /**
   * Calculate comprehensive statistics for a dataset
   */
  static calculateStatistics(values: number[]): GradeStatistics {
    if (values.length === 0) {
      throw new Error('Cannot calculate statistics for empty dataset')
    }

    const sortedValues = [...values].sort((a, b) => a - b)
    const n = values.length

    // Basic statistics
    const mean = this.calculateMean(values)
    const median = this.calculateMedian(sortedValues)
    const mode = this.calculateMode(values)
    const variance = this.calculateVariance(values, mean)
    const standardDeviation = Math.sqrt(variance)
    const min = sortedValues[0]
    const max = sortedValues[n - 1]
    const range = max - min

    // Quartiles
    const q1 = this.calculatePercentile(sortedValues, 25)
    const q3 = this.calculatePercentile(sortedValues, 75)
    const iqr = q3 - q1

    // Percentiles
    const percentiles = {
      p10: this.calculatePercentile(sortedValues, 10),
      p25: q1,
      p50: median,
      p75: q3,
      p90: this.calculatePercentile(sortedValues, 90),
      p95: this.calculatePercentile(sortedValues, 95)
    }

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      min,
      max,
      range,
      quartiles: {
        q1: Math.round(q1 * 100) / 100,
        q2: Math.round(median * 100) / 100,
        q3: Math.round(q3 * 100) / 100,
        iqr: Math.round(iqr * 100) / 100
      },
      percentiles: {
        p10: Math.round(percentiles.p10 * 100) / 100,
        p25: Math.round(percentiles.p25 * 100) / 100,
        p50: Math.round(percentiles.p50 * 100) / 100,
        p75: Math.round(percentiles.p75 * 100) / 100,
        p90: Math.round(percentiles.p90 * 100) / 100,
        p95: Math.round(percentiles.p95 * 100) / 100
      }
    }
  }

  /**
   * Calculate mean (average)
   */
  private static calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  /**
   * Calculate median (middle value)
   */
  private static calculateMedian(sortedValues: number[]): number {
    const n = sortedValues.length
    const mid = Math.floor(n / 2)
    
    if (n % 2 === 0) {
      return (sortedValues[mid - 1] + sortedValues[mid]) / 2
    } else {
      return sortedValues[mid]
    }
  }

  /**
   * Calculate mode (most frequent values)
   */
  private static calculateMode(values: number[]): number[] {
    const frequency: { [key: number]: number } = {}
    
    // Count frequencies
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1
    })

    // Find maximum frequency
    const maxFreq = Math.max(...Object.values(frequency))
    
    // Return all values with maximum frequency
    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number)
      .sort((a, b) => a - b)
  }

  /**
   * Calculate variance
   */
  private static calculateVariance(values: number[], mean?: number): number {
    const avg = mean ?? this.calculateMean(values)
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2))
    return this.calculateMean(squaredDiffs)
  }

  /**
   * Calculate percentile
   */
  private static calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1)
    
    if (Number.isInteger(index)) {
      return sortedValues[index]
    } else {
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower
      
      return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
    }
  }

  /**
   * Create histogram with equal-width bins
   */
  static createHistogram(
    values: number[], 
    binCount: number = 10,
    studentIds?: string[]
  ): HistogramData {
    if (values.length === 0) {
      throw new Error('Cannot create histogram for empty dataset')
    }

    const statistics = this.calculateStatistics(values)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / binCount

    const bins: GradeDistributionBin[] = []

    for (let i = 0; i < binCount; i++) {
      const binMin = min + i * binWidth
      const binMax = i === binCount - 1 ? max : min + (i + 1) * binWidth
      
      const studentsInBin: string[] = []
      const count = values.filter((value, index) => {
        const inBin = value >= binMin && (i === binCount - 1 ? value <= binMax : value < binMax)
        if (inBin && studentIds && studentIds[index]) {
          studentsInBin.push(studentIds[index])
        }
        return inBin
      }).length

      bins.push({
        range: `${Math.round(binMin)}-${Math.round(binMax)}`,
        min: Math.round(binMin * 100) / 100,
        max: Math.round(binMax * 100) / 100,
        count,
        percentage: Math.round((count / values.length) * 10000) / 100,
        students: studentsInBin,
        color: this.getBinColor(binMin, binMax, min, max)
      })
    }

    return {
      bins,
      binWidth: Math.round(binWidth * 100) / 100,
      totalCount: values.length,
      statistics
    }
  }

  /**
   * Create box plot data
   */
  static createBoxPlot(
    values: number[], 
    studentIds?: string[], 
    studentNames?: string[]
  ): BoxPlotData {
    if (values.length === 0) {
      throw new Error('Cannot create box plot for empty dataset')
    }

    const statistics = this.calculateStatistics(values)
    const { quartiles } = statistics

    // Detect outliers using IQR method
    const outlierThreshold = 1.5 * quartiles.iqr
    const lowerFence = quartiles.q1 - outlierThreshold
    const upperFence = quartiles.q3 + outlierThreshold

    const outliers = values
      .map((value, index) => ({
        value,
        index,
        studentId: studentIds?.[index] || `student_${index}`,
        studentName: studentNames?.[index]
      }))
      .filter(item => item.value < lowerFence || item.value > upperFence)
      .map(item => ({
        value: item.value,
        studentId: item.studentId,
        studentName: item.studentName
      }))

    return {
      min: statistics.min,
      q1: quartiles.q1,
      median: quartiles.q2,
      q3: quartiles.q3,
      max: statistics.max,
      outliers,
      statistics
    }
  }

  /**
   * Calculate correlation coefficient between two datasets
   */
  static calculateCorrelation(x: number[], y: number[], method: 'pearson' | 'spearman' = 'pearson'): number {
    if (x.length !== y.length || x.length === 0) {
      throw new Error('Datasets must have the same non-zero length')
    }

    if (method === 'spearman') {
      // Convert to ranks for Spearman correlation
      const xRanks = this.convertToRanks(x)
      const yRanks = this.convertToRanks(y)
      return this.pearsonCorrelation(xRanks, yRanks)
    }

    return this.pearsonCorrelation(x, y)
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length
    const meanX = this.calculateMean(x)
    const meanY = this.calculateMean(y)

    let numerator = 0
    let sumXSquared = 0
    let sumYSquared = 0

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX
      const yDiff = y[i] - meanY
      
      numerator += xDiff * yDiff
      sumXSquared += xDiff * xDiff
      sumYSquared += yDiff * yDiff
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared)
    
    if (denominator === 0) {
      return 0 // No correlation if no variance
    }

    return numerator / denominator
  }

  /**
   * Convert values to ranks for Spearman correlation
   */
  private static convertToRanks(values: number[]): number[] {
    const indexed = values.map((value, index) => ({ value, index }))
    indexed.sort((a, b) => a.value - b.value)

    const ranks = new Array(values.length)
    
    for (let i = 0; i < indexed.length; i++) {
      ranks[indexed[i].index] = i + 1
    }

    return ranks
  }

  /**
   * Get color for histogram bin based on grade range
   */
  private static getBinColor(min: number, max: number, dataMin: number, dataMax: number): string {
    const midpoint = (min + max) / 2
    const range = dataMax - dataMin
    const position = (midpoint - dataMin) / range

    // Color gradient from red (low grades) to green (high grades)
    if (position < 0.2) return 'hsl(0, 70%, 60%)' // Red
    if (position < 0.4) return 'hsl(30, 70%, 60%)' // Orange
    if (position < 0.6) return 'hsl(60, 70%, 60%)' // Yellow
    if (position < 0.8) return 'hsl(120, 50%, 60%)' // Light Green
    return 'hsl(120, 70%, 50%)' // Green
  }

  /**
   * Perform t-test to compare two grade distributions
   */
  static tTest(sample1: number[], sample2: number[]): {
    tStatistic: number
    pValue: number
    significant: boolean
    effect: 'small' | 'medium' | 'large'
  } {
    const mean1 = this.calculateMean(sample1)
    const mean2 = this.calculateMean(sample2)
    const var1 = this.calculateVariance(sample1, mean1)
    const var2 = this.calculateVariance(sample2, mean2)
    const n1 = sample1.length
    const n2 = sample2.length

    // Pooled standard error
    const pooledSE = Math.sqrt((var1 / n1) + (var2 / n2))
    
    // t-statistic
    const tStatistic = (mean1 - mean2) / pooledSE
    
    // Degrees of freedom (Welch's t-test approximation)
    const df = Math.pow((var1/n1) + (var2/n2), 2) / 
               (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1))

    // Approximate p-value (simplified)
    const pValue = this.approximatePValue(Math.abs(tStatistic), df)
    
    // Effect size (Cohen's d)
    const pooledSD = Math.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))
    const cohensD = Math.abs(mean1 - mean2) / pooledSD
    
    let effect: 'small' | 'medium' | 'large'
    if (cohensD < 0.2) effect = 'small'
    else if (cohensD < 0.8) effect = 'medium'
    else effect = 'large'

    return {
      tStatistic: Math.round(tStatistic * 1000) / 1000,
      pValue: Math.round(pValue * 1000) / 1000,
      significant: pValue < 0.05,
      effect
    }
  }

  /**
   * Approximate p-value for t-test (simplified calculation)
   */
  private static approximatePValue(t: number, df: number): number {
    // Simplified approximation - in production, use a proper statistical library
    if (df >= 30) {
      // Use normal approximation for large df
      return 2 * (1 - this.normalCDF(t))
    }
    
    // Very rough approximation for small df
    const criticalValues = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228]
    const alpha = [0.05, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001, 0.00005, 0.00002]
    
    for (let i = 0; i < criticalValues.length; i++) {
      if (t < criticalValues[i]) {
        return i === 0 ? 0.1 : alpha[i-1]
      }
    }
    
    return 0.00001
  }

  /**
   * Normal cumulative distribution function approximation
   */
  private static normalCDF(x: number): number {
    // Abramowitz and Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp(-x * x / 2)
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    
    return x > 0 ? 1 - prob : prob
  }
}