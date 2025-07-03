
"use client";

import { useMemo } from 'react';
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Edit3, Users, CalendarCheck, PlusCircle, Clock } from "lucide-react";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function TeacherDashboardPage() {
  const { state } = useAppContext();
  const { currentUser, courses, assignments, submissions, isLoading } = state;
  const router = useRouter();

  if (!currentUser && !isLoading) return <p>Redirecting to login...</p>;
  if (isLoading || !currentUser) return <p>Loading dashboard...</p>;

  const teacherCourses = useMemo(() => courses.filter(course => course.teacherId === currentUser.id), [courses, currentUser.id]);
  
  const pendingSubmissionsCount = useMemo(() => submissions.filter(sub => {
    const assignment = assignments.find(a => a.id === sub.assignmentId);
    return assignment && teacherCourses.some(tc => tc.id === assignment.courseId) && sub.grade === undefined; // Check for undefined grade
  }).length, [submissions, assignments, teacherCourses]);

  const upcomingTeacherAssignments = useMemo(() => {
    const teacherCourseIds = teacherCourses.map(c => c.id);
    return assignments
      .filter(a => teacherCourseIds.includes(a.courseId) && new Date(a.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5) // Show up to 5 upcoming assignments
      .map(assign => ({
        ...assign,
        courseName: courses.find(c => c.id === assign.courseId)?.name || "Unknown Course",
      }));
  }, [assignments, teacherCourses, courses]);


  const quickActions = [
    { name: "Create New Course", queryParam: "?action=create", href: "/teacher/courses", icon: PlusCircle, description: "Start a new course from scratch." },
    { name: "View My Courses", href: "/teacher/courses", icon: BookOpen, description: "Manage lessons and assignments." },
    { name: "Grade Submissions", href: "/teacher/grading", icon: Edit3, description: "Review and grade student work." }, 
    { name: "Manage Attendance", href: "/teacher/attendance", icon: CalendarCheck, description: "Take or view class attendance." },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome, {currentUser.name}!</h1>
      <p className="text-muted-foreground">Here's an overview of your teaching activities.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCourses.length}</div>
            <Link href="/teacher/courses" className="text-xs text-primary hover:underline">
              View all courses
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissionsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>
         <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherCourses.reduce((acc, course) => acc + course.studentIds.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled in your courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Button 
              key={action.name} 
              variant="outline" 
              onClick={() => router.push(action.href + (action.queryParam || ''))}
              className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors"
            >
              <action.icon className="mr-3 h-6 w-6 text-primary" />
              <span className="flex flex-col">
                <span className="font-semibold text-base">{action.name}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Assignments from your courses that are due soon.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && upcomingTeacherAssignments.length === 0 ? (
             <p className="text-muted-foreground">Loading deadlines...</p>
          ) : upcomingTeacherAssignments.length > 0 ? (
            <ul className="space-y-3">
              {upcomingTeacherAssignments.map(assign => (
                <li key={assign.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <Link href={`/teacher/courses/${assign.courseId}`} className="block"> {/* Consider linking to assignment detail/grading later */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{assign.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Due: {format(new Date(assign.dueDate), "MMM d, p")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{assign.courseName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming deadlines in the next 7 days for your courses.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
