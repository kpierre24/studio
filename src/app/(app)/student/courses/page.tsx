
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, ArrowRight, Users } from "lucide-react";
import Image from "next/image";

export default function StudentCoursesPage() {
  const { state } = useAppContext();
  const { currentUser, courses, enrollments, users, isLoading } = state;

  if (isLoading && !currentUser) {
    return <p className="text-center text-muted-foreground py-10">Loading user data...</p>;
  }
  if (!currentUser) {
    return <p className="text-center text-muted-foreground py-10">Please log in to view your courses.</p>;
  }

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : "N/A";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        {!isLoading && (
            <p className="text-muted-foreground mt-1 md:mt-0">
            You are enrolled in {enrolledCourses.length} course{enrolledCourses.length === 1 ? "" : "s"}.
            </p>
        )}
      </div>
      
      {isLoading && enrolledCourses.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Loading your enrolled courses...</p>
      ) : !isLoading && enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Courses Yet!</p>
            <p className="text-muted-foreground">You are not currently enrolled in any courses. Explore the course catalog or contact an administrator for enrollment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map(course => {
            const courseImageSrc = course.bannerImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(course.name)}`;
            return (
              <Card key={course.id} className="flex flex-col overflow-hidden shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
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
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link href={`/student/courses/${course.id}`}>{course.name}</Link>
                  </CardTitle>
                  <CardDescription className="h-10 overflow-hidden text-ellipsis text-xs">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-2 space-y-0.5 text-sm">
                  <p className="text-muted-foreground text-xs flex items-center"><Users className="mr-1.5 h-3.5 w-3.5"/> Instructor: {getTeacherName(course.teacherId)}</p>
                  <p className="text-muted-foreground text-xs">Category: {course.category || "N/A"}</p>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full" disabled={isLoading}>
                    <Link href={`/student/courses/${course.id}`}>
                      <span className="flex items-center justify-center w-full">
                        View Course <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
