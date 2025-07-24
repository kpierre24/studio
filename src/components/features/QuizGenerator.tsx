"use client";

import { useState } from 'react';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import type { GenerateQuizQuestionsInput, GenerateQuizQuestionsOutput, QuizQuestion } from '@/types';
import { QuestionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

interface QuizGeneratorProps {
  assignmentId: string; // To link generated questions
  onQuestionsGenerated: (questions: QuizQuestion[]) => void;
  existingLessonContent?: string; // Optional: prefill from current lesson
}

export function QuizGenerator({ assignmentId, onQuestionsGenerated, existingLessonContent = "" }: QuizGeneratorProps) {
  const [lessonContent, setLessonContent] = useState(existingLessonContent);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedQuestions(null);

    if (!lessonContent.trim()) {
      setError("Lesson content cannot be empty.");
      setIsLoading(false);
      return;
    }
    if (numberOfQuestions < 1 || numberOfQuestions > 10) {
      setError("Number of questions must be between 1 and 10.");
      setIsLoading(false);
      return;
    }

    try {
      const input: GenerateQuizQuestionsInput = {
        lessonContent,
        numberOfQuestions,
      };
      const result: GenerateQuizQuestionsOutput = await generateQuizQuestions(input);
      
      // Adapt AI output to application's QuizQuestion type
      const adaptedQuestions: QuizQuestion[] = result.questions.map((q, index) => ({
        id: `ai-gen-${assignmentId}-${Date.now()}-${index}`, // Temporary ID
        assignmentId: assignmentId,
        questionText: q.questionText,
        // Assuming AI provides questionType implicitly or needs to be inferred.
        // For now, default to multiple-choice if options exist. This needs refinement.
        questionType: q.options && q.options.length > 0 ? QuestionType.MULTIPLE_CHOICE : QuestionType.SHORT_ANSWER, 
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 10, // Default points, teacher can adjust
      }));

      setGeneratedQuestions(adaptedQuestions);
      toast({
        title: "Quiz Questions Generated",
        description: `${adaptedQuestions.length} questions have been successfully generated. Review and add them to the assignment.`,
        variant: "default",
      });
    } catch (e: any) {
      console.error("Error generating quiz questions:", e);
      const errorMessage = e.message || "An unexpected error occurred while generating questions.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestions = () => {
    if (generatedQuestions) {
      onQuestionsGenerated(generatedQuestions);
      setGeneratedQuestions(null); // Clear after adding
      toast({
        title: "Questions Added",
        description: "The generated questions have been added to the assignment form.",
      });
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Quiz Question Generator
        </CardTitle>
        <CardDescription>
          Paste your lesson content below and let AI generate relevant multiple-choice questions for your quiz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lessonContent">Lesson Content</Label>
          <Textarea
            id="lessonContent"
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            placeholder="Paste the text from your lesson here..."
            rows={10}
            className="min-h-[150px] bg-input border-input-border"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfQuestions">Number of Questions (1-10)</Label>
          <Input
            id="numberOfQuestions"
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
            min="1"
            max="10"
            className="w-full md:w-1/4 bg-input border-input-border"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isLoading || !lessonContent.trim()} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>

        {generatedQuestions && generatedQuestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Questions (Review before adding)
            </h3>
            <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/30">
              <Accordion type="single" collapsible className="w-full">
                {generatedQuestions.map((q, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-medium text-left">Q{index + 1}: {q.questionText.substring(0, 80)}{q.questionText.length > 80 ? '...' : ''}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm bg-card p-3 rounded-md shadow">
                      <p><strong>Question:</strong> {q.questionText}</p>
                      {q.options && (
                        <div>
                          <strong>Options:</strong>
                          <ul className="list-disc list-inside pl-4">
                            {q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                      <p><strong>Points:</strong> {q.points} (Editable)</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
            <Button onClick={handleAddQuestions} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white">
              Add These Questions to Assignment
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          AI-generated content may require review and editing for accuracy and appropriateness.
        </p>
      </CardFooter>
    </Card>
  );
}
