import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PerformanceInsightsDashboard } from '../performance-insights-dashboard'
import { PerformanceInsightsExample } from '../../examples/performance-insights-example'
import { 
  RiskAssessmentEngine, 
  TrendAnalysisEngine, 
  InterventionEngine,
  AlertSystem,
  CohortAnalysisEngine,
  defaultRiskConfig 
} from '@/lib/performance-insights'
import { StudentPerformanceData } from '@/types/performance-insights'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock hooks
jest.mock('@/hooks/usePerformanceInsights', () => ({
  usePerformanceInsights: () => ({
    isLoading: false,
    error: null,
    dashboardData: {
      overview: {
        totalStudents: 25,
        atRiskStudents: 3,
        averagePerformance: 78.5,
        attendanceRate: 0.85,
        engagementScore: 0.72
      },
      alerts: [],
      trends: {
        performanceTrend: 'stable',
        engagementTrend: 'improving',
        attendanceTrend: 'stable'
      },
      actionItems: [],
      studentAnalyses: [],
      cohortAnalysis: {
        courseId: 'test-course',
        timeframe: 'month',
        metrics: {
          averageGrade: 78.5,
          medianGrade: 80,
          gradeDistribution: [],
          attendanceRate: 0.85,
          completionRate: 0.78,
          engagementScore: 0.72
        },
        studentComparisons: []
      },
      summaryInsights: {
        highRiskStudents: 3,
        studentsNeedingIntervention: 5,
        commonIssues: ['low_engagement'],
        recommendations: ['Implement interactive activities']
      }
    },
    lastUpdated: new Date(),
    refresh: jest.fn()
  }),
  usePerformanceAlerts: () => ({
    alerts: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    dismissAlert: jest.fn()
  })
}))

// Mock student data
const mockStudentData: StudentPerformanceData = {
  studentId: 'student-1',
  courseId: 'course-1',
  currentGrade: 75,
  assignmentScores: [
    {
      assignmentId: 'assignment-1',
      score: 85,
      maxScore: 100,
      submittedAt: new Date('2024-01-15'),
      isLate: false,
      timeSpent: 90
    },
    {
      assignmentId: 'assignment-2',
      score: 70,
      maxScore: 100,
      submittedAt: new Date('2024-01-20'),
      isLate: true,
      timeSpent: 120
    }
  ],
  attendanceRate: 0.8,
  engagementMetrics: {
    loginFrequency: 4,
    timeSpentOnPlatform: 180,
    lessonCompletionRate: 0.75,
    assignmentSubmissionRate: 0.85,
    forumParticipation: 2,
    lastActivity: new Date('2024-01-25')
  },
  learningVelocity: {
    averageTimePerLesson: 60,
    averageTimePerAssignment: 105,
    completionTrend: 'stable'
  }
}

