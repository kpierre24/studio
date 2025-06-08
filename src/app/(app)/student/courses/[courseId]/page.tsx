
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { BookOpen, Edit3, Users, ArrowLeft, FileText, CheckSquare, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function StudentCourseDetailPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { state } = useAppContext();
  const { currentUser, courses, lessons, assignments, enrollments, users } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  const course = courses.find(c => c.id === courseId);
  const isEnrolled = enrollments.some(e => e.studentId === currentUser.id && e.courseId === courseId);

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
  const courseAssignments = assignments.filter(a => a.courseId === courseId);
  const teacher = users.find(u => u.id === course.teacherId);

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
            layout="fill"
            objectFit="cover"
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
                  {courseAssignments.map(assignment => (
                    <li key={assignment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-lg font-semibold hover:text-primary">
                            {/* TODO: Link to assignment detail/submission page */}
                            {/* <Link href={`/student/courses/${courseId}/assignments/${assignment.id}`}> */}
                              {assignment.title}
                            {/* </Link> */}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                            {assignment.type === "quiz" ? <CheckSquare className="h-4 w-4"/> : <Edit3 className="h-4 w-4"/>} 
                            {assignment.type}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4"/> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-foreground/80">
                        {assignment.description.substring(0, 120)}{assignment.description.length > 120 ? "..." : ""}
                      </p>
                       <div className="mt-3 text-right">
                          {/* TODO: Update button based on submission status */}
                          <Button variant="outline" size="sm" disabled>
                            {/* Link to assignment detail/submission page */}
                            View Assignment (Coming Soon)
                          </Button>
                       </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
