
"use client";

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, Lesson, Assignment, CreateLessonPayload, UpdateLessonPayload, CreateAssignmentPayload, UpdateAssignmentPayload, QuizQuestion, Submission } from '@/types';
import { ActionType, UserRole, AssignmentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, PlusCircle, Edit, Trash2, FileText, BookOpen, BotMessageSquare, UserSquare, UploadCloud, Eye, FileArchive, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizGenerator } from '@/components/features/QuizGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Form data types
interface LessonFormData extends Omit<CreateLessonPayload, 'courseId' | 'order' | 'fileUrl' | 'fileName'> {
  id?: string;
  order?: number;
  file?: File | null; // For handling file input
  fileName?: string;
  fileUrl?: string;
}

const initialLessonFormData: LessonFormData = { 
  title: '', 
  contentMarkdown: '', 
  videoUrl: '', 
  file: null, 
  fileName: '', 
  fileUrl: '' 
};


interface AssignmentFormData extends Omit<CreateAssignmentPayload, 'courseId' | 'rubric'> {
  id?: string;
  questions?: QuizQuestion[]; // Ensure questions are part of the form data
}
const initialAssignmentFormData: AssignmentFormData = { title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [] };

interface GradingFormData {
  submissionId: string;
  grade: string; // string for input, convert to number on save
  feedback: string;
}


