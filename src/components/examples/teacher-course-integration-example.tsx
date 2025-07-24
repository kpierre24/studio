"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssignmentCreationWizard, EditAssignmentButton } from '@/components/ui/assignment-creation-wizard';
import { AssignmentType } from '@/types';
import { PlusCircle, FileText, Calendar, Users } from 'lucide-react';

export default function TeacherCourseIntegrationExample() {
  // Mock course data
  const mockCourse = {
    id: 'course-123',
    name: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming and computer science concepts.',
    studentIds: ['student1', 'student2', 'student3']
  };

  // Mock assignments data
  const mockAssignments = [
    {
      id: 'assignment-1',
      title: 'Hello World Program',
      description: 'Create your first program that prints "Hello, World!" to the console.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      type: AssignmentType.STANDARD,
      totalPoints: 25,
      rubric: [
        { id: '1', description: 'Code Functionality', points: 15 },
        { id: '2', description: 'Code Style', points: 10 }
      ]
    },
    {
      id: 'assignment-2',
      title: 'Variables and Data Types Quiz',
      description: 'Test your understanding of variables and data types in programming.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      type: AssignmentType.QUIZ,
      totalPoints: 50,
      questions: [
        {
          id: '1',
          questionText: 'What is a variable?',
          questionType: 'short-answer' as any,
          correctAnswer: 'A storage location with a name that holds data',
          points: 10
        }
      ]
    }
  ];

  const handleAssignmentSuccess = () => {
    console.log('Assignment created/updated successfully');
    // In real implementation, this would refresh the assignments list
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Course Management Integration</CardTitle>
          <CardDescription>
            Example of how the guided assignment creation wizard integrates with the existing teacher course page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Course Header */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <h1 className="text-2xl font-bold mb-2">{mockCourse.name}</h1>
            <p className="text-muted-foreground mb-4">{mockCourse.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{mockCourse.studentIds.length} students enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{mockAssignments.length} assignments</span>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assignments</h2>
              <AssignmentCreationWizard
                courseId={mockCourse.id}
                courseName={mockCourse.name}
                onSuccess={handleAssignmentSuccess}
                buttonText="Create New Assignment"
              />
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              {mockAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <EditAssignmentButton
                          courseId={mockCourse.id}
                          courseName={mockCourse.name}
                          assignment={assignment}
                          onSuccess={handleAssignmentSuccess}
                          iconOnly
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{assignment.type === AssignmentType.QUIZ ? 'Quiz' : 'Assignment'}</span>
                        </div>
                      </div>
                      <div className="font-medium">
                        {assignment.totalPoints} points
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockAssignments.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Create your first assignment to get started with course content.
                  </p>
                  <AssignmentCreationWizard
                    courseId={mockCourse.id}
                    courseName={mockCourse.name}
                    onSuccess={handleAssignmentSuccess}
                    buttonText="Create First Assignment"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <div className="bg-muted/40 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Integration Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">For Teachers</h4>
            <ul className="text-sm space-y-1">
              <li>• Guided step-by-step assignment creation</li>
              <li>• Pre-configured templates for common assignment types</li>
              <li>• Built-in validation to ensure quality</li>
              <li>• Preview functionality before publishing</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">For Students</h4>
            <ul className="text-sm space-y-1">
              <li>• Clear, well-structured assignment instructions</li>
              <li>• Consistent formatting and expectations</li>
              <li>• Transparent grading criteria</li>
              <li>• Better understanding of requirements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Wizard Integration</h4>
              <p className="text-muted-foreground">
                The wizard can be easily integrated into existing pages by replacing the current assignment creation modal 
                with the <code className="bg-muted px-1 rounded">AssignmentCreationWizard</code> component.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Flow</h4>
              <p className="text-muted-foreground">
                The wizard uses the existing <code className="bg-muted px-1 rounded">useAppContext</code> hook and 
                <code className="bg-muted px-1 rounded">handleCreateAssignment</code> / 
                <code className="bg-muted px-1 rounded">handleUpdateAssignment</code> functions, ensuring compatibility 
                with the current data management system.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Validation</h4>
              <p className="text-muted-foreground">
                Content validation runs in real-time and provides immediate feedback to help teachers create 
                high-quality assignments that follow educational best practices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}