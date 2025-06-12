
"use client";

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, Lesson, Assignment, CreateLessonPayload, UpdateLessonPayload, CreateAssignmentPayload, UpdateAssignmentPayload, QuizQuestion, Submission, GradeSubmissionPayload, DeleteLessonPayload, DeleteAssignmentPayload, Payment } from '@/types';
import { ActionType, UserRole, AssignmentType, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
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
import { ArrowLeft, PlusCircle, Edit, Trash2, FileText, BookOpen, BotMessageSquare, UserSquare, UploadCloud, Eye, FileArchive, CheckCircle, AlertCircle, Send, Paperclip, Loader2, Settings, ExternalLink, DollarSign, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizGenerator } from '@/components/features/QuizGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface LessonFormData extends Omit<CreateLessonPayload, 'courseId' | 'order' | 'fileUrl' | 'fileName'> {
  id?: string;
  order?: number;
  file?: File | null;
  fileName?: string;
  fileUrl?: string;
}
const initialLessonFormData: LessonFormData = { title: '', contentMarkdown: '', videoUrl: '', file: null, fileName: '', fileUrl: '' };

interface AssignmentFormData extends Omit<CreateAssignmentPayload, 'courseId' | 'rubric' | 'assignmentFileUrl' | 'assignmentFileName'> {
  id?: string;
  questions?: QuizQuestion[];
  manualTotalPoints?: number;
  assignmentFile?: File | null;
  assignmentFileName?: string;
  assignmentFileUrl?: string;
  externalLink?: string;
}
const initialAssignmentFormData: AssignmentFormData = { title: '', description: '', dueDate: '', type: AssignmentType.STANDARD, questions: [], assignmentFile: null, assignmentFileName: '', assignmentFileUrl: '', manualTotalPoints: 0, externalLink: '' };


interface GradingFormData {
  submissionId: string;
  grade: string;
  feedback: string;
}


