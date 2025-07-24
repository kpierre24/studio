"use client";

import { useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ContentCreationData } from '@/components/ui/content-creation-wizard';
import { CreateAssignmentPayload, UpdateAssignmentPayload, AssignmentType } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseContentCreationWizardProps {
  courseId: string;
  onSuccess?: () => void;
}

export function useContentCreationWizard({ courseId, onSuccess }: UseContentCreationWizardProps) {
  const { handleCreateAssignment, handleUpdateAssignment, state } = useAppContext();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const openWizard = useCallback((assignment?: any) => {
    setEditingAssignment(assignment || null);
    setIsWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false);
    setEditingAssignment(null);
  }, []);

  const handleWizardComplete = useCallback(async (data: ContentCreationData) => {
    try {
      // Validate data
      if (!data.basicInfo.title || !data.basicInfo.description || !data.basicInfo.dueDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Calculate total points from rubric if available
      let totalPoints = data.settings.totalPoints;
      if (data.settings.rubric.length > 0) {
        const rubricTotal = data.settings.rubric.reduce((sum, criterion) => sum + criterion.points, 0);
        if (rubricTotal > 0) {
          totalPoints = rubricTotal;
        }
      }

      // Prepare base payload
      const basePayload = {
        courseId,
        title: data.basicInfo.title,
        description: data.basicInfo.description,
        dueDate: new Date(data.basicInfo.dueDate).toISOString(),
        type: data.basicInfo.type,
        externalLink: data.settings.externalLink || undefined,
        assignmentFile: data.settings.attachmentFile,
      };

      if (data.basicInfo.type === AssignmentType.QUIZ) {
        // For quiz assignments
        const quizPayload = {
          ...basePayload,
          questions: data.settings.questions,
        };

        if (editingAssignment) {
          const updatePayload: UpdateAssignmentPayload = {
            ...quizPayload,
            id: editingAssignment.id,
          };
          await handleUpdateAssignment(updatePayload);
        } else {
          const createPayload: CreateAssignmentPayload = quizPayload;
          await handleCreateAssignment(createPayload);
        }
      } else {
        // For standard assignments
        const standardPayload = {
          ...basePayload,
          manualTotalPoints: totalPoints,
          rubric: data.settings.rubric.length > 0 ? data.settings.rubric : undefined,
        };

        if (editingAssignment) {
          const updatePayload: UpdateAssignmentPayload = {
            ...standardPayload,
            id: editingAssignment.id,
          };
          await handleUpdateAssignment(updatePayload);
        } else {
          const createPayload: CreateAssignmentPayload = standardPayload;
          await handleCreateAssignment(createPayload);
        }
      }

      // Check for errors
      if (!state.error) {
        toast({
          title: "Success",
          description: `Assignment "${data.basicInfo.title}" ${editingAssignment ? 'updated' : 'created'} successfully.`,
        });
        closeWizard();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: state.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast({
        title: "Error",
        description: "Failed to save assignment. Please try again.",
        variant: "destructive"
      });
    }
  }, [courseId, editingAssignment, handleCreateAssignment, handleUpdateAssignment, state.error, closeWizard, onSuccess]);

  return {
    isWizardOpen,
    editingAssignment,
    openWizard,
    closeWizard,
    handleWizardComplete,
    isLoading: state.isLoading
  };
}