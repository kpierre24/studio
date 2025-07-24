"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Award, 
  Calendar,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgressRing } from './progress-ring'
import { fadeInUp, hoverLift } from '@/lib/animations'

export interface CourseProgressData {
  courseId: string
  courseName: string
  instructor?: string
  totalLessons: number
  completedLessons: number
  totalAssignments: number
  completedAssignments: number
  averageGrade?: number
  timeSpent: number // in minutes
  lastAccessed: Date
  nextDeadline?: {
    title: string
    date: Date
    type: 'assignment' | 'quiz' | 'exam'
  }
  milestones: Array<{
    id: string
    title: string
    type: 'lesson' | 'assignment' | 'quiz'
    isCompleted: boolean
    completedAt?: Date
    score?: number
    isOverdue?: boolean
  }>
}

interface CourseProgressCardProps {
  data: CourseProgressData
  variant?: 'default' | 'compact' | 'detailed'
  showMilestones?: boolean
  onClick?: () => void
  className?: string
}

function formatTimeSpent(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}

function formatDeadline(date: Date): string {
  const now = new Date()
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) return 'Overdue'
  if (diffInDays === 0) return 'Due today'
  if (diffInDays === 1) return 'Due tomorrow'
  if (diffInDays < 7) return `Due in ${diffInDays} days`
  return `Due ${date.toLocaleDateString()}`
}

function MilestoneItem({ milestone }: { milestone: CourseProgressData['milestones'][0] }) {
  const Icon = milestone.isCompleted ? CheckCircle : 
               milestone.isOverdue ? AlertCircle : Circle
  
  const iconColor = milestone.isCompleted ? 'text-green-500' :
                   milestone.isOverdue ? 'text-red-500' : 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm truncate",
          milestone.isCompleted ? "text-gray-600 dark:text-gray-400 line-through" : "text-gray-900 dark:text-gray-100"
        )}>
          {milestone.title}
        </p>
        {milestone.score && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Score: {milestone.score}%
          </p>
        )}
      </div>
      {milestone.completedAt && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimeAgo(milestone.completedAt)}
        </span>
      )}
    </motion.div>
  )
}

export function CourseProgressCard({
  data,
  variant = 'default',
  showMilestones = true,
  onClick,
  className
}: CourseProgressCardProps) {
  const overallProgress = Math.round(
    ((data.completedLessons / data.totalLessons) * 0.6 + 
     (data.completedAssignments / data.totalAssignments) * 0.4) * 100
  )
  
  const lessonProgress = Math.round((data.completedLessons / data.totalLessons) * 100)
  const assignmentProgress = Math.round((data.completedAssignments / data.totalAssignments) * 100)
  
  const isClickable = !!onClick
  const isOverdue = data.nextDeadline && data.nextDeadline.date < new Date()

  if (variant === 'compact') {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
          isClickable && "cursor-pointer",
          className
        )}
        onClick={onClick}
        {...(isClickable ? hoverLift : {})}
      >
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={overallProgress}
            size="sm"
            color={overallProgress >= 80 ? 'green' : overallProgress >= 60 ? 'blue' : 'orange'}
            showLabel={false}
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {data.courseName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.completedLessons}/{data.totalLessons} lessons • {formatTimeSpent(data.timeSpent)}
            </p>
          </div>
          
          {isClickable && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...(isClickable ? hoverLift : {})}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {data.courseName}
            </h3>
            {data.instructor && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                with {data.instructor}
              </p>
            )}
          </div>
          
          <ProgressRing
            progress={overallProgress}
            size="md"
            color={overallProgress >= 80 ? 'green' : overallProgress >= 60 ? 'blue' : 'orange'}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Lessons</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.completedLessons}/{data.totalLessons}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lessonProgress}% complete
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Assignments</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.completedAssignments}/{data.totalAssignments}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {assignmentProgress}% complete
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatTimeSpent(data.timeSpent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last: {formatTimeAgo(data.lastAccessed)}
            </div>
          </div>

          {data.averageGrade && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Grade</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {Math.round(data.averageGrade)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Average
              </div>
            </div>
          )}
        </div>

        {/* Next Deadline */}
        {data.nextDeadline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              isOverdue 
                ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
            )}
          >
            <Calendar className={cn(
              "w-4 h-4",
              isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
            )} />
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                isOverdue ? "text-red-900 dark:text-red-100" : "text-blue-900 dark:text-blue-100"
              )}>
                {data.nextDeadline.title}
              </p>
              <p className={cn(
                "text-xs",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
              )}>
                {formatDeadline(data.nextDeadline.date)}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Milestones */}
      {showMilestones && data.milestones.length > 0 && variant === 'detailed' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Recent Activity
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {data.milestones.slice(0, 5).map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </div>
          {data.milestones.length > 5 && (
            <motion.button
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View all {data.milestones.length} activities
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Grid container for multiple course progress cards
interface CourseProgressGridProps {
  courses: CourseProgressData[]
  variant?: CourseProgressCardProps['variant']
  showMilestones?: boolean
  onCourseClick?: (courseId: string) => void
  className?: string
}

export function CourseProgressGrid({
  courses,
  variant = 'default',
  showMilestones = true,
  onCourseClick,
  className
}: CourseProgressGridProps) {
  const gridCols = variant === 'compact' 
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 lg:grid-cols-2'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("grid gap-6", gridCols, className)}
    >
      {courses.map((course, index) => (
        <motion.div
          key={course.courseId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CourseProgressCard
            data={course}
            variant={variant}
            showMilestones={showMilestones}
            onClick={onCourseClick ? () => onCourseClick(course.courseId) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}