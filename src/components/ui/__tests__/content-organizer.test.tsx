import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContentOrganizer, ContentItem } from '../content-organizer'

// Mock items for testing
const mockItems: ContentItem[] = [
  {
    id: '1',
    title: 'Introduction to Course',
    type: 'lesson',
    order: 0,
  },
  {
    id: '2',
    title: 'Week 1 Assignment',
    type: 'assignment',
    order: 1,
  },
  {
    id: '3',
    title: 'Course Syllabus',
    type: 'resource',
    order: 2,
  }
]

// Mock handlers
const mockReorder = jest.fn()
const mockEdit = jest.fn()
const mockDelete = jest.fn()
const mockDuplicate = jest.fn()
const mockCreateFromTemplate = jest.fn()

describe('ContentOrganizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with items', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Check if component title is rendered
    expect(screen.getByText('Content Organizer')).toBeInTheDocument()

    // Check if all items are rendered
    expect(screen.getByText('Introduction to Course')).toBeInTheDocument()
    expect(screen.getByText('Week 1 Assignment')).toBeInTheDocument()
    expect(screen.getByText('Course Syllabus')).toBeInTheDocument()
  })

  it('filters items by search query', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search content...')
    fireEvent.change(searchInput, { target: { value: 'Assignment' } })

    // Check if only matching item is visible
    expect(screen.getByText('Week 1 Assignment')).toBeInTheDocument()
    expect(screen.queryByText('Introduction to Course')).not.toBeInTheDocument()
    expect(screen.queryByText('Course Syllabus')).not.toBeInTheDocument()
  })

  it('filters items by type', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Click on Lessons filter
    fireEvent.click(screen.getByText('Lessons'))

    // Check if only lesson items are visible
    expect(screen.getByText('Introduction to Course')).toBeInTheDocument()
    expect(screen.queryByText('Week 1 Assignment')).not.toBeInTheDocument()
    expect(screen.queryByText('Course Syllabus')).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Find and click the first edit button
    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find(button => button.querySelector('svg[data-lucide="Edit"]'))
    fireEvent.click(editButton!)

    // Check if onEdit was called with the correct item
    expect(mockEdit).toHaveBeenCalledWith(mockItems[0])
  })

  it('calls onDelete when delete option is selected', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Open dropdown menu for the first item
    const moreButtons = screen.getAllByRole('button', { name: '' })
    const moreButton = moreButtons.find(button => button.querySelector('svg[data-lucide="MoreVertical"]'))
    fireEvent.click(moreButton!)

    // Click delete option
    fireEvent.click(screen.getByText('Delete'))

    // Check if onDelete was called with the correct item id
    expect(mockDelete).toHaveBeenCalledWith(mockItems[0].id)
  })

  it('supports bulk selection and actions', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
        onDuplicate={mockDuplicate}
      />
    )

    // Select the first two items
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // First item checkbox
    fireEvent.click(checkboxes[2]) // Second item checkbox

    // Check if selection count is displayed
    expect(screen.getByText('2 items selected')).toBeInTheDocument()

    // Click bulk delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if confirmation was shown and onDelete was called for each selected item
    // Note: This assumes window.confirm returns true
    window.confirm = jest.fn(() => true)
    expect(mockDelete).toHaveBeenCalledTimes(2)
    expect(mockDelete).toHaveBeenCalledWith(mockItems[0].id)
    expect(mockDelete).toHaveBeenCalledWith(mockItems[1].id)
  })

  it('toggles reordering mode', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Click reorder button
    fireEvent.click(screen.getByText('Reorder'))

    // Check if reordering mode is active (Done button is visible)
    expect(screen.getByText('Done')).toBeInTheDocument()

    // Click done button
    fireEvent.click(screen.getByText('Done'))

    // Check if reordering mode is inactive (Reorder button is visible again)
    expect(screen.getByText('Reorder')).toBeInTheDocument()
  })

  it('shows empty state when no items match filters', () => {
    render(
      <ContentOrganizer
        items={mockItems}
        onReorder={mockReorder}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    )

    // Type a search query that won't match any items
    const searchInput = screen.getByPlaceholderText('Search content...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    // Check if empty state is displayed
    expect(screen.getByText('No content found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
  })
})