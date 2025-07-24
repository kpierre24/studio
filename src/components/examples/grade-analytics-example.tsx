import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GradeAnalyticsDashboard } from "@/components/ui/grade-analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GradeAnalyticsReport, 
  StudentGradeData, 
  AssignmentGradeData,
  GradeAnalysisRequest 
} from "@/types/grade-analytics"
import { gradeAnalytics, StatisticalAnalysis } from "@/lib/grade-analytics"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

export function GradeAnalyticsExample() {
  const [report, setReport] = useState<GradeAnalyticsReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedExample, setSelectedExample] = useState<string>("comprehensive")

  // Generate mock data for demonstration
  const generateMockData = (type: string) => {
    const students: StudentGradeData[] = []
    const assignments: AssignmentGradeData[] = []

    // Create mock assignments
    const assignmentNames = [
      "Midterm Exam", "Final Project", "Quiz 1", "Quiz 2", "Lab Assignment 1",
      "Lab Assignment 2", "Research Paper", "Presentation", "Homework 1", "Homework 2"
    ]

    assignmentNames.forEach((name, index) => {
      assignments.push({
        assignmentId: `assignment_${index}`,
        assignmentName: name,
        courseId: "course_123",
        maxGrade: 100,
        dueDate: new Date(Date.now() - (assignmentNames.length - index) * 7 * 24 * 60 * 60 * 1000),
        category: index < 2 ? 'exam' : index < 4 ? 'quiz' : index < 6 ? 'lab' : 'homework',
        grades: []
      })
    })

    // Create mock students with different performance patterns
    const performancePatterns = {
      high: { base: 85, variance: 8, trend: 2 },
      medium: { base: 75, variance: 12, trend: 0 },
      low: { base: 65, variance: 15, trend: -1 },
      declining: { base: 80, variance: 10, trend: -3 },
      improving: { base: 60, variance: 12, trend: 4 }
    }

    const patterns = Object.keys(performancePatterns)
    
    for (let i = 0; i < 50; i++) {
      const pattern = patterns[i % patterns.length] as keyof typeof performancePatterns
      const config = performancePatterns[pattern]
      
      const student: StudentGradeData = {
        studentId: `student_${i}`,
        studentName: `Student ${i + 1}`,
        courseId: "course_123",
        enrollmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        grades: []
      }

      // Generate grades for each assignment
      assignments.forEach((assignment, assignmentIndex) => {
        const baseGrade = config.base + (config.trend * assignmentIndex)
        const randomVariation = (Math.random() - 0.5) * config.variance
        const grade = Math.max(0, Math.min(100, baseGrade + randomVariation))
        
        const isLate = Math.random() < 0.1 // 10% chance of late submission
        const submittedAt = new Date(assignment.dueDate.getTime() + (isLate ? 24 * 60 * 60 * 1000 : -Math.random() * 24 * 60 * 60 * 1000))

        student.grades.push({
          assignmentId: assignment.assignmentId,
          assignmentName: assignment.assignmentName,
          grade: Math.round(grade),
          maxGrade: assignment.maxGrade,
          submittedAt,
          isLate,
          category: assignment.category
        })

        // Add to assignment grades
        assignment.grades.push({
          studentId: student.studentId,
          studentName: student.studentName,
          grade: Math.round(grade),
          submittedAt,
          isLate
        })
      })

      students.push(student)
    }

    return { students, assignments }
  }

  const runAnalysis = async (type: string) => {
    setLoading(true)
    
    try {
      const mockData = generateMockData(type)
      
      // Create analysis request
      const request: GradeAnalysisRequest = {
        type: 'course',
        courseId: 'course_123',
        includeHistorical: true,
        includePredictions: true,
        includeCorrelations: true,
        timeframe: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }

      // Generate comprehensive report using mock data
      const mockReport = generateMockReport(mockData, request)
      setReport(mockReport)
      
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockReport = (
    data: { students: StudentGradeData[], assignments: AssignmentGradeData[] },
    request: GradeAnalysisRequest
  ): GradeAnalyticsReport => {
    const { students, assignments } = data

    // Calculate overall statistics
    const allGrades = students.flatMap(s => 
      s.grades.map(g => (g.grade / g.maxGrade) * 100)
    )
    const overallStatistics = StatisticalAnalysis.calculateStatistics(allGrades)

    // Generate histogram and box plot
    const histogram = StatisticalAnalysis.createHistogram(allGrades, 10)
    const boxPlot = StatisticalAnalysis.createBoxPlot(allGrades)

    // Generate trend data
    const trends = assignments
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

    // Generate insights
    const insights = [
      `Average class performance is ${overallStatistics.mean.toFixed(1)}%`,
      `Grade distribution shows ${overallStatistics.standardDeviation > 15 ? 'high' : 'moderate'} variability`,
      `${boxPlot.outliers.length} students identified as statistical outliers`,
      trends.length > 1 && trends[trends.length - 1].statistics.mean > trends[0].statistics.mean 
        ? 'Performance trend is improving over time'
        : 'Performance trend is stable or declining'
    ].filter(Boolean) as string[]

    // Generate recommendations
    const recommendations = [
      overallStatistics.mean < 75 && 'Consider reviewing course difficulty and providing additional support',
      overallStatistics.standardDeviation > 15 && 'Implement differentiated instruction for varying performance levels',
      boxPlot.outliers.length > 0 && `${boxPlot.outliers.length} students may need individual attention`,
      'Regular progress monitoring recommended for early intervention'
    ].filter(Boolean) as string[]

    return {
      id: `report_${Date.now()}`,
      courseId: request.courseId || 'course_123',
      courseName: 'Advanced Statistics Course',
      generatedAt: new Date(),
      timeframe: {
        start: request.timeframe?.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: request.timeframe?.end || new Date(),
        description: 'Last 3 months'
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
        comparative: {
          current: {
            courseId: 'course_123',
            courseName: 'Advanced Statistics Course',
            timeframe: 'Current Semester',
            statistics: overallStatistics,
            distribution: histogram.bins
          },
          historical: [
            {
              timeframe: 'Previous Semester',
              statistics: {
                ...overallStatistics,
                mean: overallStatistics.mean - 2.5
              },
              distribution: histogram.bins,
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
              ...overallStatistics,
              mean: overallStatistics.mean - 1.2
            }
          }
        },
        correlations: {
          assignments: assignments.slice(0, 5).map(assignment => ({
            assignmentId: assignment.assignmentId,
            assignmentName: assignment.assignmentName,
            correlations: assignments
              .filter(other => other.assignmentId !== assignment.assignmentId)
              .slice(0, 3)
              .map(other => ({
                withAssignmentId: other.assignmentId,
                withAssignmentName: other.assignmentName,
                correlationCoefficient: Math.random() * 0.8 + 0.1,
                pValue: Math.random() * 0.1,
                significance: ['strong', 'moderate', 'weak'][Math.floor(Math.random() * 3)] as 'strong' | 'moderate' | 'weak',
                relationship: Math.random() > 0.5 ? 'positive' as const : 'negative' as const
              }))
          })),
          courses: []
        },
        predictions: {
          modelId: `model_${Date.now()}`,
          type: 'linear_regression' as const,
          accuracy: 78.5,
          rmse: 8.2,
          r2Score: 0.72,
          features: [
            { name: 'Average Grade', importance: 0.85, coefficient: 0.92 },
            { name: 'Grade Trend', importance: 0.72, coefficient: 0.68 },
            { name: 'Consistency', importance: 0.58, coefficient: 0.45 },
            { name: 'Timeliness', importance: 0.41, coefficient: 0.32 },
            { name: 'Completion Rate', importance: 0.35, coefficient: 0.28 }
          ],
          predictions: students.slice(0, 20).map(student => {
            const currentGrade = student.grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / student.grades.length
            const prediction = currentGrade + (Math.random() - 0.5) * 10
            
            return {
              studentId: student.studentId,
              currentGrade,
              predictedFinalGrade: Math.max(0, Math.min(100, prediction)),
              confidence: Math.random() * 30 + 70,
              confidenceInterval: {
                lower: Math.max(0, prediction - 8),
                upper: Math.min(100, prediction + 8)
              },
              riskLevel: prediction < 65 ? 'high' as const : prediction < 75 ? 'medium' as const : 'low' as const,
              factors: [
                { factor: 'Average Grade', impact: currentGrade * 0.4, value: currentGrade },
                { factor: 'Grade Trend', impact: Math.random() * 20, value: Math.random() * 10 },
                { factor: 'Consistency', impact: Math.random() * 15, value: Math.random() * 100 }
              ]
            }
          }),
          lastTrained: new Date(),
          trainingData: {
            sampleSize: students.length,
            timeframe: 'Last 3 months',
            features: ['Average Grade', 'Grade Trend', 'Consistency', 'Timeliness', 'Completion Rate']
          }
        }
      },
      exportFormats: [
        { format: 'pdf', url: '/exports/report.pdf', generatedAt: new Date() },
        { format: 'excel', url: '/exports/report.xlsx', generatedAt: new Date() },
        { format: 'csv', url: '/exports/report.csv', generatedAt: new Date() }
      ]
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`)
    // In a real implementation, this would trigger the export process
  }

  const handleDrillDown = (type: string, data: any) => {
    console.log(`Drill down into ${type}:`, data)
    // In a real implementation, this would navigate to detailed views
  }

  useEffect(() => {
    runAnalysis(selectedExample)
  }, [selectedExample])

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution Analysis System</CardTitle>
            <CardDescription>
              Comprehensive statistical analysis, visualization, and prediction system for grade data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Statistical Analysis</Badge>
              <Badge variant="secondary">Histogram & Box Plots</Badge>
              <Badge variant="secondary">Trend Analysis</Badge>
              <Badge variant="secondary">Correlation Analysis</Badge>
              <Badge variant="secondary">Grade Prediction</Badge>
              <Badge variant="secondary">Comparative Benchmarking</Badge>
            </div>
            
            <Tabs value={selectedExample} onValueChange={setSelectedExample}>
              <TabsList>
                <TabsTrigger value="comprehensive">Comprehensive Analysis</TabsTrigger>
                <TabsTrigger value="trending">Trending Performance</TabsTrigger>
                <TabsTrigger value="struggling">Struggling Class</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comprehensive" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Complete grade analytics with all statistical measures, predictions, and correlations
                </p>
              </TabsContent>
              
              <TabsContent value="trending" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Analysis focused on improving grade trends and positive performance patterns
                </p>
              </TabsContent>
              
              <TabsContent value="struggling" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Analysis of a class with performance challenges requiring intervention
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2 mt-4">
              <Button 
                onClick={() => runAnalysis(selectedExample)} 
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              
              {report && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                    Export Excel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Dashboard */}
      {report && (
        <motion.div variants={staggerItem}>
          <GradeAnalyticsDashboard
            report={report}
            onExport={handleExport}
            onDrillDown={handleDrillDown}
          />
        </motion.div>
      )}

      {/* Features Overview */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Statistical Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mean, median, mode calculations</li>
                  <li>• Standard deviation & variance</li>
                  <li>• Quartiles & percentiles</li>
                  <li>• Outlier detection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Visualizations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Interactive histograms</li>
                  <li>• Box plots with outliers</li>
                  <li>• Trend line charts</li>
                  <li>• Correlation matrices</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Predictive Analytics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Grade prediction models</li>
                  <li>• Risk assessment</li>
                  <li>• Early intervention alerts</li>
                  <li>• Performance forecasting</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Comparative Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Historical comparisons</li>
                  <li>• Benchmark analysis</li>
                  <li>• Cross-course correlations</li>
                  <li>• Performance trends</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Reporting</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automated report generation</li>
                  <li>• Multiple export formats</li>
                  <li>• Customizable dashboards</li>
                  <li>• Scheduled delivery</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Integration</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time data processing</li>
                  <li>• API-driven architecture</li>
                  <li>• Caching & optimization</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}