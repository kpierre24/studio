
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, CalendarCheck, Users } from "lucide-react";
import Image from "next/image";

export default function TeacherAttendanceOverviewPage() {
  const { state } = useAppContext();
  const { currentUser, courses } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
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

      {teacherCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No courses assigned to you.</p>
            <p className="text-muted-foreground">You cannot manage attendance for any courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherCourses.map(course => (
            <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                 <div className="aspect-[16/9] relative mb-4 rounded-t-md overflow-hidden">
                    <Image 
                        src={`https://placehold.co/600x400.png?text=${encodeURIComponent(course.name)}`} 
                        alt={course.name} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="course cover"
                    />
                 </div>
                <CardTitle className="text-xl hover:text-primary transition-colors">
                  <Link href={`/teacher/courses/${course.id}/attendance`}>{course.name}</Link>
                </CardTitle>
                <CardDescription className="h-10 overflow-hidden text-ellipsis">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" /> {course.studentIds.length} student(s)</p>
                <p className="text-sm text-muted-foreground">Category: {course.category || "N/A"}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/teacher/courses/${course.id}/attendance`}>
                    <CalendarCheck className="mr-2 h-4 w-4" /> Take/View Attendance
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
