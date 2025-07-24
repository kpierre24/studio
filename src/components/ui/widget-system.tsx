"use client"

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Save, 
  RotateCcw,
  Grid3X3,
  Layout,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardWidget, WidgetConfig } from './dashboard-widget'
import { fadeInUp, staggerContainer } from '@/lib/animations'

export interface WidgetTemplate {
  id: string
  type: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  defaultSize: WidgetConfig['size']
  defaultSettings?: Record<string, any>
  component: React.ComponentType<any>
  category: 'analytics' | 'content' | 'communication' | 'productivity'
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: WidgetConfig[]
  isDefault?: boolean
}

interface WidgetSystemProps {
  widgets: WidgetConfig[]
  templates: WidgetTemplate[]
  onWidgetsChange: (widgets: WidgetConfig[]) => void
  userRole?: 'student' | 'teacher' | 'admin'
  className?: string
}

const roleBasedTemplates = {
  student: ['progress', 'assignments', 'grades', 'schedule', 'announcements'],
  teacher: ['class-overview', 'recent-submissions', 'grade-distribution', 'announcements', 'calendar'],
  admin: ['system-stats', 'user-activity', 'course-analytics', 'reports', 'notifications']
}

export function WidgetSystem({
  widgets,
  templates,
  onWidgetsChange,
  userRole = 'student',
  className
}: WidgetSystemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter templates based on user role
  const availableTemplates = templates.filter(template => 
    roleBasedTemplates[userRole]?.includes(template.type) || !roleBasedTemplates[userRole]
  )

  const filteredTemplates = selectedCategory === 'all' 
    ? availableTemplates
    : availableTemplates.filter(template => template.category === selectedCategory)

  const handleAddWidget = useCallback((template: WidgetTemplate) => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: template.type,
      title: template.title,
      size: template.defaultSize,
      position: { x: 0, y: 0 },
      isVisible: true,
      isMinimized: false,
      settings: template.defaultSettings || {},
      allowResize: true,
      allowMove: true,
      allowRemove: true
    }

    onWidgetsChange([...widgets, newWidget])
    setShowAddWidget(false)
  }, [widgets, onWidgetsChange])

  const handleWidgetConfigChange = useCallback((widgetId: string, newConfig: WidgetConfig) => {
    onWidgetsChange(
      widgets.map(widget => 
        widget.id === widgetId ? newConfig : widget
      )
    )
  }, [widgets, onWidgetsChange])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    onWidgetsChange(widgets.filter(widget => widget.id !== widgetId))
  }, [widgets, onWidgetsChange])

  const handleResetLayout = useCallback(() => {
    // Reset all widgets to default positions and settings
    const resetWidgets = widgets.map(widget => ({
      ...widget,
      position: { x: 0, y: 0 },
      isMinimized: false,
      isVisible: true
    }))
    onWidgetsChange(resetWidgets)
  }, [widgets, onWidgetsChange])

  const categories = [
    { id: 'all', label: 'All Widgets', icon: Grid3X3 },
    { id: 'analytics', label: 'Analytics', icon: Layout },
    { id: 'content', label: 'Content', icon: Layout },
    { id: 'communication', label: 'Communication', icon: Layout },
    { id: 'productivity', label: 'Productivity', icon: Layout }
  ]

  return (
    <div className={cn("relative", className)}>
      {/* Control Bar */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Dashboard Widgets
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {widgets.filter(w => w.isVisible).length} of {widgets.length} visible
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </motion.button>

          <motion.button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Layout
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Layout
              </>
            )}
          </motion.button>

          {isEditing && (
            <motion.button
              onClick={handleResetLayout}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Widget Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={cn(
          "grid gap-6 auto-rows-min",
          isEditing ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        <AnimatePresence>
          {widgets.map((widget) => {
            const template = templates.find(t => t.type === widget.type)
            if (!template) return null

            const WidgetComponent = template.component

            return (
              <DashboardWidget
                key={widget.id}
                config={widget}
                onConfigChange={(newConfig) => handleWidgetConfigChange(widget.id, newConfig)}
                onRemove={() => handleRemoveWidget(widget.id)}
                isEditing={isEditing}
              >
                <WidgetComponent {...widget.settings} />
              </DashboardWidget>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add Widget
                  </h3>
                  <motion.button
                    onClick={() => setShowAddWidget(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </motion.button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <motion.button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                          selectedCategory === category.id
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => {
                    const Icon = template.icon
                    return (
                      <motion.button
                        key={template.id}
                        onClick={() => handleAddWidget(template)}
                        className="p-4 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {template.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                {template.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No widgets available in this category
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}