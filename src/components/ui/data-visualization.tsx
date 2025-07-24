// Data Visualization Components
export { 
  TrendChart, 
  GradeTrend, 
  ProgressTrend 
} from "./trend-chart"

export { 
  GradeDistribution, 
  ClassPerformance, 
  StudentGradeSummary 
} from "./grade-distribution"

export { 
  AttendanceHeatmap, 
  StudentAttendance, 
  ClassAttendanceOverview 
} from "./attendance-heatmap"

// Interactive chart wrapper with drill-down capabilities
import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"

interface InteractiveChartProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  onDrillDown?: () => void
}

export const InteractiveChart = React.memo<InteractiveChartProps>(function InteractiveChart({
  children,
  title,
  subtitle,
  actions,
  className,
  onDrillDown
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("bg-card rounded-lg border p-6", className)}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="relative">
        {children}
        
        {onDrillDown && (
          <button
            onClick={onDrillDown}
            className="absolute top-2 right-2 p-2 rounded-md bg-background/80 backdrop-blur-sm border opacity-0 group-hover:opacity-100 transition-opacity"
            title="View details"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
})

// Chart loading state component
interface ChartSkeletonProps {
  variant?: 'line' | 'bar' | 'heatmap'
  height?: number
  className?: string
}

export const ChartSkeleton = React.memo<ChartSkeletonProps>(function ChartSkeleton({ 
  variant = 'line', 
  height = 300, 
  className 
}) {
  return (
    <div className={cn("animate-pulse", className)} style={{ height }}>
      <div className="space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        
        {/* Chart area skeleton */}
        <div className="relative bg-muted/20 rounded" style={{ height: height - 80 }}>
          {variant === 'line' && (
            <svg className="w-full h-full">
              <path
                d="M 50 80 Q 150 60 250 70 T 450 50"
                stroke="hsl(var(--muted))"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
          
          {variant === 'bar' && (
            <div className="flex items-end justify-around h-full p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-t"
                  style={{ 
                    height: `${Math.random() * 60 + 20}%`,
                    width: '12%'
                  }}
                />
              ))}
            </div>
          )}
          
          {variant === 'heatmap' && (
            <div className="grid grid-cols-7 gap-1 p-4 h-full">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-sm"
                  style={{ opacity: Math.random() * 0.8 + 0.2 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})