
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function StudentCoursesPage() {
  const { state } = useAppContext();
  const { currentUser, courses, enrollments, users } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
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
        <p className="text-muted-foreground mt-1 md:mt-0">
          You are enrolled in {enrolledCourses.length} course{enrolledCourses.length === 1 ? "" : "s"}.
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No courses found.</p>
            <p className="text-muted-foreground">You are not currently enrolled in any courses.</p>
            {/* Optional: Add a link to a course catalog if one exists */}
            {/* <Button asChild className="mt-4"><Link href="/courses/catalog">Browse Courses</Link></Button> */}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map(course => (
            <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                 <div className="aspect-[16/9] relative mb-4 rounded-t-md overflow-hidden">
                    <Image 
                        src={`https://placehold.co/600x400.png?text=${encodeURIComponent(course.name)}`} 
                        alt={course.name} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="course banner"
                    />
                 </div>
                <CardTitle className="text-xl hover:text-primary transition-colors">
                  <Link href={`/student/courses/${course.id}`}>{course.name}</Link>
                </CardTitle>
                <CardDescription className="h-10 overflow-hidden text-ellipsis">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className="text-sm text-muted-foreground">Instructor: {getTeacherName(course.teacherId)}</p>
                <p className="text-sm text-muted-foreground">Category: {course.category || "N/A"}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/student/courses/${course.id}`}>
                    View Course <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
