import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GradeAnalyticsDashboard } from '../grade-analytics-dashboard'
import { GradeAnalyticsExample } from '../../examples/grade-analytics-example'
import { StatisticalAnalysis } from '../../../lib/grade-analytics/statistical-analysis'
import { GradePredictionEngine } from '../../../lib/grade-analytics/prediction-models'
import { 
  GradeAnalyticsReport, 
  StudentGradeData, 
  GradeStatistics,
  HistogramData,
  BoxPlotData
} from '../../../types/grade-analytics'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
}))

describe('Statistical Analysis', () => {
  describe('calculateStatistics', () => {
    it('should calculate basic statistics correctly', () => {
      const values = [85, 90, 78, 92, 88, 76, 94, 82, 89, 87]
      const stats = StatisticalAnalysis.calculateStatistics(values)

      expect(stats.mean).toBeCloseTo(86.1, 1)
      expect(stats.median).toBe(87.5)
      expect(stats.min).toBe(76)
      expect(stats.max).toBe(94)
      expect(stats.range).toBe(18)
      expect(stats.standardDeviation).toBeGreaterThan(0)
    })

    it('should handle single value', () => {
      const values = [85]
      const stats = StatisticalAnalysis.calculateStatistics(values)

      expect(stats.mean).toBe(85)
      expect(stats.median).toBe(85)
      expect(stats.min).toBe(85)
      expect(stats.max).toBe(85)
      expect(stats.range).toBe(0)
      expect(stats.standardDeviation).toBe(0)
    })

    it('should throw error for empty array', () => {
      expect(() => StatisticalAnalysis.calculateStatistics([])).toThrow()
    })
  })

  describe('createHistogram', () => {
    it('should create histogram with correct bins', () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      const histogram = StatisticalAnalysis.createHistogram(values, 5)

      expect(histogram.bins).toHaveLength(5)
      expect(histogram.totalCount).toBe(10)
      expect(histogram.binWidth).toBeCloseTo(18, 0)
      
      // Check that all counts sum to total
      const totalCount = histogram.bins.reduce((sum, bin) => sum + bin.count, 0)
      expect(totalCount).toBe(10)
    })

    it('should include student IDs when provided', () => {
      const values = [85, 90, 78]
      const studentIds = ['student1', 'student2', 'student3']
      const histogram = StatisticalAnalysis.createHistogram(values, 2, studentIds)

      expect(histogram.bins.some(bin => bin.students.length > 0)).toBe(true)
    })
  })

  describe('createBoxPlot', () => {
    it('should create box plot with quartiles', () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      const boxPlot = StatisticalAnalysis.createBoxPlot(values)

      expect(boxPlot.min).toBe(10)
      expect(boxPlot.max).toBe(100)
      expect(boxPlot.median).toBe(55)
      expect(boxPlot.q1).toBeLessThan(boxPlot.median)
      expect(boxPlot.q3).toBeGreaterThan(boxPlot.median)
    })

    it('should detect outliers', () => {
      const values = [85, 87, 88, 89, 90, 91, 92, 93, 95, 150] // 150 is an outlier
      const boxPlot = StatisticalAnalysis.createBoxPlot(values)

      expect(boxPlot.outliers.length).toBeGreaterThan(0)
      expect(boxPlot.outliers[0].value).toBe(150)
    })
  })

  describe('calculateCorrelation', () => {
    it('should calculate positive correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      const correlation = StatisticalAnalysis.calculateCorrelation(x, y)

      expect(correlation).toBeCloseTo(1, 2)
    })

    it('should calculate negative correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [10, 8, 6, 4, 2]
      const correlation = StatisticalAnalysis.calculateCorrelation(x, y)

      expect(correlation).toBeCloseTo(-1, 2)
    })

    it('should handle no correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [3, 1, 4, 1, 5]
      const correlation = StatisticalAnalysis.calculateCorrelation(x, y)

      expect(Math.abs(correlation)).toBeLessThan(0.5)
    })
  })
})

