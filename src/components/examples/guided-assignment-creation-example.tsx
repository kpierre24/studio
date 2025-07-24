"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentCreationWizard, EditAssignmentButton } from '@/components/ui/assignment-creation-wizard';
import { ContentValidationChecker } from '@/components/ui/content-validation-checker';
import { validateAssignmentContent } from '@/lib/content-validation';
import { AssignmentType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function GuidedAssignmentCreationExample() {
  const [activeTab, setActiveTab] = useState('wizard');
  
  // Mock course data
  const mockCourse = {
    id: 'course-123',
    name: 'Introduction to Computer Science'
  };
  
  // Mock assignment data for demonstration
  const mockAssignment = {
    id: 'assignment-123',
    title: 'Final Project',
    description: 'Create a simple web application using the concepts learned in class.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    type: AssignmentType.STANDARD,
    totalPoints: 100,
    rubric: [
      { id: '1', description: 'Code Quality', points: 30 },
      { id: '2', description: 'Functionality', points: 40 },
      { id: '3', description: 'Documentation', points: 30 }
    ]
  };
  
  // Example validation data for the validation checker demo
  const exampleValidationData = {
    title: 'Midterm Essay',
    description: 'Write a 1000-word essay on the topic provided in class.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    type: AssignmentType.STANDARD,
    totalPoints: 50,
    rubric: [
      { id: '1', description: 'Content', points: 20 },
      { id: '2', description: 'Structure', points: 15 },
      { id: '3', description: '', points: 15 } // Missing description for validation error
    ],
    questions: [],
    externalLink: 'not-a-valid-url', // Invalid URL for validation error
    attachmentFile: null
  };
  
  const validationResult = validateAssignmentContent(exampleValidationData);
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Guided Assignment Creation</CardTitle>
          <CardDescription>
            Create assignments with step-by-step guidance, templates, and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="wizard">Creation Wizard</TabsTrigger>
              <TabsTrigger value="validation">Content Validation</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wizard" className="space-y-4">
              <div className="flex flex-col gap-4">
                <p>
                  The assignment creation wizard guides teachers through creating well-structured assignments
                  with templates, validation, and preview capabilities.
                </p>
                
                <div className="flex items-center gap-4">
                  <AssignmentCreationWizard
                    courseId={mockCourse.id}
                    courseName={mockCourse.name}
                    onSuccess={() => console.log('Assignment created successfully')}
                  />
                  
                  <EditAssignmentButton
                    courseId={mockCourse.id}
                    courseName={mockCourse.name}
                    assignment={mockAssignment}
                    onSuccess={() => console.log('Assignment updated successfully')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4">
              <p>
                Content validation ensures assignments are complete and well-structured before publishing.
                The validation system checks for required fields, proper formatting, and educational best practices.
              </p>
              
              <ContentValidationChecker
                sections={validationResult.sections}
                overallProgress={validationResult.overallProgress}
                onItemClick={(sectionId, itemId) => {
                  console.log(`Clicked on item ${itemId} in section ${sectionId}`);
                }}
              />
              
              <div className="flex items-center gap-2 mt-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm">
                  <strong>Success:</strong> Validation passed with {validationResult.overallProgress.toFixed(0)}% completion
                </span>
              </div>
              
              {validationResult.sections.some(section => 
                section.items.some(item => item.status === 'error')
              ) && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm">
                    <strong>Error:</strong> Some validation checks failed. Please review the issues above.
                  </span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <p>
                Assignment templates provide pre-configured settings for common assignment types,
                helping teachers create consistent and effective assignments quickly.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Essay Assignment</CardTitle>
                        <CardDescription>Traditional written assignment with rubric-based grading</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Pre-configured rubric with writing criteria</li>
                      <li>• Suggested duration: 1-2 weeks</li>
                      <li>• Default point value: 100 points</li>
                    </ul>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Knowledge Quiz</CardTitle>
                        <CardDescription>Multiple choice and short answer questions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Auto-graded question types</li>
                      <li>• Suggested duration: 30-45 minutes</li>
                      <li>• Default point value: 50 points</li>
                    </ul>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="bg-muted/40 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Implementation Details</h3>
        <p className="text-muted-foreground mb-4">
          The guided content creation workflow includes the following components:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>
              <strong>Step-by-step wizard</strong> - Guides users through template selection, basic info, settings, and preview
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>
              <strong>Content templates</strong> - Pre-configured assignment types with appropriate settings
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>
              <strong>Validation system</strong> - Checks for completeness and educational best practices
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>
              <strong>Preview functionality</strong> - Shows how the assignment will appear to students
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}