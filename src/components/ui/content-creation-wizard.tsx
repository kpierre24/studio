"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Settings, 
  Eye, 
  Send,
  Sparkles,
  BookOpen,
  ClipboardList,
  Target
} from 'lucide-react';
import { AssignmentType, QuizQuestion, RubricCriterion } from '@/types';
import { ContentValidationChecker } from '@/components/ui/content-validation-checker';
import { validateAssignmentContent } from '@/lib/content-validation';

// Types for the wizard
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: AssignmentType;
  icon: React.ComponentType<{ className?: string }>;
  defaultSettings: {
    estimatedDuration?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    suggestedPoints?: number;
    rubricTemplate?: RubricCriterion[];
    questionTypes?: string[];
  };
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  isValid: boolean;
  validationErrors: string[];
}

export interface ContentCreationData {
  template: ContentTemplate | null;
  basicInfo: {
    title: string;
    description: string;
    dueDate: string;
    type: AssignmentType;
  };
  settings: {
    totalPoints: number;
    rubric: RubricCriterion[];
    questions: QuizQuestion[];
    attachmentFile: File | null;
    externalLink: string;
  };
  validation: {
    hasRequiredFields: boolean;
    hasValidDueDate: boolean;
    hasValidPoints: boolean;
    hasContent: boolean;
  };
}

interface ContentCreationWizardProps {
  courseId: string;
  courseName: string;
  existingAssignment?: any; // For editing
  onComplete: (data: ContentCreationData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

// Predefined templates
const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'essay',
    name: 'Essay Assignment',
    description: 'Traditional written assignment with rubric-based grading',
    type: AssignmentType.STANDARD,
    icon: FileText,
    defaultSettings: {
      estimatedDuration: '1-2 weeks',
      difficulty: 'intermediate',
      suggestedPoints: 100,
      rubricTemplate: [
        { id: '1', description: 'Content and Ideas', points: 40 },
        { id: '2', description: 'Organization and Structure', points: 30 },
        { id: '3', description: 'Grammar and Style', points: 20 },
        { id: '4', description: 'Citations and References', points: 10 }
      ]
    }
  },
  {
    id: 'quiz',
    name: 'Knowledge Quiz',
    description: 'Multiple choice and short answer questions',
    type: AssignmentType.QUIZ,
    icon: ClipboardList,
    defaultSettings: {
      estimatedDuration: '30-45 minutes',
      difficulty: 'beginner',
      suggestedPoints: 50,
      questionTypes: ['multiple-choice', 'true-false', 'short-answer']
    }
  },
  {
    id: 'project',
    name: 'Project Assignment',
    description: 'Comprehensive project with multiple deliverables',
    type: AssignmentType.STANDARD,
    icon: Target,
    defaultSettings: {
      estimatedDuration: '2-4 weeks',
      difficulty: 'advanced',
      suggestedPoints: 200,
      rubricTemplate: [
        { id: '1', description: 'Research and Planning', points: 50 },
        { id: '2', description: 'Implementation/Execution', points: 80 },
        { id: '3', description: 'Presentation and Documentation', points: 40 },
        { id: '4', description: 'Innovation and Creativity', points: 30 }
      ]
    }
  },
  {
    id: 'discussion',
    name: 'Discussion Post',
    description: 'Reflective writing with peer interaction',
    type: AssignmentType.STANDARD,
    icon: BookOpen,
    defaultSettings: {
      estimatedDuration: '3-5 days',
      difficulty: 'beginner',
      suggestedPoints: 25,
      rubricTemplate: [
        { id: '1', description: 'Initial Post Quality', points: 15 },
        { id: '2', description: 'Peer Responses', points: 10 }
      ]
    }
  }
];

