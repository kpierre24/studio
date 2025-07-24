"use client"

import React, { useState, useRef, memo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { 
  GripVertical, 
  Settings, 
  X, 
  Maximize2, 
  Minimize2,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

export interface WidgetConfig {
  id: string
  type: string
  title: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: { x: number; y: number }
  isVisible: boolean
  isMinimized: boolean
  settings?: Record<string, any>
  allowResize?: boolean
  allowMove?: boolean
  allowRemove?: boolean
}

export interface WidgetProps {
  config: WidgetConfig
  onConfigChange: (config: WidgetConfig) => void
  onRemove: () => void
  children: React.ReactNode
  isDragging?: boolean
  isEditing?: boolean
}

const sizeClasses = {
  sm: 'w-64 h-48',
  md: 'w-80 h-64',
  lg: 'w-96 h-80',
  xl: 'w-full h-96'
}

const sizeOptions = [
  { value: 'sm', label: 'Small', dimensions: '256×192' },
  { value: 'md', label: 'Medium', dimensions: '320×256' },
  { value: 'lg', label: 'Large', dimensions: '384×320' },
  { value: 'xl', label: 'Extra Large', dimensions: 'Full Width' }
]

const DashboardWidgetComponent = function DashboardWidget({
  config,
  onConfigChange,
  onRemove,
  children,
  isDragging = false,
  isEditing = false
}: WidgetProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragControls = useDragControls()
  const constraintsRef = useRef(null)

  const handleSizeChange = (newSize: WidgetConfig['size']) => {
    onConfigChange({
      ...config,
      size: newSize
    })
  }

  const handleToggleMinimize = () => {
    onConfigChange({
      ...config,
      isMinimized: !config.isMinimized
    })
  }

  const handleToggleVisibility = () => {
    onConfigChange({
      ...config,
      isVisible: !config.isVisible
    })
  }

  const handleDragEnd = (event: any, info: any) => {
    onConfigChange({
      ...config,
      position: {
        x: config.position.x + info.offset.x,
        y: config.position.y + info.offset.y
      }
    })
  }

  if (!config.isVisible && !isEditing) {
    return null
  }

  return (
    <motion.div
      ref={constraintsRef}
      drag={isEditing && config.allowMove}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: config.isVisible ? 1 : 0.5, 
        scale: 1,
        x: config.position.x,
        y: config.position.y
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
        sizeClasses[config.size],
        isDragging && "shadow-lg z-50",
        !config.isVisible && "opacity-50",
        isEditing && "ring-2 ring-blue-500/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        boxShadow: isEditing ? '0 10px 25px rgba(0, 0, 0, 0.1)' : undefined 
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          {isEditing && config.allowMove && (
            <motion.button
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onPointerDown={(e) => dragControls.start(e)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <GripVertical className="w-4 h-4" />
            </motion.button>
          )}
          
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
            {config.title}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <AnimatePresence>
            {(isHovered || isEditing) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                {/* Minimize/Maximize */}
                <motion.button
                  onClick={handleToggleMinimize}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {config.isMinimized ? (
                    <Maximize2 className="w-3 h-3" />
                  ) : (
                    <Minimize2 className="w-3 h-3" />
                  )}
                </motion.button>

                {/* Settings */}
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-3 h-3" />
                </motion.button>

                {/* Visibility Toggle (only in editing mode) */}
                {isEditing && (
                  <motion.button
                    onClick={handleToggleVisibility}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {config.isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </motion.button>
                )}

                {/* Remove */}
                {config.allowRemove && (
                  <motion.button
                    onClick={onRemove}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Widget Content */}
      <AnimatePresence mode="wait">
        {!config.isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div className="p-4 h-full">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg shadow-lg z-50"
          >
            <div className="p-4 space-y-4">
              {/* Size Selection */}
              {config.allowResize && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sizeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleSizeChange(option.value as WidgetConfig['size'])}
                        className={cn(
                          "p-2 text-xs rounded border transition-colors",
                          config.size === option.value
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-gray-500 dark:text-gray-400">{option.dimensions}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Settings */}
              {config.settings && Object.keys(config.settings).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Settings
                  </label>
                  <div className="space-y-2">
                    {Object.entries(config.settings).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'boolean' ? (value ? 'On' : 'Off') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <motion.button
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Memoized component with custom comparison function
export const DashboardWidget = memo(DashboardWidgetComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.config.id === nextProps.config.id &&
    prevProps.config.title === nextProps.config.title &&
    prevProps.config.size === nextProps.config.size &&
    prevProps.config.isVisible === nextProps.config.isVisible &&
    prevProps.config.isMinimized === nextProps.config.isMinimized &&
    prevProps.config.position.x === nextProps.config.position.x &&
    prevProps.config.position.y === nextProps.config.position.y &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isEditing === nextProps.isEditing &&
    JSON.stringify(prevProps.config.settings) === JSON.stringify(nextProps.config.settings)
  );
});