describe('Performance Insights System', () => {
  describe('Risk Assessment Engine', () => {
    let riskEngine: RiskAssessmentEngine

    beforeEach(() => {
      riskEngine = new RiskAssessmentEngine(defaultRiskConfig)
    })

    test('should assess student risk correctly', () => {
      const assessment = riskEngine.assessStudentRisk(mockStudentData)

      expect(assessment).toHaveProperty('studentId', 'student-1')
      expect(assessment).toHaveProperty('courseId', 'course-1')
      expect(assessment).toHaveProperty('riskLevel')
      expect(assessment).toHaveProperty('riskScore')
      expect(assessment).toHaveProperty('riskFactors')
      expect(assessment).toHaveProperty('predictedOutcome')
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0)
      expect(assessment.riskScore).toBeLessThanOrEqual(100)
    })

    test('should identify high-risk students', () => {
      const highRiskStudent: StudentPerformanceData = {
        ...mockStudentData,
        currentGrade: 55,
        attendanceRate: 0.6,
        engagementMetrics: {
          ...mockStudentData.engagementMetrics,
          assignmentSubmissionRate: 0.5,
          lessonCompletionRate: 0.4
        }
      }

      const assessment = riskEngine.assessStudentRisk(highRiskStudent)
      expect(['high', 'critical']).toContain(assessment.riskLevel)
      expect(assessment.riskFactors.length).toBeGreaterThan(0)
    })

    test('should predict outcomes accurately', () => {
      const assessment = riskEngine.assessStudentRisk(mockStudentData)
      
      expect(assessment.predictedOutcome.finalGrade).toBeGreaterThanOrEqual(0)
      expect(assessment.predictedOutcome.finalGrade).toBeLessThanOrEqual(100)
      expect(assessment.predictedOutcome.passLikelihood).toBeGreaterThanOrEqual(0)
      expect(assessment.predictedOutcome.passLikelihood).toBeLessThanOrEqual(1)
      expect(assessment.predictedOutcome.completionLikelihood).toBeGreaterThanOrEqual(0)
      expect(assessment.predictedOutcome.completionLikelihood).toBeLessThanOrEqual(1)
    })
  })

  describe('Trend Analysis Engine', () => {
    let trendEngine: TrendAnalysisEngine

    beforeEach(() => {
      trendEngine = new TrendAnalysisEngine()
    })

    test('should analyze performance trends', () => {
      const trends = trendEngine.analyzePerformanceTrends(mockStudentData)

      expect(trends).toHaveProperty('studentId', 'student-1')
      expect(trends).toHaveProperty('courseId', 'course-1')
      expect(trends).toHaveProperty('timeframe')
      expect(trends).toHaveProperty('trends')
      expect(trends.trends).toHaveProperty('gradesTrend')
      expect(trends.trends).toHaveProperty('engagementTrend')
      expect(trends.trends).toHaveProperty('attendanceTrend')
    })

    test('should generate trend insights', () => {
      const trends = trendEngine.analyzePerformanceTrends(mockStudentData)
      const insights = trendEngine.generateTrendInsights(trends)

      expect(insights).toHaveProperty('insights')
      expect(insights).toHaveProperty('recommendations')
      expect(insights).toHaveProperty('visualIndicators')
      expect(Array.isArray(insights.insights)).toBe(true)
      expect(Array.isArray(insights.recommendations)).toBe(true)
    })
  })

  describe('Intervention Engine', () => {
    let interventionEngine: InterventionEngine
    let riskEngine: RiskAssessmentEngine

    beforeEach(() => {
      interventionEngine = new InterventionEngine()
      riskEngine = new RiskAssessmentEngine(defaultRiskConfig)
    })

    test('should generate interventions for at-risk students', () => {
      const riskAssessment = riskEngine.assessStudentRisk(mockStudentData)
      const interventions = interventionEngine.generateInterventions(
        riskAssessment,
        mockStudentData
      )

      expect(Array.isArray(interventions)).toBe(true)
      interventions.forEach(intervention => {
        expect(intervention).toHaveProperty('id')
        expect(intervention).toHaveProperty('studentId', 'student-1')
        expect(intervention).toHaveProperty('courseId', 'course-1')
        expect(intervention).toHaveProperty('type')
        expect(intervention).toHaveProperty('priority')
        expect(intervention).toHaveProperty('title')
        expect(intervention).toHaveProperty('description')
        expect(intervention).toHaveProperty('suggestedActions')
        expect(Array.isArray(intervention.suggestedActions)).toBe(true)
      })
    })

    test('should generate learning recommendations', () => {
      const riskAssessment = riskEngine.assessStudentRisk(mockStudentData)
      const recommendations = interventionEngine.generateLearningRecommendations(
        mockStudentData,
        riskAssessment
      )

      expect(Array.isArray(recommendations)).toBe(true)
      recommendations.forEach(recommendation => {
        expect(recommendation).toHaveProperty('id')
        expect(recommendation).toHaveProperty('studentId', 'student-1')
        expect(recommendation).toHaveProperty('courseId', 'course-1')
        expect(recommendation).toHaveProperty('type')
        expect(recommendation).toHaveProperty('title')
        expect(recommendation).toHaveProperty('description')
        expect(recommendation).toHaveProperty('reasoning')
        expect(recommendation).toHaveProperty('resources')
        expect(Array.isArray(recommendation.resources)).toBe(true)
      })
    })
  })

  describe('Alert System', () => {
    let alertSystem: AlertSystem
    let riskEngine: RiskAssessmentEngine

    beforeEach(() => {
      alertSystem = new AlertSystem(defaultRiskConfig)
      riskEngine = new RiskAssessmentEngine(defaultRiskConfig)
    })

    test('should generate alerts for high-risk students', () => {
      const riskAssessment = riskEngine.assessStudentRisk(mockStudentData)
      const alerts = alertSystem.generateAlerts(
        riskAssessment,
        mockStudentData,
        'teacher-1'
      )

      expect(Array.isArray(alerts)).toBe(true)
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('id')
        expect(alert).toHaveProperty('teacherId', 'teacher-1')
        expect(alert).toHaveProperty('courseId', 'course-1')
        expect(alert).toHaveProperty('studentId', 'student-1')
        expect(alert).toHaveProperty('type')
        expect(alert).toHaveProperty('severity')
        expect(alert).toHaveProperty('title')
        expect(alert).toHaveProperty('message')
        expect(alert).toHaveProperty('actionRequired')
        expect(alert).toHaveProperty('createdAt')
      })
    })
  })

  describe('Cohort Analysis Engine', () => {
    let cohortEngine: CohortAnalysisEngine

    beforeEach(() => {
      cohortEngine = new CohortAnalysisEngine()
    })

    test('should analyze cohort performance', () => {
      const studentsData = [mockStudentData, {
        ...mockStudentData,
        studentId: 'student-2',
        currentGrade: 85,
        attendanceRate: 0.9
      }]

      const analysis = cohortEngine.analyzeCohortPerformance(studentsData, 'course-1')

      expect(analysis).toHaveProperty('courseId', 'course-1')
      expect(analysis).toHaveProperty('timeframe')
      expect(analysis).toHaveProperty('metrics')
      expect(analysis).toHaveProperty('studentComparisons')
      expect(analysis.metrics).toHaveProperty('averageGrade')
      expect(analysis.metrics).toHaveProperty('medianGrade')
      expect(analysis.metrics).toHaveProperty('gradeDistribution')
      expect(Array.isArray(analysis.studentComparisons)).toBe(true)
    })

    test('should generate cohort insights', () => {
      const studentsData = [mockStudentData]
      const analysis = cohortEngine.analyzeCohortPerformance(studentsData, 'course-1')
      const insights = cohortEngine.generateCohortInsights(analysis)

      expect(insights).toHaveProperty('insights')
      expect(insights).toHaveProperty('recommendations')
      expect(insights).toHaveProperty('concerningTrends')
      expect(insights).toHaveProperty('positiveHighlights')
      expect(Array.isArray(insights.insights)).toBe(true)
      expect(Array.isArray(insights.recommendations)).toBe(true)
    })
  })

  describe('Performance Insights Dashboard', () => {
    test('should render dashboard with student data', async () => {
      render(
        <PerformanceInsightsDashboard
          courseId="course-1"
          teacherId="teacher-1"
          studentsData={[mockStudentData]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Performance Insights')).toBeInTheDocument()
      })

      // Check for tabs
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Alerts')).toBeInTheDocument()
      expect(screen.getByText('Students')).toBeInTheDocument()
      expect(screen.getByText('Cohort Analysis')).toBeInTheDocument()
    })

    test('should handle tab navigation', async () => {
      render(
        <PerformanceInsightsDashboard
          courseId="course-1"
          teacherId="teacher-1"
          studentsData={[mockStudentData]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Performance Insights')).toBeInTheDocument()
      })

      // Click on Alerts tab
      fireEvent.click(screen.getByText('Alerts'))
      
      // Should show alerts content
      await waitFor(() => {
        expect(screen.getByText('No Priority Alerts')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Insights Example', () => {
    test('should render example component', async () => {
      render(<PerformanceInsightsExample />)

      await waitFor(() => {
        expect(screen.getByText('Performance Insights & Early Intervention')).toBeInTheDocument()
      })

      expect(screen.getByText('AI-powered student analytics and automated intervention recommendations')).toBeInTheDocument()
      expect(screen.getByText('System Features')).toBeInTheDocument()
    })

    test('should show feature highlights', async () => {
      render(<PerformanceInsightsExample />)

      await waitFor(() => {
        expect(screen.getByText('At-Risk Identification')).toBeInTheDocument()
        expect(screen.getByText('Performance Trends')).toBeInTheDocument()
        expect(screen.getByText('Automated Alerts')).toBeInTheDocument()
        expect(screen.getByText('Cohort Analysis')).toBeInTheDocument()
        expect(screen.getByText('Intervention Engine')).toBeInTheDocument()
        expect(screen.getByText('Predictive Models')).toBeInTheDocument()
      })
    })
  })
})