import { AssignmentType, QuizQuestion, RubricCriterion } from '@/types';
import { ValidationSection, ValidationItem } from '@/components/ui/content-validation-checker';

export interface AssignmentValidationData {
  title: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  totalPoints: number;
  rubric: RubricCriterion[];
  questions: QuizQuestion[];
  externalLink?: string;
  attachmentFile?: File | null;
}

export function validateAssignmentContent(data: AssignmentValidationData): {
  sections: ValidationSection[];
  overallProgress: number;
  isValid: boolean;
} {
  const sections: ValidationSection[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Basic Information Validation
  const basicInfoItems: ValidationItem[] = [];
  
  // Title validation
  totalChecks++;
  if (data.title.trim()) {
    if (data.title.length >= 5 && data.title.length <= 100) {
      basicInfoItems.push({
        id: 'title',
        label: 'Title is appropriate length',
        status: 'success'
      });
      passedChecks++;
    } else {
      basicInfoItems.push({
        id: 'title',
        label: 'Title should be 5-100 characters',
        status: 'warning',
        message: `Current length: ${data.title.length} characters`
      });
    }
  } else {
    basicInfoItems.push({
      id: 'title',
      label: 'Title is required',
      status: 'error'
    });
  }

  // Description validation
  totalChecks++;
  if (data.description.trim()) {
    if (data.description.length >= 20) {
      basicInfoItems.push({
        id: 'description',
        label: 'Description is detailed',
        status: 'success'
      });
      passedChecks++;
    } else {
      basicInfoItems.push({
        id: 'description',
        label: 'Description should be more detailed (20+ characters)',
        status: 'warning',
        message: `Current length: ${data.description.length} characters`
      });
    }
  } else {
    basicInfoItems.push({
      id: 'description',
      label: 'Description is required',
      status: 'error'
    });
  }

  // Due date validation
  totalChecks++;
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dueDate > now) {
      if (daysDiff >= 1) {
        basicInfoItems.push({
          id: 'dueDate',
          label: `Due date is ${daysDiff} day(s) from now`,
          status: 'success'
        });
        passedChecks++;
      } else {
        basicInfoItems.push({
          id: 'dueDate',
          label: 'Due date is very soon (less than 24 hours)',
          status: 'warning'
        });
      }
    } else {
      basicInfoItems.push({
        id: 'dueDate',
        label: 'Due date must be in the future',
        status: 'error'
      });
    }
  } else {
    basicInfoItems.push({
      id: 'dueDate',
      label: 'Due date is required',
      status: 'error'
    });
  }

  sections.push({
    id: 'basic',
    title: 'Basic Information',
    items: basicInfoItems
  });

  // Grading Configuration Validation
  const gradingItems: ValidationItem[] = [];

  // Points validation
  totalChecks++;
  if (data.totalPoints > 0) {
    if (data.totalPoints >= 10 && data.totalPoints <= 1000) {
      gradingItems.push({
        id: 'points',
        label: `Total points: ${data.totalPoints}`,
        status: 'success'
      });
      passedChecks++;
    } else {
      gradingItems.push({
        id: 'points',
        label: 'Points should be between 10-1000',
        status: 'warning',
        message: `Current: ${data.totalPoints} points`
      });
    }
  } else {
    gradingItems.push({
      id: 'points',
      label: 'Total points must be greater than 0',
      status: 'error'
    });
  }

  // Rubric validation for standard assignments
  if (data.type === AssignmentType.STANDARD) {
    totalChecks++;
    if (data.rubric.length > 0) {
      const rubricTotal = data.rubric.reduce((sum, criterion) => sum + criterion.points, 0);
      const hasEmptyDescriptions = data.rubric.some(criterion => !criterion.description.trim());
      const hasZeroPoints = data.rubric.some(criterion => criterion.points <= 0);

      if (hasEmptyDescriptions) {
        gradingItems.push({
          id: 'rubric',
          label: 'Some rubric criteria need descriptions',
          status: 'error'
        });
      } else if (hasZeroPoints) {
        gradingItems.push({
          id: 'rubric',
          label: 'All rubric criteria must have points > 0',
          status: 'error'
        });
      } else if (Math.abs(rubricTotal - data.totalPoints) > 0.01) {
        gradingItems.push({
          id: 'rubric',
          label: `Rubric total (${rubricTotal}) doesn't match assignment points (${data.totalPoints})`,
          status: 'warning'
        });
      } else {
        gradingItems.push({
          id: 'rubric',
          label: `Rubric configured with ${data.rubric.length} criteria`,
          status: 'success'
        });
        passedChecks++;
      }
    } else {
      gradingItems.push({
        id: 'rubric',
        label: 'Consider adding a grading rubric',
        status: 'info'
      });
    }
  }

  // Quiz questions validation
  if (data.type === AssignmentType.QUIZ) {
    totalChecks++;
    if (data.questions.length > 0) {
      const questionsTotal = data.questions.reduce((sum, question) => sum + question.points, 0);
      const hasEmptyQuestions = data.questions.some(q => !q.questionText.trim());
      const hasInvalidAnswers = data.questions.some(q => {
        if (q.questionType === 'multiple-choice') {
          return !q.options || q.options.length < 2 || !q.correctAnswer;
        }
        return !q.correctAnswer;
      });

      if (hasEmptyQuestions) {
        gradingItems.push({
          id: 'questions',
          label: 'Some questions are missing text',
          status: 'error'
        });
      } else if (hasInvalidAnswers) {
        gradingItems.push({
          id: 'questions',
          label: 'Some questions have invalid answer configurations',
          status: 'error'
        });
      } else if (Math.abs(questionsTotal - data.totalPoints) > 0.01) {
        gradingItems.push({
          id: 'questions',
          label: `Question points (${questionsTotal}) don't match total (${data.totalPoints})`,
          status: 'warning'
        });
      } else {
        gradingItems.push({
          id: 'questions',
          label: `Quiz configured with ${data.questions.length} questions`,
          status: 'success'
        });
        passedChecks++;
      }
    } else {
      gradingItems.push({
        id: 'questions',
        label: 'Quiz must have at least one question',
        status: 'error'
      });
    }
  }

  sections.push({
    id: 'grading',
    title: 'Grading Configuration',
    items: gradingItems
  });

  // Additional Resources Validation
  const resourcesItems: ValidationItem[] = [];

  // External link validation
  if (data.externalLink) {
    totalChecks++;
    try {
      new URL(data.externalLink);
      resourcesItems.push({
        id: 'externalLink',
        label: 'External link is valid',
        status: 'success'
      });
      passedChecks++;
    } catch {
      resourcesItems.push({
        id: 'externalLink',
        label: 'External link is not a valid URL',
        status: 'error'
      });
    }
  }

  // Attachment validation
  if (data.attachmentFile) {
    totalChecks++;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (data.attachmentFile.size > maxSize) {
      resourcesItems.push({
        id: 'attachment',
        label: 'Attachment file is too large (max 10MB)',
        status: 'error',
        message: `Current size: ${(data.attachmentFile.size / 1024 / 1024).toFixed(1)}MB`
      });
    } else if (!allowedTypes.includes(data.attachmentFile.type)) {
      resourcesItems.push({
        id: 'attachment',
        label: 'Attachment file type not supported',
        status: 'warning',
        message: `Type: ${data.attachmentFile.type}`
      });
    } else {
      resourcesItems.push({
        id: 'attachment',
        label: `Attachment ready: ${data.attachmentFile.name}`,
        status: 'success'
      });
      passedChecks++;
    }
  }

  if (resourcesItems.length > 0) {
    sections.push({
      id: 'resources',
      title: 'Additional Resources',
      items: resourcesItems
    });
  }

  // Calculate overall progress
  const overallProgress = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
  
  // Determine if assignment is valid (no errors)
  const hasErrors = sections.some(section => 
    section.items.some(item => item.status === 'error')
  );

  return {
    sections,
    overallProgress,
    isValid: !hasErrors
  };
}

export function getValidationSummary(sections: ValidationSection[]): {
  totalItems: number;
  successItems: number;
  errorItems: number;
  warningItems: number;
  infoItems: number;
} {
  let totalItems = 0;
  let successItems = 0;
  let errorItems = 0;
  let warningItems = 0;
  let infoItems = 0;

  sections.forEach(section => {
    section.items.forEach(item => {
      totalItems++;
      switch (item.status) {
        case 'success':
          successItems++;
          break;
        case 'error':
          errorItems++;
          break;
        case 'warning':
          warningItems++;
          break;
        case 'info':
          infoItems++;
          break;
      }
    });
  });

  return {
    totalItems,
    successItems,
    errorItems,
    warningItems,
    infoItems
  };
}