"use client"

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { 
  GripVertical, 
  Search, 
  Filter, 
  Copy, 
  Trash2, 
  Edit, 
  Plus,
  FileText,
  BookOpen,
  Clipboard,
  MoreVertical,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { Button } from './button'
import { Input } from './input'
import { Checkbox } from './checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'

export interface ContentItem {
  id: string
  title: string
  type: 'lesson' | 'assignment' | 'resource'
  order: number
  metadata?: Record<string, any>
}

export interface ContentOrganizerProps {
  items: ContentItem[]
  onReorder: (items: ContentItem[]) => void
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onDuplicate?: (id: string) => void
  onCreateFromTemplate?: (type: ContentItem['type']) => void
  className?: string
}

const typeIcons = {
  'lesson': BookOpen,
  'assignment': Clipboard,
  'resource': FileText
}

const typeLabels = {
  'lesson': 'Lesson',
  'assignment': 'Assignment',
  'resource': 'Resource'
}

export function ContentOrganizer({
  items,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateFromTemplate,
  className
}: ContentOrganizerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ContentItem['type'] | 'all'>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isReordering, setIsReordering] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter items based on search query and selected type
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesType
  })

  // Sort items by order
  const sortedItems = [...filteredItems].sort((a, b) => a.order - b.order)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTypeFilter = useCallback((type: ContentItem['type'] | 'all') => {
    setSelectedType(type)
  }, [])

  const handleReorderEnd = useCallback(() => {
    // Update the order property of each item based on its new position
    const updatedItems = items.map(item => {
      const newIndex = sortedItems.findIndex(i => i.id === item.id)
      return newIndex !== -1 ? { ...item, order: newIndex } : item
    })
    onReorder(updatedItems)
    setIsReordering(false)
  }, [items, sortedItems, onReorder])

  const handleSelectItem = useCallback((id: string, isSelected: boolean) => {
    setSelectedItems(prev => 
      isSelected 
        ? [...prev, id] 
        : prev.filter(itemId => itemId !== id)
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }, [filteredItems, selectedItems.length])

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return
    
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      selectedItems.forEach(id => onDelete(id))
      setSelectedItems([])
    }
  }, [selectedItems, onDelete])

  const handleBulkDuplicate = useCallback(() => {
    if (!onDuplicate || selectedItems.length === 0) return
    
    selectedItems.forEach(id => onDuplicate(id))
    setSelectedItems([])
  }, [selectedItems, onDuplicate])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    searchInputRef.current?.focus()
  }, [])

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm", className)}>
      {/* Header with search and filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Content Organizer
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReordering(!isReordering)}
              className={cn(
                isReordering && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              )}
            >
              {isReordering ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </>
              ) : (
                <>
                  <GripVertical className="w-4 h-4 mr-1" />
                  Reorder
                </>
              )}
            </Button>
            
            {onCreateFromTemplate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateFromTemplate('lesson')}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    New Lesson
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateFromTemplate('assignment')}>
                    <Clipboard className="w-4 h-4 mr-2" />
                    New Assignment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateFromTemplate('resource')}>
                    <FileText className="w-4 h-4 mr-2" />
                    New Resource
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              isSearchFocused ? "text-blue-500" : "text-gray-400"
            )} />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search content..."
              className="pl-9 pr-8"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTypeFilter('all')}
              className={cn(
                "whitespace-nowrap",
                selectedType === 'all' && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              All Types
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTypeFilter('lesson')}
              className={cn(
                "whitespace-nowrap",
                selectedType === 'lesson' && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Lessons
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTypeFilter('assignment')}
              className={cn(
                "whitespace-nowrap",
                selectedType === 'assignment' && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Clipboard className="w-4 h-4 mr-1" />
              Assignments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTypeFilter('resource')}
              className={cn(
                "whitespace-nowrap",
                selectedType === 'resource' && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <FileText className="w-4 h-4 mr-1" />
              Resources
            </Button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all"
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDuplicate}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Content List */}
      <div className="p-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No content found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : "Start by creating new content"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {isReordering ? (
              <Reorder.Group
                axis="y"
                values={sortedItems}
                onReorder={onReorder}
                className="space-y-2"
                as="div"
                layoutScroll
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                {sortedItems.map((item) => {
                  const Icon = typeIcons[item.type]
                  
                  return (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      variants={staggerItem}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                      whileDrag={{ 
                        scale: 1.02,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        zIndex: 10
                      }}
                    >
                      <div className="text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {typeLabels[item.type]}
                          {item.metadata?.dueDate && ` • Due: ${new Date(item.metadata.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            ) : (
              <motion.div
                className="space-y-2"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                {sortedItems.map((item) => {
                  const Icon = typeIcons[item.type]
                  const isSelected = selectedItems.includes(item.id)
                  
                  return (
                    <motion.div
                      key={item.id}
                      variants={staggerItem}
                      className={cn(
                        "border rounded-lg p-3 flex items-center gap-3",
                        isSelected 
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" 
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {typeLabels[item.type]}
                          {item.metadata?.dueDate && ` • Due: ${new Date(item.metadata.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onDuplicate && (
                              <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => onDelete(item.id)}
                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}