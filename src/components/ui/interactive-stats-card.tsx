"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronRight,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hoverLift, fadeInUp } from '@/lib/animations'

export interface TrendData {
  value: number
  direction: 'up' | 'down' | 'neutral'
  period: string
  percentage?: number
}

export interface StatCardData {
  id: string
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: TrendData
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  onClick?: () => void
  drillDownUrl?: string
  metadata?: Record<string, any>
  isLoading?: boolean
}

interface InteractiveStatsCardProps {
  data: StatCardData
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  showDrillDown?: boolean
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    text: 'text-blue-900 dark:text-blue-100',
    accent: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    text: 'text-green-900 dark:text-green-100',
    accent: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    text: 'text-purple-900 dark:text-purple-100',
    accent: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
    text: 'text-orange-900 dark:text-orange-100',
    accent: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    text: 'text-red-900 dark:text-red-100',
    accent: 'text-red-600 dark:text-red-400'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
    text: 'text-gray-900 dark:text-gray-100',
    accent: 'text-gray-600 dark:text-gray-400'
  }
}

const sizeVariants = {
  sm: {
    container: 'p-4',
    icon: 'w-8 h-8',
    iconContainer: 'w-10 h-10',
    title: 'text-sm',
    value: 'text-lg',
    subtitle: 'text-xs'
  },
  md: {
    container: 'p-6',
    icon: 'w-6 h-6',
    iconContainer: 'w-12 h-12',
    title: 'text-sm',
    value: 'text-2xl',
    subtitle: 'text-sm'
  },
  lg: {
    container: 'p-8',
    icon: 'w-8 h-8',
    iconContainer: 'w-16 h-16',
    title: 'text-base',
    value: 'text-3xl',
    subtitle: 'text-base'
  }
}

function TrendIndicator({ trend }: { trend: TrendData }) {
  const TrendIcon = trend.direction === 'up' ? TrendingUp : 
                   trend.direction === 'down' ? TrendingDown : Minus
  
  const trendColor = trend.direction === 'up' ? 'text-green-600 dark:text-green-400' :
                    trend.direction === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}
    >
      <TrendIcon className="w-3 h-3" />
      {trend.percentage && (
        <span>{Math.abs(trend.percentage)}%</span>
      )}
      <span className="text-gray-500 dark:text-gray-400">
        {trend.period}
      </span>
    </motion.div>
  )
}

function LoadingSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = sizeVariants[size]
  
  return (
    <div className={cn("animate-pulse", sizeClasses.container)}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className={cn("bg-gray-200 dark:bg-gray-700 rounded-full", sizeClasses.iconContainer)}></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  )
}

export function InteractiveStatsCard({
  data,
  size = 'md',
  showTrend = true,
  showDrillDown = true,
  className
}: InteractiveStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  const colors = colorVariants[data.color || 'gray']
  const sizes = sizeVariants[size]
  const Icon = data.icon
  
  const isClickable = data.onClick || data.drillDownUrl
  
  if (data.isLoading) {
    return (
      <div className={cn(
        "rounded-lg border bg-white dark:bg-gray-800",
        colors.border,
        className
      )}>
        <LoadingSkeleton size={size} />
      </div>
    )
  }

  const handleClick = () => {
    if (data.onClick) {
      data.onClick()
    } else if (data.drillDownUrl) {
      window.location.href = data.drillDownUrl
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "rounded-lg border transition-all duration-200 relative overflow-hidden",
        colors.bg,
        colors.border,
        isClickable && "cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? handleClick : undefined}
      {...(isClickable ? hoverLift : {})}
    >
      <div className={sizes.container}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium truncate",
              colors.text,
              sizes.title
            )}>
              {data.title}
            </h3>
            
            <motion.div
              className={cn("font-bold mt-1", colors.text, sizes.value)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
            </motion.div>
            
            {data.subtitle && (
              <p className={cn(
                "text-gray-600 dark:text-gray-400 mt-1",
                sizes.subtitle
              )}>
                {data.subtitle}
              </p>
            )}
          </div>
          
          {/* Icon */}
          <motion.div
            className={cn(
              "rounded-full flex items-center justify-center flex-shrink-0",
              colors.icon,
              sizes.iconContainer
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className={sizes.icon} />
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Trend indicator */}
          {showTrend && data.trend && (
            <TrendIndicator trend={data.trend} />
          )}
          
          {!showTrend && <div />}
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {data.metadata && Object.keys(data.metadata).length > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(!showDetails)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            )}
            
            {showDrillDown && isClickable && (
              <motion.div
                className={cn("transition-opacity", colors.accent)}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.6 }}
              >
                {data.drillDownUrl ? (
                  <ExternalLink className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && data.metadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="p-4 space-y-2">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && isClickable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Grid container for multiple stats cards
interface StatsGridProps {
  cards: StatCardData[]
  columns?: 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  showDrillDown?: boolean
  className?: string
}

export function StatsGrid({
  cards,
  columns = 3,
  size = 'md',
  showTrend = true,
  showDrillDown = true,
  className
}: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "grid gap-6",
        gridCols[columns],
        className
      )}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <InteractiveStatsCard
            data={card}
            size={size}
            showTrend={showTrend}
            showDrillDown={showDrillDown}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}