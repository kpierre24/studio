"use client";

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, QuizQuestion } from '@/types'; // Added QuizQuestion
import { ActionType, AssignmentType } from '@/types'; // Added AssignmentType
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Edit, BookOpen, Trash2, Users, Bot } from 'lucide-react';
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
import { QuizGenerator } from '@/components/features/QuizGenerator'; // Import QuizGenerator
import { useToast } from '@/hooks/use-toast';

// Mock form state for creating/editing course
interface CourseFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  cost: number;
}

// Mock form state for creating assignment
interface AssignmentFormData {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  questions?: QuizQuestion[]; // Added for quiz type
  manualTotalPoints?: number;
}


export default function TeacherCoursesPage() {
  const { state, dispatch } = useAppContext();
  const { currentUser, courses } = state;
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null); // For editing or adding assignments to
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({ name: '', description: '', category: '', cost: 0 });
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentFormData>({ courseId: '', title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [] });
  const { toast } = useToast();

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
    setCourseFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) : value }));
  };

  const handleCourseSubmit = () => {
    // Basic validation
    if (!courseFormData.name || !courseFormData.description) {
        toast({ title: "Error", description: "Course name and description are required.", variant: "destructive"});
        return;
    }
    // In a real app, dispatch an action to create/update course
    // dispatch({ type: courseFormData.id ? ActionType.UPDATE_COURSE : ActionType.CREATE_COURSE, payload: {...courseFormData, teacherId: currentUser.id } });
    toast({ title: "Success", description: `Course "${courseFormData.name}" ${courseFormData.id ? 'updated' : 'created (mock)'}.` });
    setIsCourseModalOpen(false);
  };

  const handleOpenAssignmentModal = (course: Course) => {
    setCurrentCourse(course);
    setAssignmentFormData({ courseId: course.id, title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [] });
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({ ...prev, [name]: name === 'manualTotalPoints' ? parseFloat(value) : value }));
  };
  
  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setAssignmentFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), ...newQuestions],
    }));
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentFormData.title || !assignmentFormData.dueDate) {
        toast({ title: "Error", description: "Assignment title and due date are required.", variant: "destructive"});
        return;
    }
    dispatch({ type: ActionType.CREATE_ASSIGNMENT, payload: assignmentFormData });
    // toast({ title: "Success", description: `Assignment "${assignmentFormData.title}" created.` }); // Handled by context global message
    setIsAssignmentModalOpen(false);
  };


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
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="hover:text-primary transition-colors">
                  <Link href={`/teacher/courses/${course.id}`}>{course.name}</Link>
                </CardTitle>
                <CardDescription>{course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Category: {course.category || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Students: {course.studentIds.length}</p>
                <p className="text-sm text-muted-foreground">Cost: ${course.cost || 0}</p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Manage
                  </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenCourseModal(course)} title="Edit Course">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Add Assignment" onClick={() => handleOpenAssignmentModal(course)}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete Course">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {currentCourse && (
        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
            <DialogContent className="sm:max-w-[625px] md:max-w-[750px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Create New Assignment for {currentCourse.name}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new assignment.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto p-1">
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
                        <div className="col-span-4 mt-4 p-4 border-t">
                            <h3 className="text-lg font-semibold mb-2">Quiz Questions</h3>
                            {assignmentFormData.questions && assignmentFormData.questions.length > 0 && (
                                <ul className="space-y-2 mb-4">
                                {assignmentFormData.questions.map((q, i) => (
                                    <li key={i} className="text-sm p-2 border rounded bg-muted/50">{q.questionText} ({q.points} pts)</li>
                                ))}
                                </ul>
                            )}
                            <QuizGenerator 
                                assignmentId={currentCourse.id + "-new-assignment"} // Temporary
                                onQuestionsGenerated={handleGeneratedQuestions}
                            />
                        </div>
                    )}
                     {assignmentFormData.type === AssignmentType.STANDARD && (
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assign-points" className="text-right">Total Points</Label>
                            <Input id="assign-points" name="manualTotalPoints" type="number" value={assignmentFormData.manualTotalPoints || ''} onChange={handleAssignmentFormChange} className="col-span-3" />
                        </div>
                     )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" onClick={handleAssignmentSubmit}>Save Assignment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
