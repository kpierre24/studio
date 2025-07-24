"use client"

import React, { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  Award, 
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

export interface ActivityItem {
  id: string
  type: 'submission' | 'grade' | 'announcement' | 'enrollment' | 'lesson' | 'achievement'
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
  actionUrl?: string
  user?: {
    name: string
    avatar?: string
  }
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  maxItems?: number
  showUserInfo?: boolean
  className?: string
}

const activityIcons = {
  submission: FileText,
  grade: Award,
  announcement: MessageSquare,
  enrollment: UserPlus,
  lesson: BookOpen,
  achievement: Award,
}

const activityColors = {
  submission: 'text-blue-600 bg-blue-100',
  grade: 'text-green-600 bg-green-100',
  announcement: 'text-purple-600 bg-purple-100',
  enrollment: 'text-orange-600 bg-orange-100',
  lesson: 'text-indigo-600 bg-indigo-100',
  achievement: 'text-yellow-600 bg-yellow-100',
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

const ActivityTimelineItem = memo(function ActivityTimelineItem({ 
  activity, 
  isLast, 
  showUserInfo 
}: { 
  activity: ActivityItem
  isLast: boolean
  showUserInfo?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = activityIcons[activity.type]
  const colorClasses = activityColors[activity.type]
  
  const hasExpandableContent = activity.metadata && Object.keys(activity.metadata).length > 0

  return (
    <motion.div
      variants={staggerItem}
      className="relative flex gap-4"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
      )}
      
      {/* Activity icon */}
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
        colorClasses
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          whileHover={{ 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: { duration: 0.2 }
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {activity.title}
              </h3>
              {showUserInfo && activity.user && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {activity.user.name}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(activity.timestamp)}
              </div>
              
              {activity.actionUrl && (
                <motion.a
                  href={activity.actionUrl}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {activity.description}
          </p>
          
          {/* Expandable metadata */}
          {hasExpandableContent && (
            <>
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                {isExpanded ? 'Hide details' : 'Show details'}
              </motion.button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
                  >
                    <div className="space-y-2">
                      {Object.entries(activity.metadata || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
});

const ActivityTimelineComponent = function ActivityTimeline({ 
  activities, 
  maxItems = 10, 
  showUserInfo = false,
  className 
}: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )
  
  const displayedActivities = showAll 
    ? sortedActivities 
    : sortedActivities.slice(0, maxItems)
  
  const hasMore = sortedActivities.length > maxItems

  if (activities.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className={cn("text-center py-8", className)}
      >
        <div className="text-gray-400 dark:text-gray-600 mb-2">
          <Clock className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </motion.div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {displayedActivities.map((activity, index) => (
          <ActivityTimelineItem
            key={activity.id}
            activity={activity}
            isLast={index === displayedActivities.length - 1}
            showUserInfo={showUserInfo}
          />
        ))}
      </motion.div>
      
      {hasMore && !showAll && (
        <motion.div
          variants={fadeInUp}
          className="text-center"
        >
          <motion.button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Show {sortedActivities.length - maxItems} more activities
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

// Memoized component with custom comparison function
export const ActivityTimeline = memo(ActivityTimelineComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.activities.length === nextProps.activities.length &&
    prevProps.maxItems === nextProps.maxItems &&
    prevProps.showUserInfo === nextProps.showUserInfo &&
    prevProps.className === nextProps.className &&
    prevProps.activities.every((activity, index) => 
      activity.id === nextProps.activities[index]?.id &&
      activity.timestamp.getTime() === nextProps.activities[index]?.timestamp.getTime()
    )
  );
});