export default function TeacherCourseDetailPage() {
  // Using useParams hook and destructuring to get specific route parameters.
  // This pattern is standard for client components and avoids enumerating the entire params object,
  // which can sometimes trigger Next.js warnings about dynamic APIs.
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const {
    state,
    handleLessonFileUpload,
    handleAssignmentAttachmentUpload,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleCreateAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleTeacherGradeSubmission,
  } = useAppContext();
  const { currentUser, courses, lessons, assignments, submissions, users, payments, isLoading } = state;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  
  const studentPaymentInfo = useMemo(() => {
    if (!course) return [];
    return course.studentIds.map(studentId => {
      const student = users.find(u => u.id === studentId);
      const studentPaymentsForCourse = payments.filter(p => p.studentId === studentId && p.courseId === course.id && p.status === PaymentStatus.PAID);
      const totalPaid = studentPaymentsForCourse.reduce((sum, p) => sum + p.amount, 0);
      const amountOwed = Math.max(0, (course.cost || 0) - totalPaid);
      let status: string;
      let statusVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";

      if ((course.cost || 0) === 0) {
        status = "Free Course";
        statusVariant = "outline";
      } else if (totalPaid >= (course.cost || 0)) {
        status = "Fully Paid";
        statusVariant = "default";
        if (totalPaid > (course.cost || 0)) status = "Overpaid";
      } else if (totalPaid > 0) {
        status = "Partially Paid";
        statusVariant = "secondary";
      } else {
        status = "Not Paid";
        statusVariant = "destructive";
      }
      
      return {
        studentId,
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "N/A",
        totalPaid,
        amountOwed,
        status,
        statusVariant,
      };
    });
  }, [course, users, payments]);

  const courseLessons = useMemo(() => lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order), [lessons, courseId]);
  const courseAssignments = useMemo(() => assignments.filter(a => a.courseId === courseId).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [assignments, courseId]);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>(initialLessonFormData);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentFormData>(initialAssignmentFormData);

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<Assignment | null>(null);
  const [gradingFormsData, setGradingFormsData] = useState<Record<string, GradingFormData>>({});


  useEffect(() => {
    const foundCourse = courses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    } else if (!isLoading) {
      toast({ title: "Error", description: "Course not found.", variant: "destructive" });
      router.push(currentUser?.role === UserRole.SUPER_ADMIN ? '/admin/courses' : '/teacher/courses');
    }
  }, [courseId, courses, router, toast, currentUser?.role, isLoading]);

  if (isLoading && !course) {
    return <p className="text-center text-muted-foreground py-10">Loading course data...</p>;
  }
  if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return <p className="text-center text-muted-foreground py-10">Access Denied: Required role missing.</p>;
  }
  if (!course) {
    return <p className="text-center text-muted-foreground py-10">Course not found. It might still be loading or does not exist.</p>;
  }
  if (currentUser.role === UserRole.TEACHER && course.teacherId !== currentUser.id) {
    return <p className="text-center text-muted-foreground py-10">Access Denied: You are not the teacher for this course.</p>;
  }
  const teacher = users.find(u => u.id === course.teacherId);

  const handleOpenLessonModal = (lesson?: Lesson) => {
    if (lesson) {
      setLessonFormData({
        id: lesson.id, title: lesson.title, contentMarkdown: lesson.contentMarkdown,
        videoUrl: lesson.videoUrl || '', order: lesson.order,
        fileName: lesson.fileName, fileUrl: lesson.fileUrl, file: null
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
      setLessonFormData(prev => ({ ...prev, file: file, fileName: file.name, fileUrl: undefined }));
    } else {
      setLessonFormData(prev => ({ ...prev, file: null }));
    }
  };

  const handleLessonSubmit = async () => {
    if (!lessonFormData.title) {
      toast({ title: "Validation Error", description: "Lesson title is required.", variant: "destructive" });
      return;
    }
    if (!course) return; 

    const payload: CreateLessonPayload | UpdateLessonPayload = {
      courseId: course.id, title: lessonFormData.title, contentMarkdown: lessonFormData.contentMarkdown,
      videoUrl: lessonFormData.videoUrl, order: lessonFormData.order || 1,
      fileUrl: lessonFormData.fileUrl, fileName: lessonFormData.fileName,
      ...(lessonFormData.id && { id: lessonFormData.id }),
    };

    if (lessonFormData.id) {
      await handleUpdateLesson({ ...payload as UpdateLessonPayload, file: lessonFormData.file });
    } else {
      await handleCreateLesson({ ...payload as CreateLessonPayload, file: lessonFormData.file });
    }

    if (!state.error) setIsLessonModalOpen(false);
  };

  const confirmDeleteLesson = async () => {
    if (lessonToDelete && course) {
      const payload: DeleteLessonPayload = { id: lessonToDelete.id, courseId: course.id };
      await handleDeleteLesson(payload);
      if (!state.error) setLessonToDelete(null);
    }
  };

  const handleOpenAssignmentModal = (assignment?: Assignment) => {
    if (assignment) {
      setAssignmentFormData({
        id: assignment.id, title: assignment.title, description: assignment.description,
        dueDate: assignment.dueDate ? format(new Date(assignment.dueDate), "yyyy-MM-dd'T'HH:mm") : '', 
        type: assignment.type, questions: assignment.questions || [],
        manualTotalPoints: assignment.type === AssignmentType.STANDARD ? assignment.totalPoints : assignment.manualTotalPoints, 
        assignmentFileUrl: assignment.assignmentFileUrl, assignmentFileName: assignment.assignmentFileName,
        externalLink: assignment.externalLink || '',
        assignmentFile: null,
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

  const handleAssignmentFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAssignmentFormData(prev => ({ ...prev, assignmentFile: file, assignmentFileName: file.name, assignmentFileUrl: undefined }));
    } else {
        setAssignmentFormData(prev => ({ ...prev, assignmentFile: null }));
    }
  };

  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setAssignmentFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), ...newQuestions],
    }));
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentFormData.title || !assignmentFormData.dueDate) {
      toast({ title: "Validation Error", description: "Assignment title and due date are required.", variant: "destructive" });
      return;
    }
    if (!course) return; 

    const payloadBase: any = {
      courseId: course.id, 
      title: assignmentFormData.title, 
      description: assignmentFormData.description,
      dueDate: new Date(assignmentFormData.dueDate).toISOString(), 
      type: assignmentFormData.type,
      assignmentFileUrl: assignmentFormData.assignmentFileUrl, 
      assignmentFileName: assignmentFormData.assignmentFileName,
      externalLink: assignmentFormData.externalLink || undefined,
    };
    
    if (assignmentFormData.type === AssignmentType.QUIZ) {
      payloadBase.questions = assignmentFormData.questions || [];
    } else {
      payloadBase.manualTotalPoints = assignmentFormData.manualTotalPoints;
      payloadBase.rubric = assignmentFormData.rubric || [];
    }
    

    if (assignmentFormData.id) {
        await handleUpdateAssignment({ ...payloadBase, id: assignmentFormData.id, assignmentFile: assignmentFormData.assignmentFile });
    } else {
        await handleCreateAssignment({ ...payloadBase, assignmentFile: assignmentFormData.assignmentFile });
    }

    if(!state.error) setIsAssignmentModalOpen(false);
  };

  const confirmDeleteAssignment = async () => {
    if (assignmentToDelete && course) {
      const payload: DeleteAssignmentPayload = { id: assignmentToDelete.id, courseId: course.id };
      await handleDeleteAssignment(payload);
      if (!state.error) setAssignmentToDelete(null);
    }
  };

  const getLessonContentForCourse = (): string => {
    if (!course) return "";
    return lessons.filter(l => l.courseId === course.id).map(l => `Lesson: ${l.title}\n${l.contentMarkdown}`).join('\n\n---\n\n');
  };

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

  const handleSaveGrade = async (submissionId: string) => {
    const formData = gradingFormsData[submissionId];
    if (!formData || !selectedAssignmentForGrading) return;

    const grade = parseFloat(formData.grade);
    if (isNaN(grade)) {
      toast({ title: "Grading Error", description: "Please enter a valid number for the grade.", variant: "destructive" });
      return;
    }
    if (grade < 0 || grade > selectedAssignmentForGrading.totalPoints) {
        toast({ title: "Grading Error", description: `Grade must be between 0 and ${selectedAssignmentForGrading.totalPoints}.`, variant: "destructive"});
        return;
    }

    const payload: GradeSubmissionPayload = { submissionId, grade, feedback: formData.feedback };
    await handleTeacherGradeSubmission(payload);
  };

  const getAssignmentSubmissions = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };

  const courseBannerSrc = course.bannerImageUrl || `https://placehold.co/1200x400.png?text=${encodeURIComponent(course.name)}`;


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course List
      </Button>

      <Card className="overflow-hidden shadow-lg">
         <div className="aspect-[16/9] md:aspect-[21/9] relative w-full">
          <Image
            src={courseBannerSrc}
            alt={course.name}
            fill
            style={{objectFit:"cover"}}
            className="bg-muted"
            priority={course.bannerImageUrl ? true : false}
            data-ai-hint="course banner"
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-none border-b">
              <TabsTrigger value="lessons" className="rounded-none py-3"><FileText className="mr-2" />Lessons ({courseLessons.length})</TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-none py-3"><BookOpen className="mr-2" />Assignments ({courseAssignments.length})</TabsTrigger>
              <TabsTrigger value="students" className="rounded-none py-3"><UserSquare className="mr-2" />Students ({course.studentIds.length})</TabsTrigger>
              <TabsTrigger value="attendance" asChild className="rounded-none py-3">
                <Link href={`/teacher/courses/${courseId}/attendance`}><CalendarCheck className="mr-2" />Attendance</Link>
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-none py-3"><DollarSign className="mr-2" />Payments</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none py-3"><Settings className="mr-2" />Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Manage Lessons</h3>
                <Button onClick={() => handleOpenLessonModal()} disabled={isLoading}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Lesson
                </Button>
              </div>
              {isLoading && courseLessons.length === 0 && <p className="text-muted-foreground text-center py-4">Loading lessons...</p>}
              {!isLoading && courseLessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No lessons created for this course yet. Click 'Add Lesson' to get started.</p>
              ) : (
                <ul className="space-y-3">
                  {courseLessons.map(lesson => (
                    <li key={lesson.id} className="p-4 border rounded-md flex justify-between items-center hover:bg-muted/50 hover:shadow-sm transition-all">
                      <div>
                        <h4 className="font-medium">{lesson.order}. {lesson.title}</h4>
                        <p className="text-xs text-muted-foreground truncate max-w-md">{lesson.contentMarkdown.substring(0,100)}...</p>
                        {lesson.fileName && <p className="text-xs text-blue-500"><FileText className="inline h-3 w-3 mr-1"/>{lesson.fileName}</p>}
                        {lesson.fileUrl && lesson.fileUrl.startsWith("simulated-storage/") && <Badge variant="outline" className="text-yellow-600 border-yellow-500 ml-2">Mock File</Badge>}
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenLessonModal(lesson)} disabled={isLoading}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog open={!!lessonToDelete && lessonToDelete.id === lesson.id} onOpenChange={(isOpen) => !isOpen && setLessonToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setLessonToDelete(lesson)} disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Lesson?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>
                              Are you sure you want to delete the lesson "{lessonToDelete?.title}"? This action cannot be undone.
                              <br/><strong className="text-destructive mt-2 block">Note:</strong> If this lesson has an associated file in Firebase Storage, it will not be automatically deleted and will need manual cleanup from the Storage console.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setLessonToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDeleteLesson} disabled={isLoading}>
                                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Manage Assignments</h3>
                <Button onClick={() => handleOpenAssignmentModal()} disabled={isLoading}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Assignment
                </Button>
              </div>
               {isLoading && courseAssignments.length === 0 && <p className="text-muted-foreground text-center py-4">Loading assignments...</p>}
               {!isLoading && courseAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments created for this course yet. Click 'Add Assignment' to get started.</p>
              ) : (
                <ul className="space-y-3">
                  {courseAssignments.map(assignment => (
                    <li key={assignment.id} className="p-4 border rounded-md flex justify-between items-center hover:bg-muted/50 hover:shadow-sm transition-all">
                      <div>
                        <h4 className="font-medium">{assignment.title} <Badge variant="secondary" className="capitalize">{assignment.type}</Badge></h4>
                        <p className="text-xs text-muted-foreground">Due: {format(new Date(assignment.dueDate), "PPP p")} - {assignment.totalPoints} pts</p>
                         {assignment.assignmentFileName && (
                           <a href={assignment.assignmentFileUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                <Paperclip className="h-3 w-3"/> {assignment.assignmentFileName}
                           </a>
                        )}
                        {assignment.externalLink && (
                            <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-xs ml-0 pl-0">
                              <a href={assignment.externalLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1 h-3 w-3" /> View External Link
                              </a>
                            </Button>
                          )}
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenGradingModal(assignment)} title="View Submissions & Grade" disabled={isLoading}>
                            <FileArchive className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignmentModal(assignment)} title="Edit Assignment" disabled={isLoading}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog open={!!assignmentToDelete && assignmentToDelete.id === assignment.id} onOpenChange={(isOpen) => !isOpen && setAssignmentToDelete(null)}>
                           <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setAssignmentToDelete(assignment)} title="Delete Assignment" disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>
                                Are you sure you want to delete the assignment "{assignmentToDelete?.title}"? This will also delete all student submissions for it from local state.
                                <br/><strong className="text-destructive mt-2 block">Note:</strong> The associated assignment file and any submitted files in Firebase Storage will not be automatically deleted and will need manual cleanup from the Storage console. This action cannot be undone.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAssignmentToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteAssignment} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="students" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Enrolled Students</h3>
                 {isLoading && course.studentIds.length === 0 && !users.some(u => course.studentIds.includes(u.id)) && <p className="text-muted-foreground text-center py-4">Loading student information...</p>}
                {!isLoading && course.studentIds.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No students are currently enrolled in this course.</p>
                ) : (
                    <ul className="space-y-2">
                    {course.studentIds.map(studentId => {
                        const student = users.find(u => u.id === studentId);
                        return student ? (
                        <li key={student.id} className="p-3 border rounded-md flex items-center gap-3 hover:bg-muted/50 transition-colors">
                            <Image src={student.avatarUrl || `https://placehold.co/40x40.png`} alt={student.name} width={40} height={40} className="rounded-full" data-ai-hint="student avatar"/>
                            <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                        </li>
                        ) : <li key={studentId} className="p-3 border rounded-md text-muted-foreground">Loading student data for ID: {studentId}...</li>;
                    })}
                    </ul>
                )}
            </TabsContent>
            
            {/* Attendance tab content is implicitly handled by navigating to the dedicated attendance page */}
            <TabsContent value="attendance" className="p-6">
                <p className="text-muted-foreground text-center">Attendance management is handled on a separate page. Click the 'Attendance' tab to navigate.</p>
            </TabsContent>


            <TabsContent value="payments" className="p-6">
              <h3 className="text-xl font-semibold mb-4">Student Payment Status</h3>
              {isLoading && studentPaymentInfo.length === 0 && course.studentIds.length > 0 ? (
                <p className="text-muted-foreground text-center py-4">Loading payment information...</p>
              ) : course.studentIds.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No students enrolled to display payment information.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Course Cost</TableHead>
                        <TableHead className="text-right">Total Paid</TableHead>
                        <TableHead className="text-right">Amount Owed</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentPaymentInfo.map(info => (
                        <TableRow key={info.studentId}>
                          <TableCell>{info.studentName}</TableCell>
                          <TableCell className="text-xs">{info.studentEmail}</TableCell>
                          <TableCell className="text-right">${course.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-green-600">${info.totalPaid.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-semibold ${info.amountOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${info.amountOwed.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={info.statusVariant} 
                                   className={info.statusVariant === 'default' ? "bg-green-500 hover:bg-green-600" : 
                                              info.statusVariant === 'destructive' ? "bg-red-500 text-destructive-foreground hover:bg-red-600" : ""}>
                                {info.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>


            <TabsContent value="settings" className="p-6">
                <h3 className="text-xl font-semibold mb-2">Course Settings</h3>
                {currentUser?.role === UserRole.SUPER_ADMIN ? (
                    <p className="text-muted-foreground">
                        As a Super Admin, you can edit core course details (name, description, teacher, cost, etc.) from the main {" "}
                        <Link href="/admin/courses" className="text-primary hover:underline">Manage All Courses page</Link>.
                        Find this course in the list and click 'Edit'.
                    </p>
                ) : (
                     <p className="text-muted-foreground">
                        Core course details such as name, description, assigned teacher, and cost are managed by administrators.
                        As a teacher, you can manage course content (lessons, assignments) and view enrolled students using the tabs above.
                    </p>
                )}
                 <p className="mt-4 text-sm text-muted-foreground">
                    Additional settings like enrollment management, prerequisites, and publishing status may be added here in the future.
                </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{lessonFormData.id ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="lesson-title">Title</Label>
              <Input id="lesson-title" name="title" value={lessonFormData.title} onChange={handleLessonFormChange} disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lesson-content">Content (Markdown)</Label>
              <Textarea id="lesson-content" name="contentMarkdown" value={lessonFormData.contentMarkdown} onChange={handleLessonFormChange} rows={6} disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lesson-video">Video URL (Optional)</Label>
              <Input id="lesson-video" name="videoUrl" value={lessonFormData.videoUrl || ''} onChange={handleLessonFormChange} disabled={isLoading}/>
            </div>
            <div className="space-y-1">
                <Label htmlFor="lesson-file">Associated File (Optional)</Label>
                {lessonFormData.id && lessonFormData.fileUrl?.startsWith("simulated-storage/") && (
                    <div className="p-2 my-1 text-xs bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
                        This lesson has a mock file: <span className="font-semibold">{lessonFormData.fileName}</span>. Please re-upload the actual file.
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Input id="lesson-file" type="file" onChange={handleLessonFileChange} className="flex-grow" disabled={isLoading} />
                </div>
                 {lessonFormData.fileName && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Current file:
                        {lessonFormData.fileUrl && !lessonFormData.fileUrl.startsWith("simulated-storage/") ?
                        <a href={lessonFormData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">{lessonFormData.fileName}</a> :
                        <span className="ml-1">{lessonFormData.fileName} {lessonFormData.fileUrl?.startsWith("simulated-storage/") ? "(Mock)" : "(New)"}</span>
                        }
                        {lessonFormData.id && lessonFormData.fileUrl && <Button variant="link" size="sm" className="p-0 h-auto ml-2 text-xs text-red-500" onClick={() => setLessonFormData(prev => ({...prev, file:null, fileName: undefined, fileUrl: undefined}))} disabled={isLoading}>Remove</Button>}
                    </p>
                )}
            </div>
             <div className="space-y-1">
              <Label htmlFor="lesson-order">Order</Label>
              <Input id="lesson-order" name="order" type="number" value={lessonFormData.order || 1} onChange={handleLessonFormChange} disabled={isLoading}/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
            <Button onClick={handleLessonSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? (lessonFormData.id ? "Saving..." : "Creating...") : (lessonFormData.id ? "Save Changes" : "Create Lesson") }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!lessonToDelete} onOpenChange={(isOpen) => !isOpen && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Lesson?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete the lesson "{lessonToDelete?.title}"? This action cannot be undone.
            <br/><strong className="text-destructive mt-2 block">Note:</strong> If this lesson has an associated file in Firebase Storage, it will not be automatically deleted and will need manual cleanup from the Storage console.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLessonToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLesson} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
            <DialogContent className="sm:max-w-[625px] md:max-w-[750px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{assignmentFormData.id ? 'Edit Assignment' : 'Create New Assignment'} for {course?.name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1 pr-6">
                  <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-title" className="text-right">Title</Label>
                          <Input id="assign-title" name="title" value={assignmentFormData.title} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-desc" className="text-right">Description</Label>
                          <Textarea id="assign-desc" name="description" value={assignmentFormData.description} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-due" className="text-right">Due Date & Time</Label>
                          <Input id="assign-due" name="dueDate" type="datetime-local" value={assignmentFormData.dueDate} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading}/>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-type" className="text-right">Type</Label>
                          <select id="assign-type" name="type" value={assignmentFormData.type} onChange={handleAssignmentFormChange} className="col-span-3 p-2 border rounded-md bg-input border-input-border" disabled={isLoading}>
                              <option value={AssignmentType.STANDARD}>Standard (File Upload/Text)</option>
                              <option value={AssignmentType.QUIZ}>Quiz</option>
                          </select>
                      </div>

                       <div className="grid grid-cols-4 items-start gap-4 pt-2">
                          <Label htmlFor="assignment-file" className="text-right col-span-1 pt-2">Attach File (Optional)</Label>
                          <div className="col-span-3 space-y-1">
                              <Input id="assignment-file" type="file" onChange={handleAssignmentFileChange} className="flex-grow" disabled={isLoading}/>
                              {assignmentFormData.id && assignmentFormData.assignmentFileUrl?.startsWith("simulated-storage/") && (
                                <div className="p-2 my-1 text-xs bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
                                    This assignment has a mock file: <span className="font-semibold">{assignmentFormData.assignmentFileName}</span>. Please re-upload the actual file.
                                </div>
                               )}
                              {assignmentFormData.assignmentFileName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                      Current file:
                                      {assignmentFormData.assignmentFileUrl && !assignmentFormData.assignmentFileUrl.startsWith("simulated-storage/") ?
                                      <a href={assignmentFormData.assignmentFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">{assignmentFormData.assignmentFileName}</a> :
                                      <span className="ml-1">{assignmentFormData.assignmentFileName} {assignmentFormData.assignmentFileUrl?.startsWith("simulated-storage/") ? "(Mock)" : "(New)"}</span>
                                      }
                                      {assignmentFormData.id && assignmentFormData.assignmentFileUrl && <Button variant="link" size="sm" className="p-0 h-auto ml-2 text-xs text-red-500" onClick={() => setAssignmentFormData(prev => ({...prev, assignmentFile:null, assignmentFileName: undefined, assignmentFileUrl: undefined}))} disabled={isLoading}>Remove</Button>}
                                  </p>
                              )}
                          </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assign-link" className="text-right">External Link (Optional)</Label>
                          <Input id="assign-link" name="externalLink" placeholder="https://example.com/resource" value={assignmentFormData.externalLink || ''} onChange={handleAssignmentFormChange} className="col-span-3" disabled={isLoading} />
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
                                  assignmentId={assignmentFormData.id || `${course?.id}-${Date.now()}`}
                                  onQuestionsGenerated={handleGeneratedQuestions}
                                  existingLessonContent={getLessonContentForCourse()}
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
                        {isLoading ? (assignmentFormData.id ? "Saving..." : "Creating...") : (assignmentFormData.id ? "Save Changes" : "Create Assignment")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      <AlertDialog open={!!assignmentToDelete} onOpenChange={(isOpen) => !isOpen && setAssignmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Assignment?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete the assignment "{assignmentToDelete?.title}"? This will also delete all student submissions for it from local state.
            <br/><strong className="text-destructive mt-2 block">Note:</strong> The associated assignment file and any submitted files in Firebase Storage will not be automatically deleted and will need manual cleanup from the Storage console. This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssignmentToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAssignment} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                          {submission.fileUrl && submission.fileName && (
                            <div>
                              <Label className="font-semibold">Submitted File:</Label>
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    <Paperclip className="h-4 w-4"/> {submission.fileName}
                                </a>
                            </div>
                          )}
                           {selectedAssignmentForGrading.type === AssignmentType.QUIZ && submission.quizAnswers && (
                             <div>
                               <Label className="font-semibold">Quiz Answers:</Label>
                               <p className="text-xs text-muted-foreground">Quiz answer display and detailed grading for quizzes is pending implementation here.</p>
                             </div>
                           )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
                            <div className="space-y-1">
                              <Label htmlFor={`grade-${submission.id}`}>Grade ({selectedAssignmentForGrading.totalPoints} pts)</Label>
                              <Input
                                id={`grade-${submission.id}`} type="number" value={formData.grade}
                                onChange={(e) => handleGradingFormChange(submission.id, 'grade', e.target.value)}
                                placeholder={`0-${selectedAssignmentForGrading.totalPoints}`}
                                max={selectedAssignmentForGrading.totalPoints} min="0"
                                className="bg-input border-input-border" disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                              <Textarea
                                id={`feedback-${submission.id}`} value={formData.feedback}
                                onChange={(e) => handleGradingFormChange(submission.id, 'feedback', e.target.value)}
                                placeholder="Provide feedback to the student..."
                                rows={2} className="bg-input border-input-border" disabled={isLoading}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                          <Button size="sm" onClick={() => handleSaveGrade(submission.id)} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <DialogClose asChild><Button variant="outline" disabled={isLoading}>Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