describe('Grade Prediction Engine', () => {
  const mockStudentData: StudentGradeData[] = [
    {
      studentId: 'student1',
      studentName: 'John Doe',
      courseId: 'course1',
      enrollmentDate: new Date('2024-01-01'),
      grades: [
        {
          assignmentId: 'assign1',
          assignmentName: 'Quiz 1',
          grade: 85,
          maxGrade: 100,
          submittedAt: new Date('2024-01-15'),
          isLate: false
        },
        {
          assignmentId: 'assign2',
          assignmentName: 'Quiz 2',
          grade: 90,
          maxGrade: 100,
          submittedAt: new Date('2024-01-30'),
          isLate: false
        },
        {
          assignmentId: 'assign3',
          assignmentName: 'Midterm',
          grade: 88,
          maxGrade: 100,
          submittedAt: new Date('2024-02-15'),
          isLate: false
        }
      ]
    },
    {
      studentId: 'student2',
      studentName: 'Jane Smith',
      courseId: 'course1',
      enrollmentDate: new Date('2024-01-01'),
      grades: [
        {
          assignmentId: 'assign1',
          assignmentName: 'Quiz 1',
          grade: 75,
          maxGrade: 100,
          submittedAt: new Date('2024-01-15'),
          isLate: true
        },
        {
          assignmentId: 'assign2',
          assignmentName: 'Quiz 2',
          grade: 80,
          maxGrade: 100,
          submittedAt: new Date('2024-01-30'),
          isLate: false
        },
        {
          assignmentId: 'assign3',
          assignmentName: 'Midterm',
          grade: 82,
          maxGrade: 100,
          submittedAt: new Date('2024-02-15'),
          isLate: false
        }
      ]
    }
  ]

  describe('createLinearRegressionModel', () => {
    it('should create prediction model with valid data', () => {
      const model = GradePredictionEngine.createLinearRegressionModel(mockStudentData)

      expect(model.type).toBe('linear_regression')
      expect(model.predictions).toHaveLength(mockStudentData.length)
      expect(model.accuracy).toBeGreaterThan(0)
      expect(model.rmse).toBeGreaterThan(0)
      expect(model.features.length).toBeGreaterThan(0)
    })

    it('should throw error with insufficient data', () => {
      const insufficientData = mockStudentData.slice(0, 1)
      expect(() => GradePredictionEngine.createLinearRegressionModel(insufficientData))
        .toThrow('Insufficient data for prediction model')
    })

    it('should assess risk levels correctly', () => {
      const model = GradePredictionEngine.createLinearRegressionModel(mockStudentData)
      
      model.predictions.forEach(prediction => {
        expect(['low', 'medium', 'high']).toContain(prediction.riskLevel)
        expect(prediction.confidence).toBeGreaterThanOrEqual(0)
        expect(prediction.confidence).toBeLessThanOrEqual(100)
      })
    })
  })
})

