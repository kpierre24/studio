
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, Video, Download } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function StudentLessonPage() {
  const { courseId, lessonId } = useParams() as { courseId: string; lessonId: string };
  const router = useRouter();
  const { state } = useAppContext();
  // Renamed isLoading to isAppContextLoading to avoid potential naming conflicts if local loading states are added
  const { currentUser, courses, lessons, enrollments, isLoading: isAppContextLoading } = state;

  // Broader loading check for initial app state
  if (isAppContextLoading && !currentUser) {
    return <p className="text-center text-muted-foreground py-10">Loading user data...</p>;
  }

  // User must be logged in
  if (!currentUser) {
    // This should ideally be caught by ProtectedLayout, but serves as a fallback.
    return <p className="text-center text-muted-foreground py-10">Please log in to view this lesson.</p>;
  }

  const course = courses.find(c => c.id === courseId);
  const lesson = lessons.find(l => l.id === lessonId && l.courseId === courseId);

  // If initial app data is still loading or course not found yet
  if (isAppContextLoading && !course) {
     return <p className="text-center text-muted-foreground py-10">Loading course information...</p>;
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Course Not Found</h2>
        <p className="text-muted-foreground">The course you are looking for (ID: {courseId}) does not exist or is not yet loaded.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }
  
  // If initial app data is still loading or lesson not found yet for this course
  if (isAppContextLoading && !lesson) {
     return <p className="text-center text-muted-foreground py-10">Loading lesson content for {course.name}...</p>;
  }

  if (!lesson) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Lesson Not Found</h2>
        <p className="text-muted-foreground">Lesson (ID: {lessonId}) in course "{course.name}" does not exist or is not yet loaded.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  const isEnrolled = enrollments.some(e => e.studentId === currentUser.id && e.courseId === courseId);

  if (!isEnrolled && !isAppContextLoading) { // Check isLoading here too
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You are not enrolled in this course to view this lesson.</p>
        <Button onClick={() => router.push(`/student/courses/${courseId}`)} className="mt-4">Back to Course</Button>
      </div>
    );
  }
  if (isAppContextLoading && !isEnrolled) {
    return <p className="text-center text-muted-foreground py-10">Verifying enrollment status...</p>;
  }


  const courseLessons = lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? courseLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < courseLessons.length - 1 ? courseLessons[currentLessonIndex + 1] : null;

  const renderMarkdown = (markdown: string) => {
    if (!markdown) return null;
    const html = markdown
      .split('\n\n') 
      .map(paragraph => {
        if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
          const listItems = paragraph.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
          return `<ul>${listItems}</ul>`;
        }
        if (paragraph.match(/^\d+\.\s/)) {
           const listItems = paragraph.split('\n').map(item => `<li>${item.replace(/^\d+\.\s/, '')}</li>`).join('');
           return `<ol>${listItems}</ol>`;
        }
        if (paragraph.startsWith('#')) {
          let level = 0;
          while (paragraph[level] === '#') {
            level++;
          }
          const title = paragraph.substring(level).trim();
          if (level > 0 && level <= 6) {
            return `<h${level}>${title}</h${level}>`;
          }
        }
        return `<p>${paragraph.replace(/\n/g, '<br />')}</p>`; 
      })
      .join('');
    return { __html: html };
  };


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push(`/student/courses/${courseId}`)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {course.name}
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            {lesson.title}
          </CardTitle>
          <CardDescription>Lesson {lesson.order} of {courseLessons.length} in <Link href={`/student/courses/${courseId}`} className="text-primary hover:underline">{course.name}</Link></CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {lesson.videoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md">
              <div className="aspect-video bg-muted flex items-center justify-center">
                 <iframe
                    width="100%"
                    height="100%"
                    src={lesson.videoUrl.replace("watch?v=", "embed/")}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  ></iframe>
              </div>
              <p className="text-xs text-center p-2 bg-muted/50 text-muted-foreground">
                <Video className="inline h-4 w-4 mr-1" /> If the video doesn't load, you can try <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">opening it directly</a>.
              </p>
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={renderMarkdown(lesson.contentMarkdown)}
          />

          {lesson.fileUrl && (
            <div className="mt-6 p-4 border rounded-md bg-muted/30">
              <h4 className="font-semibold mb-2 text-md">Associated File:</h4>
              <Button variant="outline" asChild>
                <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer" download={lesson.fileName || true}>
                  <Download className="mr-2 h-4 w-4" /> Download {lesson.fileName || 'File'}
                </a>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Note: File downloads depend on correct Firebase Storage setup by the administrator.</p>
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between items-center pt-6">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link href={`/student/courses/${courseId}/lessons/${prevLesson.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson
              </Link>
            </Button>
          ) : <div />} {/* Placeholder for layout */}
          
          {nextLesson ? (
            <Button asChild>
              <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>
                Next Lesson <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled>End of Course Lessons</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

