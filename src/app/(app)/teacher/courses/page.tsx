
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, QuizQuestion } from '@/types';
import { ActionType, AssignmentType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Edit, BookOpen, Trash2, Users, BotMessageSquare } from 'lucide-react'; // Changed Bot to BotMessageSquare
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuizGenerator } from '@/components/features/QuizGenerator';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation'; // For query params
import { ScrollArea } from '@/components/ui/scroll-area';

interface CourseFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  cost: number;
}

interface AssignmentFormData {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  questions?: QuizQuestion[];
  manualTotalPoints?: number;
}


export default function TeacherCoursesPage() {
  const { state, dispatch } = useAppContext();
  const { currentUser, courses, lessons } = state; // Added lessons for QuizGenerator context
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [currentCourseForAssignment, setCurrentCourseForAssignment] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({ name: '', description: '', category: '', cost: 0 });
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentFormData>({ courseId: '', title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [] });
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      handleOpenCourseModal();
      router.replace('/teacher/courses'); // Remove query param after opening
    }
  }, [searchParams, router]);


  if (!currentUser) return <p>Loading...</p>;

  const teacherCourses = courses.filter(course => course.teacherId === currentUser.id || currentUser.role === 'SuperAdmin');

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setCourseFormData({ id: course.id, name: course.name, description: course.description, category: course.category || '', cost: course.cost || 0 });
    } else {
      setCourseFormData({ name: '', description: '', category: '', cost: 0 });
    }
    setIsCourseModalOpen(true);
  };

  const handleCourseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) || 0 : value }));
  };

  const handleCourseSubmit = () => {
    if (!courseFormData.name || !courseFormData.description) {
        toast({ title: "Error", description: "Course name and description are required.", variant: "destructive"});
        return;
    }
    
    const payload: Course = {
        ...courseFormData,
        id: courseFormData.id || `course-${Date.now()}`,
        teacherId: currentUser.id,
        studentIds: courseFormData.id ? (courses.find(c => c.id === courseFormData.id)?.studentIds || []) : [],
    };
    
    dispatch({ type: courseFormData.id ? ActionType.UPDATE_COURSE : ActionType.CREATE_COURSE, payload });
    // Success toast is handled by context
    setIsCourseModalOpen(false);
  };

  const handleOpenAssignmentModal = (course: Course) => {
    setCurrentCourseForAssignment(course);
    setAssignmentFormData({ courseId: course.id, title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [] });
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({ ...prev, [name]: name === 'manualTotalPoints' ? parseFloat(value) || undefined : value }));
  };
  
  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setAssignmentFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), ...newQuestions],
    }));
  };
  
  const getLessonContentForCourse = (courseId: string): string => {
    return lessons.filter(l => l.courseId === courseId).map(l => l.contentMarkdown).join('\n\n---\n\n');
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentFormData.title || !assignmentFormData.dueDate) {
        toast({ title: "Error", description: "Assignment title and due date are required.", variant: "destructive"});
        return;
    }
    dispatch({ type: ActionType.CREATE_ASSIGNMENT, payload: assignmentFormData });
    // Success toast handled by context
    setIsAssignmentModalOpen(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    // In a real app, this would show a confirmation dialog then dispatch DELETE_COURSE
    toast({ title: "Mock Delete", description: `Course deletion initiated for ID: ${courseId}. (This is a mock action)`});
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenCourseModal()}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{courseFormData.id ? 'Edit Course' : 'Create New Course'}</DialogTitle>
              <DialogDescription>
                Fill in the details for your course. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={courseFormData.name} onChange={handleCourseFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={courseFormData.description} onChange={handleCourseFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={courseFormData.category} onChange={handleCourseFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Cost ($)</Label>
                <Input id="cost" name="cost" type="number" value={courseFormData.cost} onChange={handleCourseFormChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleCourseSubmit}>Save Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teacherCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No courses found.</p>
            <p className="text-muted-foreground">Get started by creating your first course.</p>
            <Button className="mt-4" onClick={() => handleOpenCourseModal()}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherCourses.map(course => (
            <Card key={course.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="hover:text-primary transition-colors">
                  <Link href={`/teacher/courses/${course.id}`}>{course.name}</Link>
                </CardTitle>
                <CardDescription className="h-10 overflow-hidden text-ellipsis">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-2 space-y-1 text-sm">
                <p className="text-muted-foreground">Category: {course.category || 'N/A'}</p>
                <div className="flex items-center text-muted-foreground">
                    <Users className="mr-1.5 h-4 w-4" /> Students: {course.studentIds.length}
                </div>
                <p className="text-muted-foreground">Cost: ${course.cost || 0}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2 pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Manage Course
                  </Link>
                </Button>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenCourseModal(course)} title="Edit Course" className="flex-1 justify-center">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Add Assignment" onClick={() => handleOpenAssignmentModal(course)} className="flex-1 justify-center">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-1 justify-center" title="Delete Course" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {currentCourseForAssignment && (
        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
            <DialogContent className="sm:max-w-[625px] md:max-w-[750px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Create New Assignment for {currentCourseForAssignment.name}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new assignment. You can use the AI Quiz Generator for quiz-type assignments.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1 pr-6"> {/* Added pr-6 for scrollbar */}
                  <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-title" className="text-right">Title</Label>
                          <Input id="assign-title" name="title" value={assignmentFormData.title} onChange={handleAssignmentFormChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-desc" className="text-right">Description</Label>
                          <Textarea id="assign-desc" name="description" value={assignmentFormData.description} onChange={handleAssignmentFormChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-due" className="text-right">Due Date</Label>
                          <Input id="assign-due" name="dueDate" type="date" value={assignmentFormData.dueDate} onChange={handleAssignmentFormChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-type" className="text-right">Type</Label>
                          <select id="assign-type" name="type" value={assignmentFormData.type} onChange={handleAssignmentFormChange} className="col-span-3 p-2 border rounded-md bg-input border-input-border">
                              <option value={AssignmentType.STANDARD}>Standard</option>
                              <option value={AssignmentType.QUIZ}>Quiz</option>
                          </select>
                      </div>

                      {assignmentFormData.type === AssignmentType.QUIZ && (
                          <div className="col-span-4 mt-4 p-4 border-t border-border">
                              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BotMessageSquare className="h-5 w-5 text-primary"/>AI Quiz Tools</h3>
                              {assignmentFormData.questions && assignmentFormData.questions.length > 0 && (
                                  <div className="mb-4">
                                    <Label>Currently Added Questions ({assignmentFormData.questions.length})</Label>
                                    <ScrollArea className="h-32 border rounded-md p-2 bg-muted/30 mt-1">
                                        <ul className="space-y-1">
                                        {assignmentFormData.questions.map((q, i) => (
                                            <li key={i} className="text-xs p-1.5 border rounded bg-card shadow-sm truncate" title={q.questionText}>{q.questionText} ({q.points} pts)</li>
                                        ))}
                                        </ul>
                                    </ScrollArea>
                                  </div>
                              )}
                              <QuizGenerator 
                                  assignmentId={`${currentCourseForAssignment.id}-${Date.now()}`} // Temporary unique ID for new assignment context
                                  onQuestionsGenerated={handleGeneratedQuestions}
                                  existingLessonContent={getLessonContentForCourse(currentCourseForAssignment.id)}
                              />
                          </div>
                      )}
                      {assignmentFormData.type === AssignmentType.STANDARD && (
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="assign-points" className="text-right">Total Points</Label>
                              <Input id="assign-points" name="manualTotalPoints" type="number" placeholder="e.g., 100" value={assignmentFormData.manualTotalPoints || ''} onChange={handleAssignmentFormChange} className="col-span-3" />
                          </div>
                      )}
                  </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" onClick={handleAssignmentSubmit}>Save Assignment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

