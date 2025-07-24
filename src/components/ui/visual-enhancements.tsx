// Visual Enhancement Components - Main exports
export {
  EmptyState,
  RoleSpecificEmptyState,
  SearchEmptyState,
  ErrorEmptyState
} from "./empty-state"

export {
  Skeleton,
  SkeletonLoader,
  ProgressiveSkeleton
} from "./skeleton"

export {
  TrendChart,
  GradeTrend,
  ProgressTrend,
  GradeDistribution,
  ClassPerformance,
  StudentGradeSummary,
  AttendanceHeatmap,
  StudentAttendance,
  ClassAttendanceOverview,
  InteractiveChart,
  ChartSkeleton
} from "./data-visualization"

export {
  AnimatedButton,
  AnimatedCard,
  LoadingDots,
  CheckmarkIcon,
  PageTransition,
  AnimatedInput,
  Notification,
  AnimatedIcon,
  Tooltip,
  FormSuccess,
  AchievementBadge
} from "./micro-animations"

export {
  PageTransitionProvider,
  LoadingTransition,
  StaggeredList,
  Reveal,
  HoverReveal,
  ProgressAnimation,
  CountUp
} from "./page-transitions"

// Utility component for combining multiple visual enhancements
import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerContainer } from "@/lib/animations"

interface VisualContainerProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  stagger?: boolean
}

export function VisualContainer({
  children,
  className,
  animate = true,
  stagger = false
}: VisualContainerProps) {
  if (!animate) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : undefined}
      initial={stagger ? "initial" : { opacity: 0, y: 20 }}
      animate={stagger ? "animate" : { opacity: 1, y: 0 }}
      exit={stagger ? "exit" : { opacity: 0, y: -20 }}
      transition={!stagger ? { duration: 0.3 } : undefined}
    >
      {children}
    </motion.div>
  )
}

// Enhanced loading state component that combines skeleton and animations
interface EnhancedLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  skeletonVariant?: 'card' | 'list' | 'table' | 'dashboard' | 'course' | 'assignment'
  skeletonCount?: number
  className?: string
}

export function EnhancedLoading({
  isLoading,
  children,
  skeletonVariant = 'card',
  skeletonCount = 3,
  className
}: EnhancedLoadingProps) {
  return (
    <div className={className}>
      {isLoading ? (
        <SkeletonLoader
          variant={skeletonVariant}
          count={skeletonCount}
          animate={true}
        />
      ) : (
        <VisualContainer animate={true} stagger={true}>
          {children}
        </VisualContainer>
      )}
    </div>
  )
}

// Status indicator with animations
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  animate = true,
  className
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: 'bg-green-500',
          icon: '✓',
          textColor: 'text-green-700'
        }
      case 'warning':
        return {
          color: 'bg-yellow-500',
          icon: '⚠',
          textColor: 'text-yellow-700'
        }
      case 'error':
        return {
          color: 'bg-red-500',
          icon: '✕',
          textColor: 'text-red-700'
        }
      case 'info':
        return {
          color: 'bg-blue-500',
          icon: 'ℹ',
          textColor: 'text-blue-700'
        }
      case 'loading':
        return {
          color: 'bg-gray-500',
          icon: '⟳',
          textColor: 'text-gray-700'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          dot: 'w-2 h-2',
          text: 'text-xs',
          container: 'gap-1'
        }
      case 'lg':
        return {
          dot: 'w-4 h-4',
          text: 'text-base',
          container: 'gap-3'
        }
      default:
        return {
          dot: 'w-3 h-3',
          text: 'text-sm',
          container: 'gap-2'
        }
    }
  }

  const config = getStatusConfig()
  const sizeClasses = getSizeClasses()

  const Component = animate ? motion.div : 'div'

  return (
    <Component
      className={cn(
        "flex items-center",
        sizeClasses.container,
        className
      )}
      {...(animate && {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2 }
      })}
    >
      <motion.div
        className={cn(
          "rounded-full",
          config.color,
          sizeClasses.dot
        )}
        {...(animate && status === 'loading' && {
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Infinity, ease: "linear" }
        })}
      />
      {label && (
        <span className={cn(
          "font-medium",
          config.textColor,
          sizeClasses.text
        )}>
          {label}
        </span>
      )}
    </Component>
  )
}

// Interactive feedback component
interface InteractiveFeedbackProps {
  children: React.ReactNode
  feedbackType?: 'hover' | 'click' | 'focus'
  className?: string
}

export function InteractiveFeedback({
  children,
  feedbackType = 'hover',
  className
}: InteractiveFeedbackProps) {
  const getAnimationProps = () => {
    switch (feedbackType) {
      case 'click':
        return {
          whileTap: { scale: 0.95 },
          transition: { duration: 0.1 }
        }
      case 'focus':
        return {
          whileFocus: { 
            scale: 1.02,
            boxShadow: "0 0 0 2px hsl(var(--primary) / 0.2)"
          }
        }
      default:
        return {
          whileHover: { scale: 1.02 },
          transition: { duration: 0.2 }
        }
    }
  }

  return (
    <motion.div
      className={className}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  )
}