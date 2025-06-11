
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { BookOpen, Edit3, Users, ArrowLeft, FileText, CheckSquare, Clock, ExternalLink, ArrowRight, UploadCloud, Paperclip, DownloadCloud, Loader2, CheckCircle, AlertCircle, Send } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function StudentCourseDetailPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, handleStudentSubmissionUpload, handleStudentSubmitAssignment } = useAppContext();
  const { currentUser, courses, lessons, assignments, submissions, users, enrollments, isLoading } = state; 
  const { toast } = useToast();
  const pathname = usePathname(); // Get current pathname

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);


  useEffect(() => {
    const assignmentIdFromQuery = searchParams.get('assignment');
    if (assignmentIdFromQuery) {
      const assignmentToOpen = assignments.find(a => a.id === assignmentIdFromQuery && a.courseId === courseId);
      if (assignmentToOpen) {
        handleOpenSubmissionModal(assignmentToOpen);
      }
    }
  }, [searchParams, assignments, courseId]);


  if (!currentUser && !isLoading) { 
    router.push('/auth'); 
    return <p className="text-center text-muted-foreground">Redirecting...</p>;
  }
  if (isLoading && currentUser === undefined) { 
     return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }
  if (!currentUser) { 
    return <p className="text-center text-muted-foreground">Please log in to view this page.</p>;
  }


  const course = courses.find(c => c.id === courseId);
  const isEnrolled = enrollments && enrollments.some(e => e.studentId === currentUser.id && e.courseId === courseId);


  if (!course && !isLoading) { 
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Course Not Found</h2>
        <p className="text-muted-foreground">The course you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }
  if (!course && isLoading) {
    return <p className="text-center text-muted-foreground">Loading course details...</p>;
  }
  if (!isEnrolled && !isLoading) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You are not enrolled in this course.</p>
        <Button onClick={() => router.push('/student/courses')} className="mt-4">View My Courses</Button>
      </div>
    );
  }
  if (isLoading && (!course || isEnrolled === undefined)) {
    return <p className="text-center text-muted-foreground">Loading course content...</p>;
  }


  const courseLessons = lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const courseAssignments = assignments.filter(a => a.courseId === courseId).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const teacher = users.find(u => u.id === course?.teacherId); 

  const getStudentSubmission = (assignmentId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
  };

  const handleOpenSubmissionModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = getStudentSubmission(assignment.id);
    if (existingSubmission) {
        setSubmissionContent(existingSubmission.content || '');
    } else {
        setSubmissionContent('');
        setSubmissionFile(null);
    }
    setIsSubmissionModalOpen(true);
    // Clear query param to prevent re-opening if modal is closed and reopened
    const params = new URLSearchParams(searchParams.toString());
    params.delete('assignment');
    router.replace(`${pathname}?${params.toString()}`, {scroll: false});
  };
  

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    } else {
      setSubmissionFile(null);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !currentUser || !course) return;

    if (selectedAssignment.type === AssignmentType.STANDARD && !submissionContent.trim() && !submissionFile) {
        toast({ title: "Submission Error", description: "Please provide text content or upload a file.", variant: "destructive"});
        return;
    }
    setIsSubmittingFile(true); 

    let uploadedFileUrl: string | undefined;
    let uploadedFileName: string | undefined;

    if (submissionFile) {
        try {
            const { fileUrl, fileName } = await handleStudentSubmissionUpload(course.id, selectedAssignment.id, currentUser.id, submissionFile);
            uploadedFileUrl = fileUrl;
            uploadedFileName = fileName;
        } catch (error: any) {
            setIsSubmittingFile(false);
            return;
        }
    }

    const submissionPayload: Submission = {
      id: `temp-sub-${Date.now()}`, 
      assignmentId: selectedAssignment.id,
      studentId: currentUser.id,
      submittedAt: new Date().toISOString(), 
      content: submissionContent,
      fileUrl: uploadedFileUrl, 
      fileName: uploadedFileName,
    };
    
    await handleStudentSubmitAssignment(submissionPayload);
    
    setIsSubmittingFile(false);
    if(!state.error) { 
      setIsSubmissionModalOpen(false);
      setSubmissionFile(null); 
      setSubmissionContent('');
    }
  };

  const courseBannerSrc = course!.bannerImageUrl || `https://placehold.co/1200x400.png?text=${encodeURIComponent(course!.name)}`;

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6" disabled={isLoading}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <Card className="overflow-hidden shadow-lg">
        <div className="aspect-[16/9] md:aspect-[21/9] relative w-full">
          <Image
            src={courseBannerSrc}
            alt={course!.name}
            fill
            style={{objectFit:"cover"}}
            className="bg-muted"
            priority={course!.bannerImageUrl ? true : false} 
          />
        </div>
        <CardHeader className="pt-6">
          <CardTitle className="text-3xl font-headline">{course!.name}</CardTitle>
          <CardDescription className="text-lg">{course!.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Instructor: {teacher?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Category: {course!.category || "General"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{courseLessons.length} Lesson{courseLessons.length === 1 ? "" : "s"}</span>
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
              {isLoading && courseLessons.length === 0 && <p className="text-muted-foreground text-center py-4">Loading lessons...</p>}
              {!isLoading && courseLessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No lessons available for this course yet. Check back soon!</p>
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
                        <Button asChild size="sm" disabled={isLoading}>
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
              {isLoading && courseAssignments.length === 0 && <p className="text-muted-foreground text-center py-4">Loading assignments...</p>}
              {!isLoading && courseAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments posted for this course yet. Relax for now!</p>
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
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                                {isQuiz ? <CheckSquare className="h-4 w-4"/> : <Edit3 className="h-4 w-4"/>} 
                                {assignment.type} ({assignment.totalPoints} pts)
                                </p>
                                {existingSubmission && (
                                    existingSubmission.grade !== undefined ? (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                                        <CheckCircle className="mr-1 h-3 w-3"/>Graded: {existingSubmission.grade}/{assignment.totalPoints}
                                    </Badge>
                                    ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        <Send className="mr-1 h-3 w-3"/>Submitted
                                    </Badge>
                                    )
                                )}
                            </div>
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
                                <Button variant="outline" size="sm" asChild disabled={isLoading}>
                                    <a href={assignment.assignmentFileUrl} target="_blank" rel="noopener noreferrer" download={assignment.assignmentFileName}>
                                        <DownloadCloud className="mr-2 h-4 w-4" /> Download Attachment: {assignment.assignmentFileName}
                                    </a>
                                </Button>
                            </div>
                        )}
                        {assignment.externalLink && (
                            <div className="mt-2">
                                <Button variant="outline" size="sm" asChild className="w-full justify-start sm:w-auto" disabled={isLoading}>
                                    <a href={assignment.externalLink} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View External Resource
                                    </a>
                                </Button>
                            </div>
                        )}
                         <div className="mt-3 text-right">
                            <Button variant="outline" size="sm" onClick={() => handleOpenSubmissionModal(assignment)} disabled={isLoading}>
                              {existingSubmission ? (existingSubmission.grade !==undefined ? 'View Graded Submission' : 'View Submission') : (isQuiz ? 'Start Quiz' : 'Submit Assignment')}
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
                        <Button variant="outline" size="sm" asChild className="w-full justify-start" disabled={isLoading || isSubmittingFile}>
                            <a href={selectedAssignment.assignmentFileUrl} target="_blank" rel="noopener noreferrer" download={selectedAssignment.assignmentFileName}>
                                <DownloadCloud className="mr-2 h-4 w-4" /> Download Assignment File: {selectedAssignment.assignmentFileName}
                            </a>
                        </Button>
                    </div>
                )}
                {selectedAssignment.externalLink && (
                    <div className="mt-2">
                        <Button variant="outline" size="sm" asChild className="w-full justify-start" disabled={isLoading || isSubmittingFile}>
                            <a href={selectedAssignment.externalLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> View External Assignment Resource
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
                                {submission.feedback && <div className="space-y-1"><Label>Feedback:</Label><pre className="mt-1 p-3 text-sm bg-muted rounded-md whitespace-pre-wrap font-body">{submission.feedback}</pre></div>}
                                </>
                            ) : (
                                <p className="text-muted-foreground italic">Awaiting grading.</p>
                            )}
                             <DialogFooter>
                                <DialogClose asChild><Button variant="outline" disabled={isLoading || isSubmittingFile}>Close</Button></DialogClose>
                            </DialogFooter>
                        </div>
                        
                    );
                } else if (selectedAssignment.type === AssignmentType.STANDARD) {
                    return (
                        <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleSubmitAssignment(); }}>
                            <div>
                                <Label htmlFor="submissionContent">Your Response (Optional if uploading file)</Label>
                                <Textarea 
                                    id="submissionContent" value={submissionContent} 
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    placeholder="Type your response here..."
                                    rows={5} className="mt-1" disabled={isLoading || isSubmittingFile}
                                />
                            </div>
                            <div>
                                <Label htmlFor="submissionFile">Upload File (Optional if providing text response)</Label>
                                <Input 
                                    id="submissionFile" type="file" onChange={handleFileChange}
                                    className="mt-1" disabled={isLoading || isSubmittingFile}
                                />
                                {submissionFile && <p className="text-xs text-muted-foreground mt-1">Selected: {submissionFile.name}</p>}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline" disabled={isLoading || isSubmittingFile}>Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isLoading || isSubmittingFile}>
                                    {(isLoading || isSubmittingFile) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                    {(isLoading || isSubmittingFile) ? "Submitting..." : "Submit Assignment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    );
                } else if (selectedAssignment.type === AssignmentType.QUIZ) {
                    return <p className="py-4 text-muted-foreground">Quiz submissions are not yet implemented in this view. Please check back later.</p>;
                }
                return null; 
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

