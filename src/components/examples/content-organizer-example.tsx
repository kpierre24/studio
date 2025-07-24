"use client"

import React, { useState } from 'react'
import { ContentOrganizer, ContentItem } from '@/components/ui/content-organizer'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

// Sample content items
const initialItems: ContentItem[] = [
  {
    id: '1',
    title: 'Introduction to Course',
    type: 'lesson',
    order: 0,
    metadata: {
      duration: '15 minutes',
      status: 'published'
    }
  },
  {
    id: '2',
    title: 'Week 1 Assignment',
    type: 'assignment',
    order: 1,
    metadata: {
      dueDate: '2025-08-01',
      points: 100
    }
  },
  {
    id: '3',
    title: 'Course Syllabus',
    type: 'resource',
    order: 2,
    metadata: {
      fileType: 'pdf',
      fileSize: '256KB'
    }
  },
  {
    id: '4',
    title: 'Understanding Key Concepts',
    type: 'lesson',
    order: 3,
    metadata: {
      duration: '30 minutes',
      status: 'published'
    }
  },
  {
    id: '5',
    title: 'Week 2 Assignment',
    type: 'assignment',
    order: 4,
    metadata: {
      dueDate: '2025-08-08',
      points: 150
    }
  },
  {
    id: '6',
    title: 'Supplementary Reading',
    type: 'resource',
    order: 5,
    metadata: {
      fileType: 'pdf',
      fileSize: '1.2MB'
    }
  }
]

export default function ContentOrganizerExample() {
  const [items, setItems] = useState<ContentItem[]>(initialItems)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null)

  const handleReorder = (reorderedItems: ContentItem[]) => {
    // Update the order property based on the new positions
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setItems(updatedItems)
    toast.success('Content order updated')
  }

  const handleEdit = (item: ContentItem) => {
    setCurrentItem(item)
    setShowEditModal(true)
    toast.success(`Editing "${item.title}"`)
    // In a real application, you would open a modal or navigate to an edit page
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    toast.success('Item deleted')
  }

  const handleDuplicate = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id)
    if (!itemToDuplicate) return
    
    const newItem: ContentItem = {
      ...itemToDuplicate,
      id: `${Date.now()}`,
      title: `${itemToDuplicate.title} (Copy)`,
      order: items.length
    }
    
    setItems([...items, newItem])
    toast.success(`Duplicated "${itemToDuplicate.title}"`)
  }

  const handleCreateFromTemplate = (type: ContentItem['type']) => {
    const newItem: ContentItem = {
      id: `${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      order: items.length,
      metadata: {}
    }
    
    setItems([...items, newItem])
    toast.success(`Created new ${type}`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Course Content Management</h1>
      
      <ContentOrganizer
        items={items}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCreateFromTemplate={handleCreateFromTemplate}
        className="mb-8"
      />
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Use the search box to filter content by title</li>
          <li>Filter by content type using the buttons</li>
          <li>Click "Reorder" to drag and drop items to change their order</li>
          <li>Select multiple items with checkboxes for bulk actions</li>
          <li>Use the "Create New" button to add new content</li>
          <li>Edit, duplicate, or delete individual items using the action buttons</li>
        </ul>
      </div>
    </div>
  )
}