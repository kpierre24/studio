"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentCreationWizard } from '@/components/ui/content-creation-wizard';
import { useContentCreationWizard } from '@/hooks/useContentCreationWizard';
import { PlusCircle, FileText } from 'lucide-react';

interface AssignmentCreationWizardProps {
  courseId: string;
  courseName: string;
  onSuccess?: () => void;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonText?: string;
  className?: string;
}

export function AssignmentCreationWizard({
  courseId,
  courseName,
  onSuccess,
  buttonVariant = 'default',
  buttonSize = 'default',
  buttonText = 'Create Assignment',
  className = '',
}: AssignmentCreationWizardProps) {
  const {
    isWizardOpen,
    editingAssignment,
    openWizard,
    closeWizard,
    handleWizardComplete,
    isLoading
  } = useContentCreationWizard({ courseId, onSuccess });

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => openWizard()}
        className={className}
        disabled={isLoading}
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      <ContentCreationWizard
        courseId={courseId}
        courseName={courseName}
        existingAssignment={editingAssignment}
        onComplete={handleWizardComplete}
        onCancel={closeWizard}
        isOpen={isWizardOpen}
      />
    </>
  );
}

interface EditAssignmentButtonProps {
  courseId: string;
  courseName: string;
  assignment: any;
  onSuccess?: () => void;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonText?: string | null;
  className?: string;
  iconOnly?: boolean;
}

export function EditAssignmentButton({
  courseId,
  courseName,
  assignment,
  onSuccess,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  buttonText = 'Edit',
  className = '',
  iconOnly = false,
}: EditAssignmentButtonProps) {
  const {
    isWizardOpen,
    editingAssignment,
    openWizard,
    closeWizard,
    handleWizardComplete,
    isLoading
  } = useContentCreationWizard({ courseId, onSuccess });

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => openWizard(assignment)}
        className={className}
        disabled={isLoading}
        title="Edit Assignment"
      >
        <FileText className={`w-4 h-4 ${!iconOnly && buttonText ? 'mr-2' : ''}`} />
        {!iconOnly && buttonText}
      </Button>

      <ContentCreationWizard
        courseId={courseId}
        courseName={courseName}
        existingAssignment={editingAssignment}
        onComplete={handleWizardComplete}
        onCancel={closeWizard}
        isOpen={isWizardOpen}
      />
    </>
  );
}