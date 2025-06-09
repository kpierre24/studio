
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import type { Assignment, Submission, Course, Lesson } from "@/types";
import { ActionType, AssignmentType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Link from "next/link";
import { BookOpen, Edit3, Users, ArrowLeft, FileText, CheckSquare, Clock, ExternalLink, ArrowRight, UploadCloud, Paperclip, DownloadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StudentCourseDetailPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, handleStudentSubmissionUpload } = useAppContext();
  const { currentUser, courses, lessons, assignments, submissions, users, enrollments } = state; // Added enrollments
  const { toast } = useToast();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const assignmentIdFromQuery = searchParams.get('assignment');
    if (assignmentIdFromQuery) {
      const assignmentToOpen = assignments.find(a => a.id === assignmentIdFromQuery && a.courseId === courseId);
      if (assignmentToOpen) {
        handleOpenSubmissionModal(assignmentToOpen);
      }
    }
  }, [searchParams, assignments, courseId]);


  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  const course = courses.find(c => c.id === courseId);
  // Ensure enrollments is initialized before using .some
  const isEnrolled = enrollments && enrollments.some(e => e.studentId === currentUser.id && e.courseId === courseId);


  if (!course) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Course Not Found</h2>
        <p className="text-muted-foreground">The course you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You are not enrolled in this course.</p>
        <Button onClick={() => router.push('/student/courses')} className="mt-4">View My Courses</Button>
      </div>
    );
  }

  const courseLessons = lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const courseAssignments = assignments.filter(a => a.courseId === courseId).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const teacher = users.find(u => u.id === course.teacherId);

  const getStudentSubmission = (assignmentId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
  };

  const handleOpenSubmissionModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = getStudentSubmission(assignment.id);
    if (existingSubmission) {
        setSubmissionContent(existingSubmission.content || '');
        // Cannot pre-fill file input, but can show existing file info
    } else {
        setSubmissionContent('');
        setSubmissionFile(null);
    }
    setIsSubmissionModalOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    } else {
      setSubmissionFile(null);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !currentUser) return;

    if (selectedAssignment.type === AssignmentType.STANDARD && !submissionContent.trim() && !submissionFile) {
        toast({ title: "Submission Error", description: "Please provide text content or upload a file for your submission.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);

    let uploadedFileUrl: string | undefined;
    let uploadedFileName: string | undefined;

    if (submissionFile) {
        try {
            const { fileUrl, fileName } = await handleStudentSubmissionUpload(course.id, selectedAssignment.id, currentUser.id, submissionFile);
            uploadedFileUrl = fileUrl;
            uploadedFileName = fileName;
            toast({ title: "File Uploaded", description: `${fileName} ready for submission.`});
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message || "Could not upload your file.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
    }

    // Dispatch action with file URL and name if upload was successful
    dispatch({
      type: ActionType.SUBMIT_ASSIGNMENT,
      payload: { // This payload type needs to match the AppContext definition, expecting Submission type
        id: '', // Will be generated by reducer
        assignmentId: selectedAssignment.id,
        studentId: currentUser.id,
        submittedAt: '', // Will be generated by reducer
        content: submissionContent,
        fileUrl: uploadedFileUrl, 
        fileName: uploadedFileName,
      } as Submission 
    });
    setIsSubmitting(false);
    setIsSubmissionModalOpen(false);
    setSubmissionFile(null); 
    setSubmissionContent('');
  };

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
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
        <CardHeader className="pt-6">
          <CardTitle className="text-3xl font-headline">{course.name}</CardTitle>
          <CardDescription className="text-lg">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Instructor: {teacher?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Category: {course.category || "General"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{courseLessons.length} Lessons</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="lessons"><FileText className="mr-2" />Lessons ({courseLessons.length})</TabsTrigger>
          <TabsTrigger value="assignments"><Edit3 className="mr-2" />Assignments ({courseAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>Access all the learning materials for this course.</CardDescription>
            </CardHeader>
            <CardContent>
              {courseLessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No lessons available for this course yet.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {courseLessons.map((lesson, index) => (
                    <AccordionItem value={`lesson-${lesson.id}`} key={lesson.id}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center gap-3">
                           <span className="text-primary font-semibold">Module {index + 1}</span>
                           {lesson.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-3 bg-muted/30 rounded-md">
                        <p className="text-sm text-muted-foreground">{lesson.contentMarkdown.substring(0, 150)}{lesson.contentMarkdown.length > 150 ? "..." : ""}</p>
                        {lesson.videoUrl && <p className="text-xs text-blue-500 hover:underline"><ExternalLink className="inline mr-1 h-3 w-3" />Video available</p>}
                        <Button asChild size="sm">
                          <Link href={`/student/courses/${courseId}/lessons/${lesson.id}`}>
                            Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Assignments</CardTitle>
              <CardDescription>View and complete your assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              {courseAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments posted for this course yet.</p>
              ) : (
                <ul className="space-y-4">
                  {courseAssignments.map(assignment => {
                    const existingSubmission = getStudentSubmission(assignment.id);
                    const isQuiz = assignment.type === AssignmentType.QUIZ; 
                    return (
                      <li key={assignment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer" onClick={() => handleOpenSubmissionModal(assignment)}>
                                {assignment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                              {isQuiz ? <CheckSquare className="h-4 w-4"/> : <Edit3 className="h-4 w-4"/>} 
                              {assignment.type} ({assignment.totalPoints} pts)
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4"/> Due: {format(new Date(assignment.dueDate), "PPP p")}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-foreground/80">
                          {assignment.description.substring(0, 120)}{assignment.description.length > 120 ? "..." : ""}
                        </p>
                        {assignment.assignmentFileName && assignment.assignmentFileUrl && (
                            <div className="mt-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={assignment.assignmentFileUrl} target="_blank" rel="noopener noreferrer" download={assignment.assignmentFileName}>
                                        <DownloadCloud className="mr-2 h-4 w-4" /> Download Attachment: {assignment.assignmentFileName}
                                    </a>
                                </Button>
                            </div>
                        )}
                         <div className="mt-3 text-right">
                            <Button variant="outline" size="sm" onClick={() => handleOpenSubmissionModal(assignment)}>
                              {existingSubmission ? 'View Submission' : 'Submit Assignment'}
                            </Button>
                         </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Dialog */}
      {selectedAssignment && (
        <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedAssignment.title}</DialogTitle>
              <DialogDescription>
                Due: {format(new Date(selectedAssignment.dueDate), "PPP p")} - {selectedAssignment.totalPoints} points
              </DialogDescription>
              <p className="text-sm text-muted-foreground pt-2">{selectedAssignment.description}</p>
               {selectedAssignment.assignmentFileName && selectedAssignment.assignmentFileUrl && (
                    <div className="mt-2">
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <a href={selectedAssignment.assignmentFileUrl} target="_blank" rel="noopener noreferrer" download={selectedAssignment.assignmentFileName}>
                                <DownloadCloud className="mr-2 h-4 w-4" /> Download Assignment File: {selectedAssignment.assignmentFileName}
                            </a>
                        </Button>
                    </div>
                )}
            </DialogHeader>
            
            {(() => {
                const submission = getStudentSubmission(selectedAssignment.id);
                if (submission) {
                    return (
                        <div className="space-y-4 py-4">
                            <h4 className="font-semibold text-lg">Your Submission:</h4>
                            {submission.content && (
                                <div>
                                    <Label>Text Submission:</Label>
                                    <pre className="mt-1 p-3 text-sm bg-muted rounded-md whitespace-pre-wrap font-body">{submission.content}</pre>
                                </div>
                            )}
                            {submission.fileUrl && submission.fileName &&(
                                <div>
                                    <Label>Submitted File:</Label>
                                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                       <Paperclip className="h-4 w-4"/> {submission.fileName}
                                    </a>
                                </div>
                            )}
                            {submission.grade !== undefined ? (
                                <>
                                <p className="font-semibold">Grade: <span className="text-primary">{submission.grade} / {selectedAssignment.totalPoints}</span></p>
                                {submission.feedback && <p><strong>Feedback:</strong> {submission.feedback}</p>}
                                </>
                            ) : (
                                <p className="text-muted-foreground italic">Awaiting grading.</p>
                            )}
                             <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                            </DialogFooter>
                        </div>
                        
                    );
                } else if (selectedAssignment.type === AssignmentType.STANDARD) {
                    return (
                        <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleSubmitAssignment(); }}>
                            <div>
                                <Label htmlFor="submissionContent">Your Response (Optional)</Label>
                                <Textarea 
                                    id="submissionContent" 
                                    value={submissionContent} 
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    placeholder="Type your response here..."
                                    rows={5}
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="submissionFile">Upload File (Optional)</Label>
                                <Input 
                                    id="submissionFile" 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                                {submissionFile && <p className="text-xs text-muted-foreground mt-1">Selected: {submissionFile.name}</p>}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? "Submitting..." : "Submit Assignment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    );
                } else if (selectedAssignment.type === AssignmentType.QUIZ) {
                    return <p className="py-4 text-muted-foreground">Quiz submissions are not yet implemented in this view. Please check the specific quiz interface.</p>;
                }
                return null; 
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
