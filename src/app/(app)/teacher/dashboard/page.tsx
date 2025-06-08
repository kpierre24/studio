"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Edit3, Users, CalendarCheck, PlusCircle } from "lucide-react";

export default function TeacherDashboardPage() {
  const { state } = useAppContext();
  const { currentUser, courses, assignments, submissions } = state;

  if (!currentUser) return <p>Loading...</p>; // Or a more sophisticated loading state

  const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
  const pendingSubmissionsCount = submissions.filter(sub => {
    const assignment = assignments.find(a => a.id === sub.assignmentId);
    return assignment && teacherCourses.some(tc => tc.id === assignment.courseId) && !sub.grade;
  }).length;

  const quickActions = [
    { name: "Create New Course", href: "/teacher/courses/new", icon: PlusCircle },
    { name: "View My Courses", href: "/teacher/courses", icon: BookOpen },
    { name: "Grade Submissions", href: "/teacher/grading", icon: Edit3 }, // Assuming a central grading page
    { name: "Manage Attendance", href: "/teacher/attendance", icon: CalendarCheck },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome, {currentUser.name}!</h1>
      <p className="text-muted-foreground">Here's an overview of your teaching activities.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCourses.length}</div>
            <p className="text-xs text-muted-foreground">Actively teaching</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissionsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>
         <Card>
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
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button key={action.name} variant="outline" asChild className="justify-start text-left h-auto py-3">
              <Link href={action.href}>
                <action.icon className="mr-3 h-5 w-5 text-primary" />
                 <span className="flex flex-col">
                  <span className="font-semibold">{action.name}</span>
                  <span className="text-xs text-muted-foreground">Quick access</span>
                </span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder: List upcoming assignment deadlines */}
          <p className="text-muted-foreground">No upcoming deadlines in the next 7 days. This section will show assignments due soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
