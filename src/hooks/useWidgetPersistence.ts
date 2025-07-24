"use client"

import { useState, useEffect, useCallback } from 'react'
import { WidgetConfig, DashboardLayout } from '@/components/ui/widget-system'

interface UseWidgetPersistenceOptions {
  userId: string
  dashboardId?: string
  autoSave?: boolean
  saveDelay?: number
}

interface WidgetPersistenceState {
  widgets: WidgetConfig[]
  layouts: DashboardLayout[]
  currentLayout: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  lastSaved: Date | null
}

// Local storage keys
const STORAGE_KEYS = {
  widgets: (userId: string, dashboardId: string) => `widgets_${userId}_${dashboardId}`,
  layouts: (userId: string) => `layouts_${userId}`,
  currentLayout: (userId: string) => `current_layout_${userId}`
}

// Default layouts for different user roles
const DEFAULT_LAYOUTS: Record<string, DashboardLayout> = {
  student: {
    id: 'student-default',
    name: 'Student Dashboard',
    isDefault: true,
    widgets: [
      {
        id: 'progress-widget',
        type: 'progress',
        title: 'My Progress',
        size: 'md',
        position: { x: 0, y: 0 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { showDetails: true }
      },
      {
        id: 'assignments-widget',
        type: 'assignments',
        title: 'Upcoming Assignments',
        size: 'md',
        position: { x: 320, y: 0 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { limit: 5 }
      },
      {
        id: 'grades-widget',
        type: 'grades',
        title: 'Recent Grades',
        size: 'sm',
        position: { x: 0, y: 280 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: true,
        settings: { showTrends: true }
      }
    ]
  },
  teacher: {
    id: 'teacher-default',
    name: 'Teacher Dashboard',
    isDefault: true,
    widgets: [
      {
        id: 'class-overview-widget',
        type: 'class-overview',
        title: 'Class Overview',
        size: 'lg',
        position: { x: 0, y: 0 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { showStats: true }
      },
      {
        id: 'submissions-widget',
        type: 'recent-submissions',
        title: 'Recent Submissions',
        size: 'md',
        position: { x: 400, y: 0 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { limit: 10 }
      }
    ]
  },
  admin: {
    id: 'admin-default',
    name: 'Admin Dashboard',
    isDefault: true,
    widgets: [
      {
        id: 'system-stats-widget',
        type: 'system-stats',
        title: 'System Statistics',
        size: 'xl',
        position: { x: 0, y: 0 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { refreshInterval: 30000 }
      },
      {
        id: 'user-activity-widget',
        type: 'user-activity',
        title: 'User Activity',
        size: 'lg',
        position: { x: 0, y: 400 },
        isVisible: true,
        isMinimized: false,
        allowResize: true,
        allowMove: true,
        allowRemove: false,
        settings: { timeRange: '24h' }
      }
    ]
  }
}

export function useWidgetPersistence(options: UseWidgetPersistenceOptions) {
  const { userId, dashboardId = 'default', autoSave = true, saveDelay = 1000 } = options
  
  const [state, setState] = useState<WidgetPersistenceState>({
    widgets: [],
    layouts: [],
    currentLayout: null,
    isLoading: true,
    isSaving: false,
    error: null,
    lastSaved: null
  })

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Load layouts
      const layoutsKey = STORAGE_KEYS.layouts(userId)
      const savedLayouts = localStorage.getItem(layoutsKey)
      const layouts: DashboardLayout[] = savedLayouts ? JSON.parse(savedLayouts) : []

      // Load current layout
      const currentLayoutKey = STORAGE_KEYS.currentLayout(userId)
      const currentLayout = localStorage.getItem(currentLayoutKey) || dashboardId

      // Load widgets for current dashboard
      const widgetsKey = STORAGE_KEYS.widgets(userId, currentLayout)
      const savedWidgets = localStorage.getItem(widgetsKey)
      
      let widgets: WidgetConfig[] = []
      
      if (savedWidgets) {
        widgets = JSON.parse(savedWidgets)
      } else {
        // Use default layout if no saved widgets
        const userRole = getUserRole(userId) // This would come from your auth system
        const defaultLayout = DEFAULT_LAYOUTS[userRole]
        if (defaultLayout) {
          widgets = defaultLayout.widgets
          // Add default layout to layouts if not exists
          if (!layouts.find(l => l.id === defaultLayout.id)) {
            layouts.push(defaultLayout)
          }
        }
      }

      setState({
        widgets,
        layouts,
        currentLayout,
        isLoading: false,
        isSaving: false,
        error: null,
        lastSaved: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load widget data'
      }))
    }
  }, [userId, dashboardId])

  // Save data to localStorage
  const saveData = useCallback(async (widgets: WidgetConfig[], immediate = false) => {
    if (!immediate && autoSave && saveTimeout) {
      clearTimeout(saveTimeout)
    }

    const performSave = () => {
      try {
        setState(prev => ({ ...prev, isSaving: true, error: null }))

        const widgetsKey = STORAGE_KEYS.widgets(userId, state.currentLayout || dashboardId)
        localStorage.setItem(widgetsKey, JSON.stringify(widgets))

        setState(prev => ({
          ...prev,
          widgets,
          isSaving: false,
          lastSaved: new Date()
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to save widget data'
        }))
      }
    }

    if (immediate || !autoSave) {
      performSave()
    } else {
      const timeout = setTimeout(performSave, saveDelay)
      setSaveTimeout(timeout)
    }
  }, [userId, dashboardId, state.currentLayout, autoSave, saveDelay, saveTimeout])

  // Update widgets
  const updateWidgets = useCallback((newWidgets: WidgetConfig[]) => {
    setState(prev => ({ ...prev, widgets: newWidgets }))
    if (autoSave) {
      saveData(newWidgets)
    }
  }, [autoSave, saveData])

  // Save layout
  const saveLayout = useCallback((layout: DashboardLayout) => {
    try {
      const layoutsKey = STORAGE_KEYS.layouts(userId)
      const existingLayouts = state.layouts.filter(l => l.id !== layout.id)
      const newLayouts = [...existingLayouts, layout]
      
      localStorage.setItem(layoutsKey, JSON.stringify(newLayouts))
      
      setState(prev => ({
        ...prev,
        layouts: newLayouts
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save layout'
      }))
    }
  }, [userId, state.layouts])

  // Switch layout
  const switchLayout = useCallback((layoutId: string) => {
    try {
      const layout = state.layouts.find(l => l.id === layoutId)
      if (!layout) {
        throw new Error('Layout not found')
      }

      const currentLayoutKey = STORAGE_KEYS.currentLayout(userId)
      localStorage.setItem(currentLayoutKey, layoutId)

      setState(prev => ({
        ...prev,
        currentLayout: layoutId,
        widgets: layout.widgets
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to switch layout'
      }))
    }
  }, [userId, state.layouts])

  // Delete layout
  const deleteLayout = useCallback((layoutId: string) => {
    try {
      const layout = state.layouts.find(l => l.id === layoutId)
      if (layout?.isDefault) {
        throw new Error('Cannot delete default layout')
      }

      const newLayouts = state.layouts.filter(l => l.id !== layoutId)
      const layoutsKey = STORAGE_KEYS.layouts(userId)
      localStorage.setItem(layoutsKey, JSON.stringify(newLayouts))

      // If deleting current layout, switch to default
      if (state.currentLayout === layoutId) {
        const defaultLayout = newLayouts.find(l => l.isDefault)
        if (defaultLayout) {
          switchLayout(defaultLayout.id)
        }
      }

      setState(prev => ({
        ...prev,
        layouts: newLayouts
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete layout'
      }))
    }
  }, [userId, state.layouts, state.currentLayout, switchLayout])

  // Reset to default
  const resetToDefault = useCallback(() => {
    const userRole = getUserRole(userId)
    const defaultLayout = DEFAULT_LAYOUTS[userRole]
    
    if (defaultLayout) {
      updateWidgets(defaultLayout.widgets)
    }
  }, [userId, updateWidgets])

  // Clear all data
  const clearAllData = useCallback(() => {
    try {
      const widgetsKey = STORAGE_KEYS.widgets(userId, state.currentLayout || dashboardId)
      const layoutsKey = STORAGE_KEYS.layouts(userId)
      const currentLayoutKey = STORAGE_KEYS.currentLayout(userId)
      
      localStorage.removeItem(widgetsKey)
      localStorage.removeItem(layoutsKey)
      localStorage.removeItem(currentLayoutKey)
      
      loadData()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear data'
      }))
    }
  }, [userId, dashboardId, state.currentLayout, loadData])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  return {
    ...state,
    updateWidgets,
    saveData: (immediate = false) => saveData(state.widgets, immediate),
    saveLayout,
    switchLayout,
    deleteLayout,
    resetToDefault,
    clearAllData,
    refresh: loadData
  }
}

