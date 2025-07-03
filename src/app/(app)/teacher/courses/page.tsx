
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, QuizQuestion } from '@/types';
import { ActionType, AssignmentType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Edit, BookOpen, Trash2, Users, BotMessageSquare, Loader2 } from 'lucide-react';
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
import { useSearchParams, useRouter } from 'next/navigation'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

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
  const { state, dispatch, handleCreateCourse, handleUpdateCourse, handleDeleteCourse, handleCreateAssignment } = useAppContext();
  const { currentUser, courses, lessons, isLoading } = state; 
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
      router.replace('/teacher/courses'); 
    }
  }, [searchParams, router]);


  if (!currentUser) return <p className="text-muted-foreground text-center py-10">Loading user data...</p>;

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

  const handleCourseSubmit = async () => {
    if (!courseFormData.name || !courseFormData.description) {
        toast({ title: "Error", description: "Course name and description are required.", variant: "destructive"});
        return;
    }
    
    const payload = {
        ...courseFormData,
        teacherId: currentUser.id,
        studentIds: courseFormData.id ? (courses.find(c => c.id === courseFormData.id)?.studentIds || []) : [],
    };
    
    if(courseFormData.id) {
        await handleUpdateCourse(payload as Course);
    } else {
        await handleCreateCourse(payload as Course);
    }

    if (!state.error) {
        setIsCourseModalOpen(false);
    }
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

  const handleAssignmentSubmit = async () => {
    if (!assignmentFormData.title || !assignmentFormData.dueDate || !currentCourseForAssignment) {
        toast({ title: "Error", description: "Assignment title and due date are required.", variant: "destructive"});
        return;
    }
    await handleCreateAssignment({ ...assignmentFormData, courseId: currentCourseForAssignment.id });
    
    if (!state.error) {
        setIsAssignmentModalOpen(false);
    }
  };

  const confirmDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    if (!courseToDelete) return;

    if (courseToDelete.studentIds.length > 0) {
        toast({
            title: "Cannot Delete Course",
            description: `Course "${courseToDelete.name}" has enrolled students. Please unenroll students before deleting.`,
            variant: "destructive"
        });
        return;
    }
    await handleDeleteCourse({ id: courseId });
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenCourseModal()} disabled={isLoading}>
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
                <Input id="name" name="name" value={courseFormData.name} onChange={handleCourseFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={courseFormData.description} onChange={handleCourseFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={courseFormData.category} onChange={handleCourseFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Cost ($)</Label>
                <Input id="cost" name="cost" type="number" value={courseFormData.cost} onChange={handleCourseFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleCourseSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && teacherCourses.length === 0 ? (
         <p className="text-muted-foreground text-center py-10">Loading your courses...</p>
      ) : teacherCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No courses found.</p>
            <p className="text-muted-foreground">Get started by creating your first course. Students will be able to enroll once it's published.</p>
            <Button className="mt-4" onClick={() => handleOpenCourseModal()} disabled={isLoading}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherCourses.map(course => {
            const courseImageSrc = course.bannerImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(course.name)}`;
            return (
            <Card key={course.id} className="flex flex-col shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="pb-0"> 
                 <div className="aspect-[16/9] relative mb-3 rounded-md overflow-hidden">
                    <Image 
                        src={courseImageSrc}
                        alt={course.name} 
                        fill
                        style={{objectFit:"cover"}}
                        priority={course.bannerImageUrl ? true : false}
                        data-ai-hint="course banner"
                    />
                </div>
                <CardTitle className="hover:text-primary transition-colors text-xl truncate" title={course.name}> 
                  <Link href={`/teacher/courses/${course.id}`}>{course.name}</Link>
                </CardTitle>
                <CardDescription className="h-10 overflow-hidden text-ellipsis text-xs">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-2 space-y-0.5 text-sm">
                <p className="text-muted-foreground text-xs">Category: {course.category || 'N/A'}</p>
                <div className="flex items-center text-muted-foreground text-xs">
                    <Users className="mr-1.5 h-3.5 w-3.5" /> Students: {course.studentIds.length}
                </div>
                <p className="text-muted-foreground text-xs">Cost: ${course.cost || 0}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2 pt-3"> 
                <Button variant="outline" size="sm" asChild disabled={isLoading}>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Manage Course
                  </Link>
                </Button>
                <div className="grid grid-cols-3 gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenCourseModal(course)} title="Edit Course Details" className="flex-1 justify-center px-1" disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Create New Assignment" onClick={() => handleOpenAssignmentModal(course)} className="flex-1 justify-center px-1" disabled={isLoading}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 flex-1 justify-center px-1" 
                        title="Delete Course" 
                        onClick={() => confirmDeleteCourse(course.id)} 
                        disabled={isLoading || course.studentIds.length > 0}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          )})}
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
                <ScrollArea className="max-h-[70vh] p-1 pr-6">
                  <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-title" className="text-right">Title</Label>
                          <Input id="assign-title" name="title" value={assignmentFormData.title} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-desc" className="text-right">Description</Label>
                          <Textarea id="assign-desc" name="description" value={assignmentFormData.description} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-due" className="text-right">Due Date</Label>
                          <Input id="assign-due" name="dueDate" type="date" value={assignmentFormData.dueDate} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-type" className="text-right">Type</Label>
                          <select id="assign-type" name="type" value={assignmentFormData.type} onChange={handleAssignmentFormChange} className="col-span-3 p-2 border rounded-md bg-input border-input-border" disabled={isLoading}>
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
                                  assignmentId={`${currentCourseForAssignment.id}-${Date.now()}`} 
                                  onQuestionsGenerated={handleGeneratedQuestions}
                                  existingLessonContent={getLessonContentForCourse(currentCourseForAssignment.id)}
                              />
                          </div>
                      )}
                      {assignmentFormData.type === AssignmentType.STANDARD && (
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="assign-points" className="text-right">Total Points</Label>
                              <Input id="assign-points" name="manualTotalPoints" type="number" placeholder="e.g., 100" value={assignmentFormData.manualTotalPoints || ''} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                          </div>
                      )}
                  </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t">
                    <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                    <Button type="submit" onClick={handleAssignmentSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
