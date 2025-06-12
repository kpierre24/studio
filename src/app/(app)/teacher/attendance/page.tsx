
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, CalendarCheck, Users } from "lucide-react";
import Image from "next/image";

export default function TeacherAttendanceOverviewPage() {
  const { state } = useAppContext();
  const { currentUser, courses, isLoading } = state;

  if (isLoading && !currentUser) {
    return <p className="text-center text-muted-foreground py-10">Loading user data...</p>;
  }
  if (!currentUser) {
    return <p className="text-center text-muted-foreground py-10">Please log in to manage attendance.</p>;
  }

  const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <CalendarCheck className="h-8 w-8 text-primary" />
          Manage Attendance
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-0">
          Select a course to manage attendance for its sessions.
        </p>
      </div>
      {isLoading && teacherCourses.length === 0 ? (
         <p className="text-center text-muted-foreground py-10">Loading courses...</p>
      ) :
      teacherCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No courses assigned to you.</p>
            <p className="text-muted-foreground">You cannot manage attendance for any courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherCourses.map(course => {
            const courseImageSrc = course.bannerImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(course.name)}`;
            return (
              <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    <Link href={`/teacher/courses/${course.id}/attendance`}>{course.name}</Link>
                  </CardTitle>
                  <CardDescription className="h-10 overflow-hidden text-ellipsis text-xs">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-2 space-y-0.5 text-sm">
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.studentIds.length} student(s)</p>
                  <p className="text-muted-foreground text-xs">Category: {course.category || "N/A"}</p>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button asChild className="w-full" size="sm" disabled={isLoading}>
                    <Link href={`/teacher/courses/${course.id}/attendance`}>
                      <CalendarCheck className="mr-2 h-4 w-4" /> Take/View Attendance
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