// Helper function to determine user role (would be replaced with actual auth logic)
function getUserRole(userId: string): 'student' | 'teacher' | 'admin' {
  // This is a placeholder - in a real app, this would come from your authentication system
  if (userId.includes('admin')) return 'admin'
  if (userId.includes('teacher')) return 'teacher'
  return 'student'
}

// Hook for managing multiple dashboard layouts
export function useLayoutManager(userId: string) {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLayouts = () => {
      try {
        const layoutsKey = STORAGE_KEYS.layouts(userId)
        const savedLayouts = localStorage.getItem(layoutsKey)
        const parsedLayouts: DashboardLayout[] = savedLayouts ? JSON.parse(savedLayouts) : []
        
        // Ensure default layout exists
        const userRole = getUserRole(userId)
        const defaultLayout = DEFAULT_LAYOUTS[userRole]
        
        if (defaultLayout && !parsedLayouts.find(l => l.id === defaultLayout.id)) {
          parsedLayouts.push(defaultLayout)
        }
        
        setLayouts(parsedLayouts)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load layouts:', error)
        setIsLoading(false)
      }
    }

    loadLayouts()
  }, [userId])

  const createLayout = useCallback((name: string, widgets: WidgetConfig[]) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      name,
      widgets: widgets.map(w => ({ ...w, position: { x: 0, y: 0 } })), // Reset positions
      isDefault: false
    }

    const newLayouts = [...layouts, newLayout]
    setLayouts(newLayouts)

    const layoutsKey = STORAGE_KEYS.layouts(userId)
    localStorage.setItem(layoutsKey, JSON.stringify(newLayouts))

    return newLayout
  }, [layouts, userId])

  return {
    layouts,
    isLoading,
    createLayout
  }
}