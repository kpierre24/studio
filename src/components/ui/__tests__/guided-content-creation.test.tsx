import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentCreationWizard } from '../content-creation-wizard';
import { validateAssignmentContent } from '../../../lib/content-validation';
import { AssignmentType } from '../../../types';

// Mock the useAppContext hook
jest.mock('../../../contexts/AppContext', () => ({
  useAppContext: () => ({
    handleCreateAssignment: jest.fn(),
    handleUpdateAssignment: jest.fn(),
    state: { isLoading: false, error: null }
  })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

describe('ContentCreationWizard', () => {
  const mockProps = {
    courseId: 'course-123',
    courseName: 'Test Course',
    onComplete: jest.fn(),
    onCancel: jest.fn(),
    isOpen: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the wizard when open', () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    expect(screen.getByText('Create New Assignment')).toBeInTheDocument();
    expect(screen.getByText('for Test Course')).toBeInTheDocument();
    expect(screen.getByText('Choose Template')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ContentCreationWizard {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Create New Assignment')).not.toBeInTheDocument();
  });

  it('shows template selection on first step', () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    expect(screen.getByText('Essay Assignment')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Quiz')).toBeInTheDocument();
    expect(screen.getByText('Project Assignment')).toBeInTheDocument();
  });

  it('allows template selection and navigation', async () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    // Select essay template
    fireEvent.click(screen.getByText('Essay Assignment'));
    
    // Next button should be enabled
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
    
    // Click next to go to basic info step
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
  });

  it('validates required fields in basic info step', async () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    // Select template and go to basic info
    fireEvent.click(screen.getByText('Essay Assignment'));
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
    
    // Next button should be disabled without required fields
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
    
    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText('Enter a clear, descriptive title'), {
      target: { value: 'Test Assignment' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Provide detailed instructions and expectations'), {
      target: { value: 'This is a test assignment description that is long enough to pass validation.' }
    });
    
    // Set due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: dateString }
    });
    
    // Next button should now be enabled
    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('shows validation errors for invalid input', () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    // Select template and go to basic info
    fireEvent.click(screen.getByText('Essay Assignment'));
    fireEvent.click(screen.getByText('Next'));
    
    // Should show validation errors
    expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument();
    expect(screen.getByText('• Title is required')).toBeInTheDocument();
    expect(screen.getByText('• Description is required')).toBeInTheDocument();
    expect(screen.getByText('• Due date is required')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ContentCreationWizard {...mockProps} />);
    
    fireEvent.click(screen.getByText('×'));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});

describe('validateAssignmentContent', () => {
  it('validates basic assignment data correctly', () => {
    const validData = {
      title: 'Test Assignment',
      description: 'This is a detailed description for the test assignment.',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      type: AssignmentType.STANDARD,
      totalPoints: 100,
      rubric: [
        { id: '1', description: 'Content', points: 50 },
        { id: '2', description: 'Style', points: 50 }
      ],
      questions: [],
      externalLink: 'https://example.com',
      attachmentFile: null
    };

    const result = validateAssignmentContent(validData);
    
    expect(result.isValid).toBe(true);
    expect(result.overallProgress).toBeGreaterThan(80);
    expect(result.sections).toHaveLength(3); // Basic, Grading, Resources
  });

  it('detects validation errors', () => {
    const invalidData = {
      title: '', // Missing title
      description: 'Short', // Too short
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Past date
      type: AssignmentType.STANDARD,
      totalPoints: 0, // Invalid points
      rubric: [],
      questions: [],
      externalLink: 'not-a-url', // Invalid URL
      attachmentFile: null
    };

    const result = validateAssignmentContent(invalidData);
    
    expect(result.isValid).toBe(false);
    expect(result.overallProgress).toBeLessThan(50);
    
    // Should have error items
    const hasErrors = result.sections.some(section =>
      section.items.some(item => item.status === 'error')
    );
    expect(hasErrors).toBe(true);
  });

  it('validates quiz assignments correctly', () => {
    const quizData = {
      title: 'Test Quiz',
      description: 'This is a test quiz with multiple questions.',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      type: AssignmentType.QUIZ,
      totalPoints: 50,
      rubric: [],
      questions: [
        {
          id: '1',
          questionText: 'What is 2 + 2?',
          questionType: 'multiple-choice' as any,
          options: ['3', '4', '5'],
          correctAnswer: '4',
          points: 25
        },
        {
          id: '2',
          questionText: 'What is the capital of France?',
          questionType: 'short-answer' as any,
          correctAnswer: 'Paris',
          points: 25
        }
      ]
    };

    const result = validateAssignmentContent(quizData);
    
    expect(result.isValid).toBe(true);
    expect(result.overallProgress).toBeGreaterThan(80);
  });

  it('detects quiz validation errors', () => {
    const invalidQuizData = {
      title: 'Test Quiz',
      description: 'This is a test quiz.',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      type: AssignmentType.QUIZ,
      totalPoints: 50,
      rubric: [],
      questions: [] // No questions
    };

    const result = validateAssignmentContent(invalidQuizData);
    
    expect(result.isValid).toBe(false);
    
    // Should have error about missing questions
    const hasQuestionError = result.sections.some(section =>
      section.items.some(item => 
        item.id === 'questions' && item.status === 'error'
      )
    );
    expect(hasQuestionError).toBe(true);
  });
});