describe('GradeAnalyticsDashboard', () => {
  const mockReport: GradeAnalyticsReport = {
    id: 'report_1',
    courseId: 'course_123',
    courseName: 'Test Course',
    generatedAt: new Date('2024-01-01'),
    timeframe: {
      start: new Date('2024-01-01'),
      end: new Date('2024-03-01'),
      description: 'Spring 2024'
    },
    summary: {
      totalStudents: 25,
      totalAssignments: 5,
      overallStatistics: {
        mean: 85.5,
        median: 87.0,
        mode: [88],
        standardDeviation: 8.2,
        variance: 67.24,
        min: 65,
        max: 98,
        range: 33,
        quartiles: { q1: 80, q2: 87, q3: 92, iqr: 12 },
        percentiles: { p10: 72, p25: 80, p50: 87, p75: 92, p90: 95, p95: 97 }
      },
      keyInsights: ['Class performance is good', 'Grade distribution is normal'],
      recommendations: ['Continue current teaching methods', 'Monitor struggling students']
    },
    sections: {
      distribution: {
        histogram: {
          bins: [
            { range: '60-70', min: 60, max: 70, count: 2, percentage: 8, students: ['s1', 's2'] },
            { range: '70-80', min: 70, max: 80, count: 5, percentage: 20, students: ['s3', 's4', 's5'] },
            { range: '80-90', min: 80, max: 90, count: 12, percentage: 48, students: [] },
            { range: '90-100', min: 90, max: 100, count: 6, percentage: 24, students: [] }
          ],
          binWidth: 10,
          totalCount: 25,
          statistics: {
            mean: 85.5,
            median: 87.0,
            mode: [88],
            standardDeviation: 8.2,
            variance: 67.24,
            min: 65,
            max: 98,
            range: 33,
            quartiles: { q1: 80, q2: 87, q3: 92, iqr: 12 },
            percentiles: { p10: 72, p25: 80, p50: 87, p75: 92, p90: 95, p95: 97 }
          }
        },
        boxPlot: {
          min: 65,
          q1: 80,
          median: 87,
          q3: 92,
          max: 98,
          outliers: [{ value: 65, studentId: 's1', studentName: 'Student 1' }],
          statistics: {
            mean: 85.5,
            median: 87.0,
            mode: [88],
            standardDeviation: 8.2,
            variance: 67.24,
            min: 65,
            max: 98,
            range: 33,
            quartiles: { q1: 80, q2: 87, q3: 92, iqr: 12 },
            percentiles: { p10: 72, p25: 80, p50: 87, p75: 92, p90: 95, p95: 97 }
          }
        },
        trends: []
      }
    },
    exportFormats: []
  }

  it('should render dashboard with report data', () => {
    render(<GradeAnalyticsDashboard report={mockReport} />)

    expect(screen.getByText('Test Course - Grade Analytics')).toBeInTheDocument()
    expect(screen.getByText('25 students')).toBeInTheDocument()
    expect(screen.getByText('5 assignments')).toBeInTheDocument()
  })

  it('should display key insights', () => {
    render(<GradeAnalyticsDashboard report={mockReport} />)

    expect(screen.getByText('Class performance is good')).toBeInTheDocument()
    expect(screen.getByText('Grade distribution is normal')).toBeInTheDocument()
  })

  it('should display statistical summary', () => {
    render(<GradeAnalyticsDashboard report={mockReport} />)

    expect(screen.getByText('85.5')).toBeInTheDocument() // Mean
    expect(screen.getByText('87.0')).toBeInTheDocument() // Median
    expect(screen.getByText('8.2')).toBeInTheDocument()  // Std Dev
  })

  it('should handle export button clicks', () => {
    const mockOnExport = jest.fn()
    render(<GradeAnalyticsDashboard report={mockReport} onExport={mockOnExport} />)

    const exportButton = screen.getByText('Export PDF')
    fireEvent.click(exportButton)

    expect(mockOnExport).toHaveBeenCalledWith('pdf')
  })

  it('should switch between tabs', () => {
    render(<GradeAnalyticsDashboard report={mockReport} />)

    const distributionTab = screen.getByText('Distribution')
    fireEvent.click(distributionTab)

    // Should show distribution content
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('should display recommendations', () => {
    render(<GradeAnalyticsDashboard report={mockReport} />)

    expect(screen.getByText('Continue current teaching methods')).toBeInTheDocument()
    expect(screen.getByText('Monitor struggling students')).toBeInTheDocument()
  })
})

describe('GradeAnalyticsExample', () => {
  it('should render example component', () => {
    render(<GradeAnalyticsExample />)

    expect(screen.getByText('Grade Distribution Analysis System')).toBeInTheDocument()
    expect(screen.getByText('Run Analysis')).toBeInTheDocument()
  })

  it('should show different example types', () => {
    render(<GradeAnalyticsExample />)

    expect(screen.getByText('Comprehensive Analysis')).toBeInTheDocument()
    expect(screen.getByText('Trending Performance')).toBeInTheDocument()
    expect(screen.getByText('Struggling Class')).toBeInTheDocument()
  })

  it('should run analysis when button clicked', async () => {
    render(<GradeAnalyticsExample />)

    const runButton = screen.getByText('Run Analysis')
    fireEvent.click(runButton)

    expect(screen.getByText('Analyzing...')).toBeInTheDocument()

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Run Analysis')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display system features', () => {
    render(<GradeAnalyticsExample />)

    expect(screen.getByText('Statistical Analysis')).toBeInTheDocument()
    expect(screen.getByText('Visualizations')).toBeInTheDocument()
    expect(screen.getByText('Predictive Analytics')).toBeInTheDocument()
    expect(screen.getByText('Comparative Analysis')).toBeInTheDocument()
  })
})

describe('Integration Tests', () => {
  it('should handle complete analysis workflow', async () => {
    const mockData: StudentGradeData[] = [
      {
        studentId: 'student1',
        studentName: 'Test Student',
        courseId: 'course1',
        enrollmentDate: new Date(),
        grades: [
          {
            assignmentId: 'assign1',
            assignmentName: 'Test Assignment',
            grade: 85,
            maxGrade: 100,
            submittedAt: new Date(),
            isLate: false
          }
        ]
      }
    ]

    // Test statistical analysis
    const grades = mockData.flatMap(s => s.grades.map(g => (g.grade / g.maxGrade) * 100))
    const stats = StatisticalAnalysis.calculateStatistics(grades)
    expect(stats.mean).toBe(85)

    // Test histogram creation
    const histogram = StatisticalAnalysis.createHistogram(grades, 5)
    expect(histogram.totalCount).toBe(1)

    // Test box plot creation
    const boxPlot = StatisticalAnalysis.createBoxPlot(grades)
    expect(boxPlot.median).toBe(85)
  })

  it('should handle edge cases gracefully', () => {
    // Empty data
    expect(() => StatisticalAnalysis.calculateStatistics([])).toThrow()

    // Single data point
    const singleValue = [100]
    const stats = StatisticalAnalysis.calculateStatistics(singleValue)
    expect(stats.mean).toBe(100)
    expect(stats.standardDeviation).toBe(0)

    // Identical values
    const identicalValues = [85, 85, 85, 85]
    const identicalStats = StatisticalAnalysis.calculateStatistics(identicalValues)
    expect(identicalStats.standardDeviation).toBe(0)
    expect(identicalStats.mode).toEqual([85])
  })
})