export default function TeacherCourseDetailPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { currentUser, courses, lessons, assignments, submissions, users } = state;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>(initialLessonFormData);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentFormData>(initialAssignmentFormData);

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<Assignment | null>(null);
  const [gradingFormsData, setGradingFormsData] = useState<Record<string, GradingFormData>>({}); // submissionId -> GradingFormData


  useEffect(() => {
    const foundCourse = courses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      setCourseLessons(lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order));
      const relevantAssignments = assignments.filter(a => a.courseId === courseId).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setCourseAssignments(relevantAssignments);
    } else {
      toast({ title: "Error", description: "Course not found.", variant: "destructive" });
      router.push(currentUser?.role === UserRole.SUPER_ADMIN ? '/admin/courses' : '/teacher/courses');
    }
  }, [courseId, courses, lessons, assignments, router, toast, currentUser?.role]);

  // Authorization check
  if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return <p className="text-center text-muted-foreground">Access Denied.</p>;
  }
  if (currentUser.role === UserRole.TEACHER && course?.teacherId !== currentUser.id) {
    return <p className="text-center text-muted-foreground">You are not authorized to manage this course.</p>;
  }
  if (!course) {
    return <p className="text-center text-muted-foreground">Loading course data...</p>;
  }
  const teacher = users.find(u => u.id === course.teacherId);


  // Lesson Management
  const handleOpenLessonModal = (lesson?: Lesson) => {
    if (lesson) {
      setLessonFormData({ 
        id: lesson.id, 
        title: lesson.title, 
        contentMarkdown: lesson.contentMarkdown, 
        videoUrl: lesson.videoUrl, 
        order: lesson.order,
        fileName: lesson.fileName,
        fileUrl: lesson.fileUrl,
        file: null 
      });
    } else {
      const nextOrder = courseLessons.length > 0 ? Math.max(...courseLessons.map(l => l.order)) + 1 : 1;
      setLessonFormData({...initialLessonFormData, order: nextOrder });
    }
    setIsLessonModalOpen(true);
  };

  const handleLessonFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };

  const handleLessonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLessonFormData(prev => ({ ...prev, file: file, fileName: file.name }));
    } else {
      setLessonFormData(prev => ({ ...prev, file: null, fileName: lessonFormData.id ? prev.fileName : '' })); // Keep existing if editing and no new file
    }
  };

  const handleLessonSubmit = async () => {
    if (!lessonFormData.title) {
      toast({ title: "Validation Error", description: "Lesson title is required.", variant: "destructive" });
      return;
    }

    let fileUrl = lessonFormData.fileUrl; // Keep existing if not changed
    let fileName = lessonFormData.fileName;

    if (lessonFormData.file) {
      // Mock Firebase Storage upload
      fileName = lessonFormData.file.name;
      fileUrl = `simulated-storage/lessons/${course.id}/${fileName}`; // Placeholder
      toast({ title: "File Selected (Mock)", description: `${fileName} would be 'uploaded'. Actual upload requires Firebase setup.`});
    }


    const payload: CreateLessonPayload | UpdateLessonPayload = {
      courseId: course.id,
      title: lessonFormData.title,
      contentMarkdown: lessonFormData.contentMarkdown,
      videoUrl: lessonFormData.videoUrl,
      order: lessonFormData.order || 1,
      fileUrl: fileUrl,
      fileName: fileName,
      ...(lessonFormData.id && { id: lessonFormData.id }),
    };
    dispatch({ type: lessonFormData.id ? ActionType.UPDATE_LESSON : ActionType.CREATE_LESSON, payload });
    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = () => {
    if (lessonToDelete) {
      dispatch({ type: ActionType.DELETE_LESSON, payload: { id: lessonToDelete.id, courseId: course.id } });
      setLessonToDelete(null);
    }
  };
  
  // Assignment Management
  const handleOpenAssignmentModal = (assignment?: Assignment) => {
    if (assignment) {
      setAssignmentFormData({ 
        id: assignment.id, 
        title: assignment.title, 
        description: assignment.description, 
        dueDate: assignment.dueDate.split('T')[0], // Format for date input
        type: assignment.type,
        questions: assignment.questions || [],
        manualTotalPoints: assignment.type === AssignmentType.STANDARD ? assignment.totalPoints : undefined,
      });
    } else {
      setAssignmentFormData({...initialAssignmentFormData, questions: [] });
    }
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({ 
      ...prev, 
      [name]: name === 'manualTotalPoints' ? (value ? parseFloat(value) : undefined) : value 
    }));
  };
  
  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setAssignmentFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), ...newQuestions],
    }));
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentFormData.title || !assignmentFormData.dueDate) {
      toast({ title: "Validation Error", description: "Assignment title and due date are required.", variant: "destructive" });
      return;
    }
    const payload: CreateAssignmentPayload | UpdateAssignmentPayload = {
      courseId: course.id,
      title: assignmentFormData.title,
      description: assignmentFormData.description,
      dueDate: new Date(assignmentFormData.dueDate).toISOString(),
      type: assignmentFormData.type,
      questions: assignmentFormData.type === AssignmentType.QUIZ ? assignmentFormData.questions : undefined,
      manualTotalPoints: assignmentFormData.type === AssignmentType.STANDARD ? assignmentFormData.manualTotalPoints : undefined,
      ...(assignmentFormData.id && { id: assignmentFormData.id }),
    };
    dispatch({ type: assignmentFormData.id ? ActionType.UPDATE_ASSIGNMENT : ActionType.CREATE_ASSIGNMENT, payload: payload as any });
    setIsAssignmentModalOpen(false);
  };

  const handleDeleteAssignment = () => {
    if (assignmentToDelete) {
      dispatch({ type: ActionType.DELETE_ASSIGNMENT, payload: { id: assignmentToDelete.id, courseId: course.id } });
      setAssignmentToDelete(null);
    }
  };
  
  const getLessonContentForCourse = (): string => {
    return lessons.filter(l => l.courseId === course.id).map(l => `Lesson: ${l.title}\n${l.contentMarkdown}`).join('\n\n---\n\n');
  };

  // Grading Management
  const handleOpenGradingModal = (assignment: Assignment) => {
    setSelectedAssignmentForGrading(assignment);
    const initialFormsData: Record<string, GradingFormData> = {};
    submissions
      .filter(sub => sub.assignmentId === assignment.id)
      .forEach(sub => {
        initialFormsData[sub.id] = {
          submissionId: sub.id,
          grade: sub.grade?.toString() || '',
          feedback: sub.feedback || '',
        };
      });
    setGradingFormsData(initialFormsData);
    setIsGradingModalOpen(true);
  };

  const handleGradingFormChange = (submissionId: string, field: keyof Omit<GradingFormData, 'submissionId'>, value: string) => {
    setGradingFormsData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = (submissionId: string) => {
    const formData = gradingFormsData[submissionId];
    if (!formData) return;

    const grade = parseFloat(formData.grade);
    if (isNaN(grade)) {
      toast({ title: "Grading Error", description: "Please enter a valid number for the grade.", variant: "destructive" });
      return;
    }
    if (selectedAssignmentForGrading && (grade < 0 || grade > selectedAssignmentForGrading.totalPoints)) {
        toast({ title: "Grading Error", description: `Grade must be between 0 and ${selectedAssignmentForGrading.totalPoints}.`, variant: "destructive"});
        return;
    }

    dispatch({
      type: ActionType.GRADE_SUBMISSION,
      payload: {
        submissionId: submissionId,
        grade: grade,
        feedback: formData.feedback,
      }
    });
    // No need to close modal here, teacher might grade multiple submissions
  };

  const getAssignmentSubmissions = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course List
      </Button>

      <Card className="overflow-hidden shadow-lg">
         <div className="aspect-[16/9] md:aspect-[21/9] relative w-full">
          <Image
            src={`https://placehold.co/1200x400.png?text=${encodeURIComponent(course.name)}`}
            alt={course.name}
            fill
            style={{objectFit:"cover"}}
            className="bg-muted"
            data-ai-hint="course landscape banner"
          />
        </div>
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-headline">{course.name}</CardTitle>
          <CardDescription className="text-md">{course.description}</CardDescription>
           <div className="text-sm text-muted-foreground pt-2">
            <p>Instructor: {teacher?.name || 'N/A'}</p>
            <p>Category: {course.category || 'General'} | Cost: ${course.cost.toFixed(2)}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none border-b">
              <TabsTrigger value="lessons" className="rounded-none py-3"><FileText className="mr-2" />Lessons ({courseLessons.length})</TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-none py-3"><BookOpen className="mr-2" />Assignments ({courseAssignments.length})</TabsTrigger>
              <TabsTrigger value="students" className="rounded-none py-3"><UserSquare className="mr-2" />Students ({course.studentIds.length})</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none py-3">Settings</TabsTrigger>
            </TabsList>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Manage Lessons</h3>
                <Button onClick={() => handleOpenLessonModal()}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Lesson
                </Button>
              </div>
              {courseLessons.length === 0 ? (
                <p className="text-muted-foreground">No lessons yet. Add your first lesson!</p>
              ) : (
                <ul className="space-y-3">
                  {courseLessons.map(lesson => (
                    <li key={lesson.id} className="p-4 border rounded-md flex justify-between items-center hover:shadow-sm">
                      <div>
                        <h4 className="font-medium">{lesson.order}. {lesson.title}</h4>
                        <p className="text-xs text-muted-foreground truncate max-w-md">{lesson.contentMarkdown.substring(0,100)}...</p>
                        {lesson.fileName && <p className="text-xs text-blue-500"><FileText className="inline h-3 w-3 mr-1"/>{lesson.fileName}</p>}
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenLessonModal(lesson)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => setLessonToDelete(lesson)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Manage Assignments</h3>
                <Button onClick={() => handleOpenAssignmentModal()}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Assignment
                </Button>
              </div>
               {courseAssignments.length === 0 ? (
                <p className="text-muted-foreground">No assignments yet. Add your first assignment!</p>
              ) : (
                <ul className="space-y-3">
                  {courseAssignments.map(assignment => (
                    <li key={assignment.id} className="p-4 border rounded-md flex justify-between items-center hover:shadow-sm">
                      <div>
                        <h4 className="font-medium">{assignment.title} <Badge variant="secondary" className="capitalize">{assignment.type}</Badge></h4>
                        <p className="text-xs text-muted-foreground">Due: {format(new Date(assignment.dueDate), "PPP p")} - {assignment.totalPoints} pts</p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenGradingModal(assignment)} title="View Submissions & Grade">
                            <FileArchive className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignmentModal(assignment)} title="Edit Assignment"><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => setAssignmentToDelete(assignment)} title="Delete Assignment"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            
            <TabsContent value="students" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Enrolled Students</h3>
                {course.studentIds.length === 0 ? (
                    <p className="text-muted-foreground">No students are currently enrolled in this course.</p>
                ) : (
                    <ul className="space-y-2">
                    {course.studentIds.map(studentId => {
                        const student = users.find(u => u.id === studentId);
                        return student ? (
                        <li key={student.id} className="p-3 border rounded-md flex items-center gap-3">
                            <Image src={student.avatarUrl || `https://placehold.co/40x40.png?text=${student.name.substring(0,1)}`} alt={student.name} width={40} height={40} className="rounded-full" data-ai-hint="student avatar"/>
                            <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                        </li>
                        ) : null;
                    })}
                    </ul>
                )}
            </TabsContent>

            <TabsContent value="settings" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Course Settings</h3>
                <p className="text-muted-foreground">Course settings management (e.g., edit course details, prerequisites) would appear here. For now, use the main admin/teacher course list pages to edit general course info.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lesson Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{lessonFormData.id ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="lesson-title">Title</Label>
              <Input id="lesson-title" name="title" value={lessonFormData.title} onChange={handleLessonFormChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lesson-content">Content (Markdown)</Label>
              <Textarea id="lesson-content" name="contentMarkdown" value={lessonFormData.contentMarkdown} onChange={handleLessonFormChange} rows={6} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lesson-video">Video URL (Optional)</Label>
              <Input id="lesson-video" name="videoUrl" value={lessonFormData.videoUrl || ''} onChange={handleLessonFormChange} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="lesson-file">Associated File (Optional)</Label>
                <div className="flex items-center gap-2">
                    <Input id="lesson-file" type="file" onChange={handleLessonFileChange} className="flex-grow" />
                    {lessonFormData.fileName && <span className="text-sm text-muted-foreground truncate max-w-[150px]" title={lessonFormData.fileName}>{lessonFormData.fileName}</span>}
                </div>
                {lessonFormData.id && lessonFormData.fileUrl && !lessonFormData.file && (
                    <p className="text-xs text-muted-foreground">Current file: <a href={lessonFormData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{lessonFormData.fileName}</a>. Uploading a new file will replace it.</p>
                )}
                <p className="text-xs text-muted-foreground">Actual file upload to cloud storage requires Firebase setup.</p>
            </div>
             <div className="space-y-1">
              <Label htmlFor="lesson-order">Order</Label>
              <Input id="lesson-order" name="order" type="number" value={lessonFormData.order || 1} onChange={handleLessonFormChange} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleLessonSubmit}><UploadCloud className="mr-2 h-4 w-4" /> Save Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Delete Confirmation */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={(isOpen) => !isOpen && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Lesson?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete the lesson "{lessonToDelete?.title}"? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLessonToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Assignment Modal */}
        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
            <DialogContent className="sm:max-w-[625px] md:max-w-[750px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{assignmentFormData.id ? 'Edit Assignment' : 'Create New Assignment'} for {course.name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1 pr-6">
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
                              <option value={AssignmentType.STANDARD}>Standard (File Upload/Text)</option>
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
                                  assignmentId={assignmentFormData.id || `${course.id}-${Date.now()}`}
                                  onQuestionsGenerated={handleGeneratedQuestions}
                                  existingLessonContent={getLessonContentForCourse()}
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

      {/* Assignment Delete Confirmation */}
      <AlertDialog open={!!assignmentToDelete} onOpenChange={(isOpen) => !isOpen && setAssignmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete the assignment "{assignmentToDelete?.title}"? This will also delete all student submissions for it. This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssignmentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grading Modal */}
      {selectedAssignmentForGrading && (
        <Dialog open={isGradingModalOpen} onOpenChange={() => { setIsGradingModalOpen(false); setSelectedAssignmentForGrading(null); }}>
          <DialogContent className="sm:max-w-[700px] md:max-w-[850px]">
            <DialogHeader>
              <DialogTitle>Grade Submissions for: {selectedAssignmentForGrading.title}</DialogTitle>
              <DialogDescription>Total Points: {selectedAssignmentForGrading.totalPoints}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {getAssignmentSubmissions(selectedAssignmentForGrading.id).length === 0 ? (
                  <p className="text-muted-foreground text-center">No submissions yet for this assignment.</p>
                ) : (
                  getAssignmentSubmissions(selectedAssignmentForGrading.id).map(submission => {
                    const student = users.find(u => u.id === submission.studentId);
                    const formData = gradingFormsData[submission.id] || { submissionId: submission.id, grade: submission.grade?.toString() || '', feedback: submission.feedback || ''};
                    return (
                      <Card key={submission.id} className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Submission by: {student?.name || 'Unknown Student'}</span>
                            <Badge variant={submission.grade !== undefined ? "default" : "secondary"} className={submission.grade !== undefined ? "bg-green-500" : ""}>
                              {submission.grade !== undefined ? <CheckCircle className="mr-1 h-4 w-4"/> : <AlertCircle className="mr-1 h-4 w-4"/>}
                              {submission.grade !== undefined ? `Graded: ${submission.grade}/${selectedAssignmentForGrading.totalPoints}` : 'Pending Grade'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>Submitted on: {format(new Date(submission.submittedAt), "PPP p")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {submission.content && (
                            <div>
                              <Label className="font-semibold">Text Submission:</Label>
                              <pre className="mt-1 p-2 text-sm bg-background rounded-md whitespace-pre-wrap font-body border max-h-40 overflow-y-auto">{submission.content}</pre>
                            </div>
                          )}
                          {submission.fileUrl && (
                            <div>
                              <Label className="font-semibold">Submitted File:</Label>
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    <FileText className="h-4 w-4"/> {submission.fileName || 'View File'}
                                </a>
                                <p className="text-xs text-muted-foreground">(Note: File URL is mocked. Actual file download not implemented.)</p>
                            </div>
                          )}
                           {selectedAssignmentForGrading.type === AssignmentType.QUIZ && submission.quizAnswers && (
                             <div>
                               <Label className="font-semibold">Quiz Answers:</Label>
                               {/* TODO: Display quiz answers and auto-grades if applicable */}
                               <p className="text-xs text-muted-foreground">Quiz answer display and detailed grading for quizzes is pending implementation here.</p>
                             </div>
                           )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
                            <div className="space-y-1">
                              <Label htmlFor={`grade-${submission.id}`}>Grade ({selectedAssignmentForGrading.totalPoints} pts)</Label>
                              <Input 
                                id={`grade-${submission.id}`} 
                                type="number" 
                                value={formData.grade}
                                onChange={(e) => handleGradingFormChange(submission.id, 'grade', e.target.value)}
                                placeholder={`0-${selectedAssignmentForGrading.totalPoints}`}
                                max={selectedAssignmentForGrading.totalPoints}
                                min="0"
                                className="bg-input border-input-border"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                              <Textarea 
                                id={`feedback-${submission.id}`} 
                                value={formData.feedback}
                                onChange={(e) => handleGradingFormChange(submission.id, 'feedback', e.target.value)}
                                placeholder="Provide feedback to the student..."
                                rows={2}
                                className="bg-input border-input-border"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                          <Button size="sm" onClick={() => handleSaveGrade(submission.id)}>
                            <Send className="mr-2 h-4 w-4"/> Save Grade & Feedback
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
