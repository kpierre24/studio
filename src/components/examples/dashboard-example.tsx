"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Award, 
  Clock, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { 
  ActivityTimeline,
  CourseProgressGrid,
  StatsGrid,
  ProgressRing,
  MultiProgressRing
} from '@/components/enhanced'
import { useActivityData } from '@/hooks/useActivityData'
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { RecentItems } from '@/components/ui/recent-items'

// Example usage of the progress visualization components
export function DashboardExample() {
  // Mock user ID for demo
  const userId = 'student-123'
  
  // Use the hooks to get data
  const { activities, isLoading: activitiesLoading } = useActivityData({ 
    userId, 
    limit: 10 
  })
  
  const { courses, isLoading: progressLoading } = useProgressTracking({ 
    userId 
  })

  // Mock stats data
  const statsData = [
    {
      id: 'total-courses',
      title: 'Total Courses',
      value: courses.length,
      subtitle: 'Currently enrolled',
      icon: BookOpen,
      color: 'blue' as const,
      trend: {
        value: 2,
        direction: 'up' as const,
        period: 'this month',
        percentage: 15
      },
      onClick: () => console.log('Navigate to courses'),
      metadata: {
        activeCount: courses.filter(c => c.completedLessons < c.totalLessons).length,
        completedCount: courses.filter(c => c.completedLessons === c.totalLessons).length
      }
    },
    {
      id: 'avg-grade',
      title: 'Average Grade',
      value: `${Math.round(courses.reduce((sum, c) => sum + (c.averageGrade || 0), 0) / courses.length || 0)}%`,
      subtitle: 'Across all courses',
      icon: Award,
      color: 'green' as const,
      trend: {
        value: 3.2,
        direction: 'up' as const,
        period: 'this week',
        percentage: 5
      },
      metadata: {
        highestGrade: Math.max(...courses.map(c => c.averageGrade || 0)),
        lowestGrade: Math.min(...courses.map(c => c.averageGrade || 0))
      }
    },
    {
      id: 'time-spent',
      title: 'Study Time',
      value: `${Math.round(courses.reduce((sum, c) => sum + c.timeSpent, 0) / 60)}h`,
      subtitle: 'This week',
      icon: Clock,
      color: 'purple' as const,
      trend: {
        value: 8,
        direction: 'up' as const,
        period: 'vs last week',
        percentage: 12
      },
      metadata: {
        dailyAverage: Math.round(courses.reduce((sum, c) => sum + c.timeSpent, 0) / 7),
        totalMinutes: courses.reduce((sum, c) => sum + c.timeSpent, 0)
      }
    },
    {
      id: 'assignments-due',
      title: 'Due Soon',
      value: courses.filter(c => c.nextDeadline).length,
      subtitle: 'Assignments & exams',
      icon: Calendar,
      color: 'orange' as const,
      trend: {
        value: 1,
        direction: 'down' as const,
        period: 'from yesterday',
        percentage: 20
      },
      metadata: {
        overdue: courses.filter(c => c.nextDeadline && c.nextDeadline.date < new Date()).length,
        thisWeek: courses.filter(c => {
          if (!c.nextDeadline) return false
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          return c.nextDeadline.date <= weekFromNow
        }).length
      }
    }
  ]

  // Multi-progress ring data
  const multiProgressData = [
    {
      label: 'Lessons',
      progress: Math.round(
        (courses.reduce((sum, c) => sum + c.completedLessons, 0) / 
         courses.reduce((sum, c) => sum + c.totalLessons, 0)) * 100
      ) || 0,
      color: 'blue' as const
    },
    {
      label: 'Assignments',
      progress: Math.round(
        (courses.reduce((sum, c) => sum + c.completedAssignments, 0) / 
         courses.reduce((sum, c) => sum + c.totalAssignments, 0)) * 100
      ) || 0,
      color: 'green' as const
    },
    {
      label: 'Overall',
      progress: Math.round(
        courses.reduce((sum, c) => {
          const courseProgress = ((c.completedLessons / c.totalLessons) * 0.6 + 
                                 (c.completedAssignments / c.totalAssignments) * 0.4) * 100
          return sum + courseProgress
        }, 0) / courses.length
      ) || 0,
      color: 'purple' as const
    }
  ]

  if (progressLoading || activitiesLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 p-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your learning progress overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Stats
        </h2>
        <StatsGrid
          cards={statsData}
          columns={4}
          size="md"
          showTrend={true}
          showDrillDown={true}
        />
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Course Progress
          </h2>
          <CourseProgressGrid
            courses={courses}
            variant="default"
            showMilestones={true}
            onCourseClick={(courseId) => console.log('Navigate to course:', courseId)}
          />
        </div>

        <div className="space-y-6">
          {/* Overall Progress Ring */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Overall Progress
            </h3>
            <div className="flex justify-center">
              <MultiProgressRing
                data={multiProgressData}
                size="lg"
              />
            </div>
          </div>

          {/* Individual Progress Rings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Course Breakdown
            </h3>
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => {
                const progress = Math.round(
                  ((course.completedLessons / course.totalLessons) * 0.6 + 
                   (course.completedAssignments / course.totalAssignments) * 0.4) * 100
                )
                return (
                  <div key={course.courseId} className="flex items-center gap-4">
                    <ProgressRing
                      progress={progress}
                      size="sm"
                      color={progress >= 80 ? 'green' : progress >= 60 ? 'blue' : 'orange'}
                      showLabel={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {course.courseName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Items */}
          <RecentItems
            maxItems={5}
            showHeader={true}
            showClearAll={true}
            showRemoveButtons={true}
            variant="compact"
          />
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <ActivityTimeline
            activities={activities}
            maxItems={8}
            showUserInfo={false}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}