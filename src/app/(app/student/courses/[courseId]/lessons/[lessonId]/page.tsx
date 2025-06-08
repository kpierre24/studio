
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, Video } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function StudentLessonPage() {
  const { courseId, lessonId } = useParams() as { courseId: string; lessonId: string };
  const router = useRouter();
  const { state } = useAppContext();
  const { currentUser, courses, lessons, enrollments } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  const course = courses.find(c => c.id === courseId);
  const lesson = lessons.find(l => l.id === lessonId && l.courseId === courseId);
  const isEnrolled = enrollments.some(e => e.studentId === currentUser.id && e.courseId === courseId);

  if (!course || !lesson) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Lesson Not Found</h2>
        <p className="text-muted-foreground">The lesson you are looking for does not exist in this course.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  if (!isEnrolled) {
    // This check might be redundant if course detail page already prevents access
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You are not enrolled in this course to view this lesson.</p>
        <Button onClick={() => router.push(`/student/courses/${courseId}`)} className="mt-4">Back to Course</Button>
      </div>
    );
  }

  const courseLessons = lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? courseLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < courseLessons.length - 1 ? courseLessons[currentLessonIndex + 1] : null;

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
                {/* Basic placeholder for video, ideally use an iframe or video player component */}
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={lesson.videoUrl.replace("watch?v=", "embed/")} // Basic YouTube embed conversion
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
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {/* Using <pre> for now as react-markdown is not setup. For rich text, a markdown parser is needed. */}
            <pre className="whitespace-pre-wrap font-body text-base leading-relaxed bg-background p-4 rounded-md border border-input-border">
              {lesson.contentMarkdown}
            </pre>
          </div>

          {lesson.fileUrl && (
            <div className="mt-6">
              <Button variant="outline" asChild>
                <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" /> Download Associated File
                </a>
              </Button>
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
