import React, { memo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"

interface TrendDataPoint {
  date: string
  value: number
  label?: string
  metadata?: Record<string, any>
}

interface TrendChartProps {
  data: TrendDataPoint[]
  height?: number
  color?: string
  showGrid?: boolean
  showArea?: boolean
  title?: string
  subtitle?: string
  className?: string
  animate?: boolean
  onPointClick?: (data: TrendDataPoint) => void
}

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Value: <span className="font-medium text-foreground">{payload[0].value}</span>
        </p>
        {data.label && (
          <p className="text-sm text-muted-foreground">{data.label}</p>
        )}
      </div>
    )
  }
  return null
});

const TrendChartComponent = function TrendChart({
  data,
  height = 300,
  color = "hsl(var(--primary))",
  showGrid = true,
  showArea = false,
  title,
  subtitle,
  className,
  animate = true,
  onPointClick
}: TrendChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart

  const chartContent = (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} onClick={onPointClick as any}>
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
          )}
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
          />
          <Tooltip content={<CustomTooltip />} />
          
          {showArea ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        variants={fadeInUp}
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

// Memoized component with custom comparison function
export const TrendChart = memo(TrendChartComponent, (prevProps, nextProps) => {
  return (
    prevProps.data.length === nextProps.data.length &&
    prevProps.height === nextProps.height &&
    prevProps.color === nextProps.color &&
    prevProps.showGrid === nextProps.showGrid &&
    prevProps.showArea === nextProps.showArea &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.className === nextProps.className &&
    prevProps.animate === nextProps.animate &&
    prevProps.data.every((item, index) => 
      item.date === nextProps.data[index]?.date &&
      item.value === nextProps.data[index]?.value
    )
  );
});

// Grade trend specific component
interface GradeTrendProps {
  grades: Array<{
    assignment: string
    grade: number
    date: string
    maxGrade?: number
  }>
  className?: string
}

export const GradeTrend = memo(function GradeTrend({ grades, className }: GradeTrendProps) {
  const data = grades.map(grade => ({
    date: new Date(grade.date).toLocaleDateString(),
    value: grade.maxGrade ? (grade.grade / grade.maxGrade) * 100 : grade.grade,
    label: `${grade.assignment}: ${grade.grade}${grade.maxGrade ? `/${grade.maxGrade}` : ''}`,
    metadata: grade
  }))

  return (
    <TrendChart
      data={data}
      title="Grade Trend"
      subtitle="Your performance over time"
      color="hsl(var(--primary))"
      showArea={true}
      className={className}
    />
  )
});

// Progress trend component
interface ProgressTrendProps {
  progress: Array<{
    date: string
    percentage: number
    course: string
  }>
  className?: string
}

export const ProgressTrend = memo(function ProgressTrend({ progress, className }: ProgressTrendProps) {
  const data = progress.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    value: item.percentage,
    label: `${item.course}: ${item.percentage}% complete`,
    metadata: item
  }))

  return (
    <TrendChart
      data={data}
      title="Progress Trend"
      subtitle="Course completion over time"
      color="hsl(var(--success))"
      showArea={true}
      className={className}
    />
  )
});