export function ContentCreationWizard({
  courseId,
  courseName,
  existingAssignment,
  onComplete,
  onCancel,
  isOpen
}: ContentCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ContentCreationData>({
    template: null,
    basicInfo: {
      title: '',
      description: '',
      dueDate: '',
      type: AssignmentType.STANDARD
    },
    settings: {
      totalPoints: 100,
      rubric: [],
      questions: [],
      attachmentFile: null,
      externalLink: ''
    },
    validation: {
      hasRequiredFields: false,
      hasValidDueDate: false,
      hasValidPoints: false,
      hasContent: false
    }
  });

  // Initialize data for editing
  useEffect(() => {
    if (existingAssignment) {
      setData(prev => ({
        ...prev,
        basicInfo: {
          title: existingAssignment.title || '',
          description: existingAssignment.description || '',
          dueDate: existingAssignment.dueDate ? new Date(existingAssignment.dueDate).toISOString().slice(0, 16) : '',
          type: existingAssignment.type || AssignmentType.STANDARD
        },
        settings: {
          totalPoints: existingAssignment.totalPoints || 100,
          rubric: existingAssignment.rubric || [],
          questions: existingAssignment.questions || [],
          attachmentFile: null,
          externalLink: existingAssignment.externalLink || ''
        }
      }));
    }
  }, [existingAssignment]);

  // Validation logic
  const validateCurrentStep = useCallback(() => {
    const validation = { ...data.validation };
    
    switch (currentStep) {
      case 0: // Template selection
        return data.template !== null;
      case 1: // Basic info
        validation.hasRequiredFields = !!(data.basicInfo.title && data.basicInfo.description);
        validation.hasValidDueDate = !!(data.basicInfo.dueDate && new Date(data.basicInfo.dueDate) > new Date());
        return validation.hasRequiredFields && validation.hasValidDueDate;
      case 2: // Settings
        validation.hasValidPoints = data.settings.totalPoints > 0;
        validation.hasContent = data.basicInfo.type === AssignmentType.QUIZ 
          ? data.settings.questions.length > 0
          : true;
        return validation.hasValidPoints && validation.hasContent;
      case 3: // Preview
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const steps: WizardStep[] = [
    {
      id: 'template',
      title: 'Choose Template',
      description: 'Select a template to get started quickly',
      icon: Sparkles,
      isComplete: currentStep > 0,
      isValid: data.template !== null,
      validationErrors: data.template ? [] : ['Please select a template']
    },
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Set title, description, and due date',
      icon: FileText,
      isComplete: currentStep > 1,
      isValid: !!(data.basicInfo.title && data.basicInfo.description && data.basicInfo.dueDate),
      validationErrors: [
        ...(!data.basicInfo.title ? ['Title is required'] : []),
        ...(!data.basicInfo.description ? ['Description is required'] : []),
        ...(!data.basicInfo.dueDate ? ['Due date is required'] : []),
        ...(data.basicInfo.dueDate && new Date(data.basicInfo.dueDate) <= new Date() ? ['Due date must be in the future'] : [])
      ]
    },
    {
      id: 'settings',
      title: 'Configure Settings',
      description: 'Set points, rubric, and content details',
      icon: Settings,
      isComplete: currentStep > 2,
      isValid: data.settings.totalPoints > 0 && (data.basicInfo.type !== AssignmentType.QUIZ || data.settings.questions.length > 0),
      validationErrors: [
        ...(data.settings.totalPoints <= 0 ? ['Total points must be greater than 0'] : []),
        ...(data.basicInfo.type === AssignmentType.QUIZ && data.settings.questions.length === 0 ? ['Quiz must have at least one question'] : [])
      ]
    },
    {
      id: 'preview',
      title: 'Preview & Publish',
      description: 'Review and publish your assignment',
      icon: Eye,
      isComplete: false,
      isValid: true,
      validationErrors: []
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error('Failed to create assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {existingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
              <p className="text-muted-foreground">for {courseName}</p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              ×
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <TemplateSelection
                  templates={CONTENT_TEMPLATES}
                  selectedTemplate={data.template}
                  onSelect={(template) => setData(prev => ({ 
                    ...prev, 
                    template,
                    basicInfo: { ...prev.basicInfo, type: template.type },
                    settings: { 
                      ...prev.settings, 
                      totalPoints: template.defaultSettings.suggestedPoints || 100,
                      rubric: template.defaultSettings.rubricTemplate || []
                    }
                  }))}
                />
              )}
              
              {currentStep === 1 && (
                <BasicInfoStep
                  data={data.basicInfo}
                  onChange={(basicInfo) => setData(prev => ({ ...prev, basicInfo }))}
                  validationErrors={currentStepData.validationErrors}
                />
              )}
              
              {currentStep === 2 && (
                <SettingsStep
                  data={data.settings}
                  assignmentType={data.basicInfo.type}
                  template={data.template}
                  onChange={(settings) => setData(prev => ({ ...prev, settings }))}
                  validationErrors={currentStepData.validationErrors}
                />
              )}
              
              {currentStep === 3 && (
                <PreviewStep
                  data={data}
                  courseName={courseName}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStepData.validationErrors.length > 0 && (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">
                  {currentStepData.validationErrors.length} issue(s) to resolve
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading || !validateCurrentStep()}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Assignment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Template Selection Component
interface TemplateSelectionProps {
  templates: ContentTemplate[];
  selectedTemplate: ContentTemplate | null;
  onSelect: (template: ContentTemplate) => void;
}

function TemplateSelection({ templates, selectedTemplate, onSelect }: TemplateSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
        <p className="text-muted-foreground">
          Select a template to get started with pre-configured settings and best practices.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(template)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <template.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{template.defaultSettings.estimatedDuration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="outline" className="capitalize">
                    {template.defaultSettings.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suggested Points:</span>
                  <span>{template.defaultSettings.suggestedPoints}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Basic Info Step Component
interface BasicInfoStepProps {
  data: ContentCreationData['basicInfo'];
  onChange: (data: ContentCreationData['basicInfo']) => void;
  validationErrors: string[];
}

function BasicInfoStep({ data, onChange, validationErrors }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
        <p className="text-muted-foreground">
          Provide the essential details for your assignment.
        </p>
      </div>
      
      {validationErrors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive mb-1">Please fix the following issues:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Assignment Title *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter a clear, descriptive title"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Provide detailed instructions and expectations"
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Due Date & Time *
          </label>
          <input
            type="datetime-local"
            value={data.dueDate}
            onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// Settings Step Component
interface SettingsStepProps {
  data: ContentCreationData['settings'];
  assignmentType: AssignmentType;
  template: ContentTemplate | null;
  onChange: (data: ContentCreationData['settings']) => void;
  validationErrors: string[];
}

function SettingsStep({ data, assignmentType, template, onChange, validationErrors }: SettingsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Configure Settings</h3>
        <p className="text-muted-foreground">
          Set up grading criteria and additional options.
        </p>
      </div>
      
      {validationErrors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive mb-1">Please fix the following issues:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Total Points *
          </label>
          <input
            type="number"
            value={data.totalPoints}
            onChange={(e) => onChange({ ...data, totalPoints: parseInt(e.target.value) || 0 })}
            min="1"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {assignmentType === AssignmentType.STANDARD && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Grading Rubric
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Define criteria for grading this assignment.
            </p>
            {data.rubric.length > 0 ? (
              <div className="space-y-2">
                {data.rubric.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={criterion.description}
                        onChange={(e) => {
                          const newRubric = [...data.rubric];
                          newRubric[index] = { ...criterion, description: e.target.value };
                          onChange({ ...data, rubric: newRubric });
                        }}
                        placeholder="Criterion description"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        value={criterion.points}
                        onChange={(e) => {
                          const newRubric = [...data.rubric];
                          newRubric[index] = { ...criterion, points: parseInt(e.target.value) || 0 };
                          onChange({ ...data, rubric: newRubric });
                        }}
                        placeholder="Points"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newRubric = data.rubric.filter((_, i) => i !== index);
                        onChange({ ...data, rubric: newRubric });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newCriterion: RubricCriterion = {
                      id: Date.now().toString(),
                      description: '',
                      points: 0
                    };
                    onChange({ ...data, rubric: [...data.rubric, newCriterion] });
                  }}
                >
                  Add Criterion
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  const defaultRubric = template?.defaultSettings.rubricTemplate || [
                    { id: '1', description: 'Content Quality', points: 50 },
                    { id: '2', description: 'Organization', points: 30 },
                    { id: '3', description: 'Presentation', points: 20 }
                  ];
                  onChange({ ...data, rubric: defaultRubric });
                }}
              >
                Add Grading Rubric
              </Button>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">
            External Link (Optional)
          </label>
          <input
            type="url"
            value={data.externalLink}
            onChange={(e) => onChange({ ...data, externalLink: e.target.value })}
            placeholder="https://example.com/resource"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Attachment (Optional)
          </label>
          <input
            type="file"
            onChange={(e) => onChange({ ...data, attachmentFile: e.target.files?.[0] || null })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {data.attachmentFile && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {data.attachmentFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Preview Step Component
interface PreviewStepProps {
  data: ContentCreationData;
  courseName: string;
}

function PreviewStep({ data, courseName }: PreviewStepProps) {
  const totalRubricPoints = data.settings.rubric.reduce((sum, criterion) => sum + criterion.points, 0);
  
  // Get validation results
  const validationData = {
    title: data.basicInfo.title,
    description: data.basicInfo.description,
    dueDate: data.basicInfo.dueDate,
    type: data.basicInfo.type,
    totalPoints: data.settings.totalPoints,
    rubric: data.settings.rubric,
    questions: data.settings.questions,
    externalLink: data.settings.externalLink,
    attachmentFile: data.settings.attachmentFile
  };
  
  const validation = validateAssignmentContent(validationData);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Preview & Publish</h3>
        <p className="text-muted-foreground">
          Review your assignment before publishing it to students.
        </p>
      </div>
      
      {/* Validation Checker */}
      <ContentValidationChecker
        sections={validation.sections}
        overallProgress={validation.overallProgress}
      />
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{data.basicInfo.title}</CardTitle>
              <CardDescription>
                {courseName} • Due: {new Date(data.basicInfo.dueDate).toLocaleDateString()} at {new Date(data.basicInfo.dueDate).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant={data.basicInfo.type === AssignmentType.QUIZ ? "secondary" : "default"}>
              {data.basicInfo.type === AssignmentType.QUIZ ? "Quiz" : "Assignment"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{data.basicInfo.description}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Total Points</h4>
              <p className="text-2xl font-bold text-primary">{data.settings.totalPoints}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Assignment Type</h4>
              <p className="capitalize">{data.basicInfo.type}</p>
            </div>
          </div>
          
          {data.settings.rubric.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Grading Rubric</h4>
                <div className="space-y-2">
                  {data.settings.rubric.map((criterion) => (
                    <div key={criterion.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{criterion.description}</span>
                      <Badge variant="outline">{criterion.points} pts</Badge>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 border-t font-medium">
                    <span>Total Rubric Points</span>
                    <span>{totalRubricPoints} pts</span>
                  </div>
                </div>
                {totalRubricPoints !== data.settings.totalPoints && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Rubric points ({totalRubricPoints}) don't match total points ({data.settings.totalPoints})
                  </p>
                )}
              </div>
            </>
          )}
          
          {data.settings.externalLink && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">External Resource</h4>
                <a 
                  href={data.settings.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {data.settings.externalLink}
                </a>
              </div>
            </>
          )}
          
          {data.settings.attachmentFile && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">Attachment</h4>
                <p className="text-muted-foreground">{data.settings.attachmentFile.name}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}