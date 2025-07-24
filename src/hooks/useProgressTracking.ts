"use client"

import { useState, useEffect, useCallback } from 'react'
import { CourseProgressData } from '@/components/ui/course-progress-card'

interface UseProgressTrackingOptions {
  userId: string
  courseId?: string
  refreshInterval?: number
}

interface ProgressTrackingState {
  courses: CourseProgressData[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Mock data generator for development
function generateMockProgressData(userId: string, courseId?: string): CourseProgressData[] {
  const courses = [
    {
      courseId: 'math-101',
      courseName: 'Advanced Mathematics',
      instructor: 'Dr. Sarah Johnson',
      totalLessons: 24,
      completedLessons: 18,
      totalAssignments: 8,
      completedAssignments: 6,
      averageGrade: 87.5,
      timeSpent: 1440, // 24 hours
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      nextDeadline: {
        title: 'Calculus Assignment #3',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        type: 'assignment' as const
      },
      milestones: [
        {
          id: 'milestone-1',
          title: 'Completed Derivatives Chapter',
          type: 'lesson' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          score: 92
        },
        {
          id: 'milestone-2',
          title: 'Integration Quiz',
          type: 'quiz' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          score: 85
        },
        {
          id: 'milestone-3',
          title: 'Limits Assignment',
          type: 'assignment' as const,
          isCompleted: false,
          isOverdue: true
        }
      ]
    },
    {
      courseId: 'physics-201',
      courseName: 'Quantum Physics',
      instructor: 'Prof. Michael Chen',
      totalLessons: 20,
      completedLessons: 12,
      totalAssignments: 6,
      completedAssignments: 4,
      averageGrade: 91.2,
      timeSpent: 960, // 16 hours
      lastAccessed: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      nextDeadline: {
        title: 'Quantum Mechanics Exam',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        type: 'exam' as const
      },
      milestones: [
        {
          id: 'milestone-4',
          title: 'Wave Functions Lab',
          type: 'assignment' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          score: 94
        },
        {
          id: 'milestone-5',
          title: 'Uncertainty Principle Quiz',
          type: 'quiz' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
          score: 88
        }
      ]
    },
    {
      courseId: 'cs-301',
      courseName: 'Data Structures & Algorithms',
      instructor: 'Dr. Emily Rodriguez',
      totalLessons: 30,
      completedLessons: 8,
      totalAssignments: 10,
      completedAssignments: 3,
      averageGrade: 78.3,
      timeSpent: 720, // 12 hours
      lastAccessed: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      nextDeadline: {
        title: 'Binary Tree Implementation',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'assignment' as const
      },
      milestones: [
        {
          id: 'milestone-6',
          title: 'Arrays and Linked Lists',
          type: 'lesson' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 120 * 60 * 60 * 1000),
          score: 82
        },
        {
          id: 'milestone-7',
          title: 'Stack Implementation',
          type: 'assignment' as const,
          isCompleted: true,
          completedAt: new Date(Date.now() - 144 * 60 * 60 * 1000),
          score: 75
        },
        {
          id: 'milestone-8',
          title: 'Queue Operations Quiz',
          type: 'quiz' as const,
          isCompleted: false
        }
      ]
    }
  ]

  if (courseId) {
    return courses.filter(course => course.courseId === courseId)
  }

  return courses
}

// Cache for progress data
class ProgressCache {
  private cache = new Map<string, { data: CourseProgressData[], timestamp: number }>()
  private readonly TTL = 2 * 60 * 1000 // 2 minutes

  get(key: string): CourseProgressData[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  set(key: string, data: CourseProgressData[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const progressCache = new ProgressCache()

export function useProgressTracking(options: UseProgressTrackingOptions) {
  const { userId, courseId, refreshInterval } = options
  
  const [state, setState] = useState<ProgressTrackingState>({
    courses: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const cacheKey = `progress-${userId}-${courseId || 'all'}`

  const fetchProgressData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Check cache first
      const cached = progressCache.get(cacheKey)
      if (cached) {
        setState({
          courses: cached,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        })
        return
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // In a real app, this would be an API call
      // const response = await fetch(`/api/progress?userId=${userId}&courseId=${courseId}`)
      // const courses = await response.json()
      
      // For now, use mock data
      const courses = generateMockProgressData(userId, courseId)
      
      // Cache the results
      progressCache.set(cacheKey, courses)
      
      setState({
        courses,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress data'
      }))
    }
  }, [cacheKey, userId, courseId])

  const refresh = useCallback(() => {
    progressCache.clear()
    fetchProgressData()
  }, [fetchProgressData])

  const updateCourseProgress = useCallback((courseId: string, updates: Partial<CourseProgressData>) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(course =>
        course.courseId === courseId ? { ...course, ...updates } : course
      )
    }))
    
    // Clear cache to force refresh on next fetch
    progressCache.clear()
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProgressData()
  }, [fetchProgressData])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchProgressData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchProgressData, refreshInterval])

  return {
    ...state,
    refresh,
    updateCourseProgress,
    clearCache: () => progressCache.clear()
  }
}

// Hook for tracking individual lesson/assignment progress
export function useItemProgress(itemId: string, itemType: 'lesson' | 'assignment' | 'quiz') {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const startTracking = useCallback(() => {
    setStartTime(new Date())
  }, [])

  const stopTracking = useCallback(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) // minutes
      setTimeSpent(prev => prev + elapsed)
      setStartTime(null)
    }
  }, [startTime])

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100))
    if (newProgress >= 100) {
      setIsCompleted(true)
      stopTracking()
    }
  }, [stopTracking])

  const markCompleted = useCallback(() => {
    setProgress(100)
    setIsCompleted(true)
    stopTracking()
  }, [stopTracking])

  const reset = useCallback(() => {
    setProgress(0)
    setIsCompleted(false)
    setTimeSpent(0)
    setStartTime(null)
  }, [])

  // Auto-stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
        setTimeSpent(prev => prev + elapsed)
      }
    }
  }, [startTime])

  return {
    progress,
    isCompleted,
    timeSpent,
    isTracking: !!startTime,
    startTracking,
    stopTracking,
    updateProgress,
    markCompleted,
    reset
  }
}

// Hook for calculating overall progress across multiple courses
export function useOverallProgress(courses: CourseProgressData[]) {
  const overallStats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => 
      c.completedLessons === c.totalLessons && 
      c.completedAssignments === c.totalAssignments
    ).length,
    totalLessons: courses.reduce((sum, c) => sum + c.totalLessons, 0),
    completedLessons: courses.reduce((sum, c) => sum + c.completedLessons, 0),
    totalAssignments: courses.reduce((sum, c) => sum + c.totalAssignments, 0),
    completedAssignments: courses.reduce((sum, c) => sum + c.completedAssignments, 0),
    totalTimeSpent: courses.reduce((sum, c) => sum + c.timeSpent, 0),
    averageGrade: courses.reduce((sum, c) => sum + (c.averageGrade || 0), 0) / courses.length,
    upcomingDeadlines: courses
      .filter(c => c.nextDeadline)
      .map(c => ({ ...c.nextDeadline!, courseId: c.courseId, courseName: c.courseName }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const overallProgress = courses.length > 0 
    ? Math.round(
        ((overallStats.completedLessons / overallStats.totalLessons) * 0.6 + 
         (overallStats.completedAssignments / overallStats.totalAssignments) * 0.4) * 100
      )
    : 0

  return {
    ...overallStats,
    overallProgress
  }
}