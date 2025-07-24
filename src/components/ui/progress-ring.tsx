"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  showLabel?: boolean
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  backgroundColor?: string
  className?: string
  children?: React.ReactNode
  animated?: boolean
  duration?: number
}

const sizeConfig = {
  sm: { size: 60, fontSize: 'text-xs', strokeWidth: 4 },
  md: { size: 80, fontSize: 'text-sm', strokeWidth: 6 },
  lg: { size: 120, fontSize: 'text-base', strokeWidth: 8 },
  xl: { size: 160, fontSize: 'text-lg', strokeWidth: 10 }
}

const colorConfig = {
  blue: {
    stroke: '#3B82F6',
    background: '#E5E7EB',
    text: 'text-blue-600'
  },
  green: {
    stroke: '#10B981',
    background: '#E5E7EB',
    text: 'text-green-600'
  },
  purple: {
    stroke: '#8B5CF6',
    background: '#E5E7EB',
    text: 'text-purple-600'
  },
  orange: {
    stroke: '#F59E0B',
    background: '#E5E7EB',
    text: 'text-orange-600'
  },
  red: {
    stroke: '#EF4444',
    background: '#E5E7EB',
    text: 'text-red-600'
  },
  gray: {
    stroke: '#6B7280',
    background: '#E5E7EB',
    text: 'text-gray-600'
  }
}

export function ProgressRing({
  progress,
  size = 'md',
  strokeWidth,
  showLabel = true,
  showPercentage = true,
  color = 'blue',
  backgroundColor,
  className,
  children,
  animated = true,
  duration = 1
}: ProgressRingProps) {
  const config = sizeConfig[size]
  const colors = colorConfig[color]
  const actualStrokeWidth = strokeWidth || config.strokeWidth
  
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)
  const radius = (config.size - actualStrokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={backgroundColor || colors.background}
          strokeWidth={actualStrokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={actualStrokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset 
          }}
          transition={{ 
            duration: animated ? duration : 0,
            ease: "easeInOut",
            delay: animated ? 0.2 : 0
          }}
          className="drop-shadow-sm"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : (
          <div className="text-center">
            {showPercentage && (
              <motion.div
                className={cn("font-bold", config.fontSize, colors.text)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animated ? duration * 0.5 : 0 }}
              >
                {Math.round(normalizedProgress)}%
              </motion.div>
            )}
            {showLabel && (
              <div className={cn("text-gray-500 dark:text-gray-400", 
                size === 'sm' ? 'text-xs' : 
                size === 'md' ? 'text-xs' : 
                'text-sm'
              )}>
                Complete
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Multi-progress ring for showing multiple metrics
export interface MultiProgressRingProps {
  data: Array<{
    label: string
    progress: number
    color: ProgressRingProps['color']
  }>
  size?: ProgressRingProps['size']
  className?: string
}

export function MultiProgressRing({ data, size = 'lg', className }: MultiProgressRingProps) {
  const config = sizeConfig[size]
  const strokeWidth = Math.max(2, config.strokeWidth / data.length)
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={config.size} height={config.size} className="transform -rotate-90">
        {data.map((item, index) => {
          const radius = (config.size - strokeWidth * 2) / 2 - (index * strokeWidth * 1.5)
          const circumference = radius * 2 * Math.PI
          const strokeDasharray = circumference
          const strokeDashoffset = circumference - (item.progress / 100) * circumference
          const colors = colorConfig[item.color]
          
          return (
            <g key={index}>
              {/* Background circle */}
              <circle
                cx={config.size / 2}
                cy={config.size / 2}
                r={radius}
                stroke={colors.background}
                strokeWidth={strokeWidth}
                fill="transparent"
                className="opacity-20"
              />
              
              {/* Progress circle */}
              <motion.circle
                cx={config.size / 2}
                cy={config.size / 2}
                r={radius}
                stroke={colors.stroke}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ 
                  duration: 1,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
              />
            </g>
          )
        })}
      </svg>
      
      {/* Center legend */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colorConfig[item.color].stroke }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className={cn("font-medium", colorConfig[item.color].text)}>
                {Math.round(item.progress)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}