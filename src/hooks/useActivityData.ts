"use client"

import { useState, useEffect, useCallback } from 'react'
import { ActivityItem } from '@/components/ui/activity-timeline'

interface UseActivityDataOptions {
  userId?: string
  courseId?: string
  limit?: number
  refreshInterval?: number
}

interface ActivityDataState {
  activities: ActivityItem[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Mock data generator for development
function generateMockActivities(count: number = 10): ActivityItem[] {
  const types: ActivityItem['type'][] = ['submission', 'grade', 'announcement', 'enrollment', 'lesson', 'achievement']
  const activities: ActivityItem[] = []
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
    
    activities.push({
      id: `activity-${i}`,
      type,
      title: getActivityTitle(type),
      description: getActivityDescription(type),
      timestamp,
      metadata: getActivityMetadata(type),
      actionUrl: `/activity/${i}`,
      user: {
        name: `User ${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
      }
    })
  }
  
  return activities
}

function getActivityTitle(type: ActivityItem['type']): string {
  const titles = {
    submission: 'Assignment Submitted',
    grade: 'Grade Received',
    announcement: 'New Announcement',
    enrollment: 'Course Enrollment',
    lesson: 'Lesson Completed',
    achievement: 'Achievement Unlocked'
  }
  return titles[type]
}

function getActivityDescription(type: ActivityItem['type']): string {
  const descriptions = {
    submission: 'Successfully submitted assignment for review',
    grade: 'Received grade for recent assignment',
    announcement: 'New announcement posted in course',
    enrollment: 'Successfully enrolled in new course',
    lesson: 'Completed lesson and marked as done',
    achievement: 'Earned new achievement badge'
  }
  return descriptions[type]
}

function getActivityMetadata(type: ActivityItem['type']): Record<string, any> {
  const metadata = {
    submission: {
      assignmentName: 'Math Homework #5',
      submissionTime: new Date().toISOString(),
      fileCount: 2
    },
    grade: {
      score: '85/100',
      letterGrade: 'B',
      feedback: 'Good work overall'
    },
    announcement: {
      category: 'General',
      priority: 'Normal'
    },
    enrollment: {
      courseName: 'Advanced Mathematics',
      instructor: 'Dr. Smith'
    },
    lesson: {
      lessonName: 'Introduction to Calculus',
      duration: '45 minutes'
    },
    achievement: {
      badgeName: 'Quick Learner',
      points: 50
    }
  }
  return metadata[type]
}

// Cache implementation
class ActivityCache {
  private cache = new Map<string, { data: ActivityItem[], timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  get(key: string): ActivityItem[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  set(key: string, data: ActivityItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const activityCache = new ActivityCache()

export function useActivityData(options: UseActivityDataOptions = {}) {
  const { userId, courseId, limit = 20, refreshInterval } = options
  
  const [state, setState] = useState<ActivityDataState>({
    activities: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const cacheKey = `activities-${userId || 'all'}-${courseId || 'all'}-${limit}`

  const fetchActivities = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Check cache first
      const cached = activityCache.get(cacheKey)
      if (cached) {
        setState({
          activities: cached,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        })
        return
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real app, this would be an API call
      // const response = await fetch(`/api/activities?userId=${userId}&courseId=${courseId}&limit=${limit}`)
      // const activities = await response.json()
      
      // For now, use mock data
      const activities = generateMockActivities(limit)
      
      // Cache the results
      activityCache.set(cacheKey, activities)
      
      setState({
        activities,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch activities'
      }))
    }
  }, [cacheKey, userId, courseId, limit])

  const refresh = useCallback(() => {
    activityCache.clear()
    fetchActivities()
  }, [fetchActivities])

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchActivities()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchActivities, refreshInterval])

  return {
    ...state,
    refresh,
    clearCache: () => activityCache.clear()
  }
}

// Hook for real-time activity updates (WebSocket or Server-Sent Events)
export function useRealtimeActivities(options: UseActivityDataOptions = {}) {
  const activityData = useActivityData(options)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In a real app, this would establish a WebSocket connection
    // const ws = new WebSocket('/api/activities/stream')
    
    // ws.onopen = () => setIsConnected(true)
    // ws.onclose = () => setIsConnected(false)
    // ws.onmessage = (event) => {
    //   const newActivity = JSON.parse(event.data)
    //   // Update activities with new data
    // }
    
    // For demo purposes, simulate connection
    setIsConnected(true)
    
    // return () => ws.close()
  }, [])

  return {
    ...activityData,
    isConnected
  }
}