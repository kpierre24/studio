import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  // BoxPlot, // Not available in recharts
  ScatterChart,
  Scatter
} from "recharts"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GradeAnalyticsReport, 
  GradeStatistics, 
  HistogramData, 
  BoxPlotData,
  GradeTrendPoint,
  ComparativeAnalysis,
  CorrelationAnalysis as CorrelationAnalysisType,
  GradePredictionModel
} from "@/types/grade-analytics"

interface GradeAnalyticsDashboardProps {
  report: GradeAnalyticsReport
  className?: string
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
  onDrillDown?: (type: string, data: any) => void
}

export function GradeAnalyticsDashboard({
  report,
  className,
  onExport,
  onDrillDown
}: GradeAnalyticsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{report.courseName} - Grade Analytics</h1>
          <p className="text-muted-foreground">
            Generated on {report.generatedAt.toLocaleDateString()} • 
            {report.summary.totalStudents} students • 
            {report.summary.totalAssignments} assignments
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>
          
          {onExport && (
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('excel')}>
                Export Excel
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.summary.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Overview */}
      <motion.div variants={staggerItem}>
        <StatisticsOverview statistics={report.summary.overallStatistics} />
      </motion.div>

      {/* Main Analytics Tabs */}
      <motion.div variants={staggerItem}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistogramChart data={report.sections.distribution.histogram} />
              <BoxPlotChart data={report.sections.distribution.boxPlot} />
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <DistributionAnalysis 
              histogram={report.sections.distribution.histogram}
              boxPlot={report.sections.distribution.boxPlot}
              onDrillDown={onDrillDown}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendAnalysis 
              trends={report.sections.distribution.trends}
              onDrillDown={onDrillDown}
            />
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            {report.sections.correlations && (
              <CorrelationAnalysis 
                correlations={report.sections.correlations}
                onDrillDown={onDrillDown}
              />
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {report.sections.predictions && (
              <PredictionAnalysis 
                predictions={report.sections.predictions}
                onDrillDown={onDrillDown}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Based on the grade analysis, here are suggested actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.summary.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Statistics Overview Component
function StatisticsOverview({ statistics }: { statistics: GradeStatistics }) {
  const stats = [
    { label: "Mean", value: statistics.mean.toFixed(1), suffix: "%" },
    { label: "Median", value: statistics.median.toFixed(1), suffix: "%" },
    { label: "Std Dev", value: statistics.standardDeviation.toFixed(1), suffix: "%" },
    { label: "Range", value: statistics.range.toFixed(1), suffix: "%" },
    { label: "Q1", value: statistics.quartiles.q1.toFixed(1), suffix: "%" },
    { label: "Q3", value: statistics.quartiles.q3.toFixed(1), suffix: "%" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistical Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="text-center p-4 bg-muted/50 rounded-lg"
            >
              <p className="text-2xl font-bold text-primary">
                {stat.value}
                <span className="text-sm text-muted-foreground">{stat.suffix}</span>
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Histogram Chart Component
function HistogramChart({ data }: { data: HistogramData }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">Grade Range: {label}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Histogram showing grade frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.bins}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="range" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.bins.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Box Plot Chart Component
function BoxPlotChart({ data }: { data: BoxPlotData }) {
  const boxPlotData = [
    {
      name: "Grades",
      min: data.min,
      q1: data.q1,
      median: data.median,
      q3: data.q3,
      max: data.max,
      outliers: data.outliers.map(o => o.value)
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Box Plot Analysis</CardTitle>
        <CardDescription>Statistical distribution with outliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual Box Plot Representation */}
          <div className="relative h-32 bg-muted/20 rounded-lg p-4">
            <div className="relative h-full">
              {/* Box plot visualization */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full relative">
                  {/* Whiskers */}
                  <div 
                    className="absolute h-0.5 bg-foreground"
                    style={{ 
                      left: `${(data.min / 100) * 100}%`, 
                      width: `${((data.q1 - data.min) / 100) * 100}%` 
                    }}
                  />
                  <div 
                    className="absolute h-0.5 bg-foreground"
                    style={{ 
                      left: `${(data.q3 / 100) * 100}%`, 
                      width: `${((data.max - data.q3) / 100) * 100}%` 
                    }}
                  />
                  
                  {/* Box */}
                  <div 
                    className="absolute h-8 bg-primary/20 border-2 border-primary rounded"
                    style={{ 
                      left: `${(data.q1 / 100) * 100}%`, 
                      width: `${((data.q3 - data.q1) / 100) * 100}%` 
                    }}
                  />
                  
                  {/* Median line */}
                  <div 
                    className="absolute h-8 w-0.5 bg-primary"
                    style={{ left: `${(data.median / 100) * 100}%` }}
                  />
                  
                  {/* Outliers */}
                  {data.outliers.map((outlier, index) => (
                    <div
                      key={index}
                      className="absolute w-2 h-2 bg-destructive rounded-full"
                      style={{ 
                        left: `${(outlier.value / 100) * 100}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`Outlier: ${outlier.value}% (${outlier.studentName || outlier.studentId})`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            <div>
              <p className="font-medium">{data.min}%</p>
              <p className="text-muted-foreground">Min</p>
            </div>
            <div>
              <p className="font-medium">{data.q1}%</p>
              <p className="text-muted-foreground">Q1</p>
            </div>
            <div>
              <p className="font-medium">{data.median}%</p>
              <p className="text-muted-foreground">Median</p>
            </div>
            <div>
              <p className="font-medium">{data.q3}%</p>
              <p className="text-muted-foreground">Q3</p>
            </div>
            <div>
              <p className="font-medium">{data.max}%</p>
              <p className="text-muted-foreground">Max</p>
            </div>
          </div>

          {data.outliers.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Outliers ({data.outliers.length})</p>
              <div className="flex flex-wrap gap-2">
                {data.outliers.map((outlier, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {outlier.value}% - {outlier.studentName || outlier.studentId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Distribution Analysis Component
function DistributionAnalysis({ 
  histogram, 
  boxPlot, 
  onDrillDown 
}: { 
  histogram: HistogramData
  boxPlot: BoxPlotData
  onDrillDown?: (type: string, data: any) => void 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HistogramChart data={histogram} />
      <BoxPlotChart data={boxPlot} />
      
      {/* Additional distribution metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribution Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Shape Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Skewness:</span>
                  <span className="font-medium">
                    {histogram.statistics.mean > histogram.statistics.median ? 'Right-skewed' : 
                     histogram.statistics.mean < histogram.statistics.median ? 'Left-skewed' : 'Symmetric'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kurtosis:</span>
                  <span className="font-medium">Normal</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Spread Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>IQR:</span>
                  <span className="font-medium">{boxPlot.statistics.quartiles.iqr}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Coefficient of Variation:</span>
                  <span className="font-medium">
                    {((histogram.statistics.standardDeviation / histogram.statistics.mean) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Quality Indicators</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Above 80%:</span>
                  <span className="font-medium">
                    {histogram.bins.filter(b => b.min >= 80).reduce((sum, b) => sum + b.count, 0)} students
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Below 60%:</span>
                  <span className="font-medium">
                    {histogram.bins.filter(b => b.max <= 60).reduce((sum, b) => sum + b.count, 0)} students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Trend Analysis Component
function TrendAnalysis({ 
  trends, 
  onDrillDown 
}: { 
  trends: GradeTrendPoint[]
  onDrillDown?: (type: string, data: any) => void 
}) {
  const trendData = trends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    mean: trend.statistics.mean,
    median: trend.statistics.median,
    assignment: trend.assignmentName
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Trends Over Time</CardTitle>
        <CardDescription>Average performance across assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-medium">{data.assignment}</p>
                      <p className="text-sm text-muted-foreground">Date: {label}</p>
                      <p className="text-sm text-muted-foreground">
                        Mean: <span className="font-medium text-foreground">{data.mean.toFixed(1)}%</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Median: <span className="font-medium text-foreground">{data.median.toFixed(1)}%</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line 
              type="monotone" 
              dataKey="mean" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              name="Mean"
            />
            <Line 
              type="monotone" 
              dataKey="median" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
              name="Median"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Correlation Analysis Component
function CorrelationAnalysis({ 
  correlations, 
  onDrillDown 
}: { 
  correlations: CorrelationAnalysisType
  onDrillDown?: (type: string, data: any) => void 
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Correlations</CardTitle>
          <CardDescription>How assignment performances relate to each other</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlations.assignments.slice(0, 5).map((assignment: any, index: number) => (
              <div key={assignment.assignmentId} className="space-y-2">
                <h4 className="font-medium">{assignment.assignmentName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {assignment.correlations.slice(0, 3).map((correlation: any, corrIndex: number) => (
                    <div key={corrIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm truncate">{correlation.withAssignmentName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            correlation.significance === 'strong' ? 'default' :
                            correlation.significance === 'moderate' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {correlation.correlationCoefficient.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {correlation.significance}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Prediction Analysis Component
function PredictionAnalysis({ 
  predictions, 
  onDrillDown 
}: { 
  predictions: GradePredictionModel
  onDrillDown?: (type: string, data: any) => void 
}) {
  const riskDistribution = {
    low: predictions.predictions.filter(p => p.riskLevel === 'low').length,
    medium: predictions.predictions.filter(p => p.riskLevel === 'medium').length,
    high: predictions.predictions.filter(p => p.riskLevel === 'high').length
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Accuracy</span>
                  <span>{predictions.accuracy}%</span>
                </div>
                <Progress value={predictions.accuracy} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>R² Score</span>
                  <span>{(predictions.r2Score * 100).toFixed(1)}%</span>
                </div>
                <Progress value={predictions.r2Score * 100} />
              </div>
              <div className="text-sm text-muted-foreground">
                RMSE: {predictions.rmse.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Risk</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {riskDistribution.low}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Risk</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {riskDistribution.medium}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Risk</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {riskDistribution.high}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate">{feature.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${feature.importance * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {(feature.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Students */}
      {riskDistribution.high > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Risk Students</CardTitle>
            <CardDescription>Students predicted to need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.predictions
                .filter(p => p.riskLevel === 'high')
                .slice(0, 10)
                .map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Student {prediction.studentId}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {prediction.currentGrade.toFixed(1)}% → 
                        Predicted: {prediction.predictedFinalGrade.toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {prediction.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}