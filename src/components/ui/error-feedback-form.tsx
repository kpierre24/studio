"use client";

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitErrorFeedback } from '@/lib/error-reporting';
import { useToast } from '@/hooks/use-toast';

interface ErrorFeedbackFormProps {
  errorId: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export function ErrorFeedbackForm({ errorId, onClose, onSubmit }: ErrorFeedbackFormProps) {
  const [formData, setFormData] = useState({
    userDescription: '',
    reproductionSteps: '',
    expectedBehavior: '',
    actualBehavior: '',
    userEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what happened when the error occurred.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      submitErrorFeedback({
        errorId,
        ...formData,
      });

      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve! We'll look into this issue.",
      });

      onSubmit?.();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to submit feedback",
        description: "Please try again or contact support directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Help Us Fix This Issue</CardTitle>
              <CardDescription>
                Your feedback helps us understand and resolve the problem faster.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">
                What were you trying to do when this error occurred? *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what you were doing when the error happened..."
                value={formData.userDescription}
                onChange={(e) => handleInputChange('userDescription', e.target.value)}
                className="mt-1"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="steps">
                Steps to reproduce (if you know them)
              </Label>
              <Textarea
                id="steps"
                placeholder="1. I clicked on...&#10;2. Then I tried to...&#10;3. The error appeared when..."
                value={formData.reproductionSteps}
                onChange={(e) => handleInputChange('reproductionSteps', e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected">
                  What did you expect to happen?
                </Label>
                <Textarea
                  id="expected"
                  placeholder="I expected the page to load..."
                  value={formData.expectedBehavior}
                  onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="actual">
                  What actually happened?
                </Label>
                <Textarea
                  id="actual"
                  placeholder="Instead, I saw an error message..."
                  value={formData.actualBehavior}
                  onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">
                Email (optional - for follow-up)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.userEmail}
                onChange={(e) => handleInputChange('userEmail', e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll only use this to contact you about this specific issue.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick feedback component for inline use
interface QuickFeedbackProps {
  errorId: string;
  onSubmit?: () => void;
}

export function QuickFeedback({ errorId, onSubmit }: QuickFeedbackProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      submitErrorFeedback({
        errorId,
        userDescription: feedback,
      });

      setIsSubmitted(true);
      onSubmit?.();
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-sm text-muted-foreground">
        ✓ Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Tell us what happened (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="text-sm"
        rows={2}
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={isSubmitting || !feedback.trim()}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Send Feedback'}
      </Button>
    </form>
  );
}