import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

interface GradeDistributionData {
  grade: string
  count: number
  percentage: number
  color?: string
}

interface GradeDistributionProps {
  data: GradeDistributionData[]
  title?: string
  subtitle?: string
  height?: number
  showPercentage?: boolean
  className?: string
  animate?: boolean
  onBarClick?: (data: GradeDistributionData) => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">Grade: {label}</p>
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

const defaultColors = [
  "hsl(var(--destructive))", // F
  "hsl(var(--warning))", // D
  "hsl(var(--warning))", // C
  "hsl(var(--primary))", // B
  "hsl(var(--success))", // A
]

export function GradeDistribution({
  data,
  title = "Grade Distribution",
  subtitle,
  height = 300,
  showPercentage = true,
  className,
  animate = true,
  onBarClick
}: GradeDistributionProps) {
  const chartContent = (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} onClick={onBarClick as any}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis 
            dataKey="grade" 
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
          <Bar 
            dataKey={showPercentage ? "percentage" : "count"}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index] || "hsl(var(--primary))"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((item, index) => (
          <motion.div
            key={item.grade}
            variants={animate ? staggerItem : undefined}
            className="text-center p-3 rounded-lg border"
          >
            <div 
              className="w-4 h-4 rounded mx-auto mb-2"
              style={{ backgroundColor: item.color || defaultColors[index] || "hsl(var(--primary))" }}
            />
            <p className="font-semibold text-lg">{item.grade}</p>
            <p className="text-sm text-muted-foreground">{item.count} students</p>
            <p className="text-xs text-muted-foreground">{item.percentage}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {chartContent}
      </motion.div>
    )
  }

  return chartContent
}

// Class performance component
interface ClassPerformanceProps {
  assignments: Array<{
    name: string
    grades: number[]
    maxGrade: number
  }>
  className?: string
}

export function ClassPerformance({ assignments, className }: ClassPerformanceProps) {
  // Calculate grade distribution for the latest assignment
  const latestAssignment = assignments[assignments.length - 1]
  
  if (!latestAssignment) {
    return (
      <div className={cn("text-center p-8 text-muted-foreground", className)}>
        No assignment data available
      </div>
    )
  }

  const gradeRanges = [
    { min: 90, max: 100, grade: "A", color: "hsl(var(--success))" },
    { min: 80, max: 89, grade: "B", color: "hsl(var(--primary))" },
    { min: 70, max: 79, grade: "C", color: "hsl(var(--warning))" },
    { min: 60, max: 69, grade: "D", color: "hsl(var(--warning))" },
    { min: 0, max: 59, grade: "F", color: "hsl(var(--destructive))" },
  ]

  const data = gradeRanges.map(range => {
    const count = latestAssignment.grades.filter(grade => {
      const percentage = (grade / latestAssignment.maxGrade) * 100
      return percentage >= range.min && percentage <= range.max
    }).length

    return {
      grade: range.grade,
      count,
      percentage: Math.round((count / latestAssignment.grades.length) * 100),
      color: range.color
    }
  }).filter(item => item.count > 0)

  return (
    <GradeDistribution
      data={data}
      title={`Grade Distribution - ${latestAssignment.name}`}
      subtitle={`Based on ${latestAssignment.grades.length} submissions`}
      className={className}
    />
  )
}

// Student grade summary component
interface StudentGradeSummaryProps {
  studentGrades: Array<{
    assignment: string
    grade: number
    maxGrade: number
    date: string
  }>
  className?: string
}

export function StudentGradeSummary({ studentGrades, className }: StudentGradeSummaryProps) {
  const gradeRanges = [
    { min: 90, max: 100, grade: "A", color: "hsl(var(--success))" },
    { min: 80, max: 89, grade: "B", color: "hsl(var(--primary))" },
    { min: 70, max: 79, grade: "C", color: "hsl(var(--warning))" },
    { min: 60, max: 69, grade: "D", color: "hsl(var(--warning))" },
    { min: 0, max: 59, grade: "F", color: "hsl(var(--destructive))" },
  ]

  const data = gradeRanges.map(range => {
    const count = studentGrades.filter(grade => {
      const percentage = (grade.grade / grade.maxGrade) * 100
      return percentage >= range.min && percentage <= range.max
    }).length

    return {
      grade: range.grade,
      count,
      percentage: Math.round((count / studentGrades.length) * 100),
      color: range.color
    }
  }).filter(item => item.count > 0)

  const averageGrade = studentGrades.reduce((sum, grade) => 
    sum + (grade.grade / grade.maxGrade) * 100, 0
  ) / studentGrades.length

  return (
    <div className={className}>
      <GradeDistribution
        data={data}
        title="Your Grade Distribution"
        subtitle={`Average: ${averageGrade.toFixed(1)}% across ${studentGrades.length} assignments`}
      />
    </div>
  )
}