
"use client";

import { useMemo } from 'react';
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Edit3, CalendarDays, GraduationCap, FileText, DollarSign, CalendarCheck, CheckCircle } from "lucide-react";
import { format } from 'date-fns';

export default function StudentDashboardPage() {
  const { state } = useAppContext();
  const { currentUser, courses, assignments, submissions, enrollments, announcements, isLoading } = state;

  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL RETURNS.
  const studentEnrollments = useMemo(() => {
    if (!currentUser) return [];
    return enrollments.filter(e => e.studentId === currentUser.id);
  }, [enrollments, currentUser]);

  const enrolledCourseIds = useMemo(() => {
    if (!currentUser) return []; // Guard based on currentUser for consistency
    return studentEnrollments.map(e => e.courseId);
  }, [studentEnrollments, currentUser]); 

  const enrolledCourses = useMemo(() => {
    if (!currentUser) return []; 
    return courses.filter(c => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds, currentUser]);

  const upcomingAssignments = useMemo(() => {
    if (!currentUser) return []; 
    return assignments
      .filter(a => enrolledCourseIds.includes(a.courseId) && new Date(a.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [assignments, enrolledCourseIds, currentUser]); 

  const recentAnnouncements = useMemo(() => {
    if (!currentUser) return []; 
    return (announcements || [])
      .filter(ann => ann.userId === currentUser.id || (ann.courseId && enrolledCourseIds.includes(ann.courseId)) || (ann.type === 'announcement' && ann.userId === undefined && !ann.courseId))
      .sort((a,b) => b.timestamp - a.timestamp)
      .slice(0,3);
  }, [announcements, currentUser, enrolledCourseIds]);

  const recentlyGradedSubmissions = useMemo(() => {
    if (!currentUser) return []; 
    return submissions
      .filter(sub => sub.studentId === currentUser.id && sub.grade !== undefined)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) 
      .slice(0, 3)
      .map(sub => {
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        const course = courses.find(c => c.id === assignment?.courseId);
        return {
          ...sub,
          assignmentTitle: assignment?.title || "Unknown Assignment",
          courseName: course?.name || "Unknown Course",
          totalPoints: assignment?.totalPoints,
        };
      });
  }, [submissions, assignments, courses, currentUser]);


  // Conditional returns now come AFTER all hook calls.
  if (!currentUser && !isLoading) {
    return <p>Verifying authentication...</p>;
  }

  if (isLoading || !currentUser) { // This will catch currentUser being null after loading attempted
    return <p>Loading dashboard...</p>;
  }
  
  const quickLinks = [
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "My Assignments", href: "/student/courses", icon: Edit3 }, // Point to courses page, can filter later
    { name: "My Grades", href: "/student/courses", icon: GraduationCap }, // Point to courses page for now
    { name: "My Attendance", href: "/student/attendance", icon: CalendarCheck },
    { name: "My Payments", href: "/student/payments", icon: DollarSign },
    { name: "View Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome back, {currentUser.name}!</h1>
      <p className="text-muted-foreground">Your learning journey continues here. Stay on top of your courses and assignments.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <Link href="/student/courses" className="text-xs text-primary hover:underline">View all courses</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
            <Link href={`/student/courses/${upcomingAssignments[0]?.courseId}?assignment=${upcomingAssignments[0]?.id}`} className="text-xs text-primary hover:underline">View assignments</Link>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentlyGradedSubmissions.length > 0 ? (
              <div className="space-y-1">
                {recentlyGradedSubmissions.map(sub => (
                  <Link key={sub.id} href={`/student/courses/${assignments.find(a=>a.id === sub.assignmentId)?.courseId}?assignment=${sub.assignmentId}`} className="text-xs text-primary hover:underline block">
                     <div className="flex justify-between items-center">
                        <span className="truncate w-3/4" title={sub.assignmentTitle}>{sub.assignmentTitle}</span>
                        <span className="font-semibold">{sub.grade}/{sub.totalPoints}</span>
                     </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
            {recentlyGradedSubmissions.length > 0 && <Link href="/student/courses" className="text-xs text-primary hover:underline mt-1 block">View all grades</Link>}
            {recentlyGradedSubmissions.length === 0 && <p className="text-xs text-muted-foreground">No grades posted yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Button key={link.name} variant="outline" asChild className="justify-start text-left h-auto py-3">
                <Link href={link.href}>
                  <link.icon className="mr-3 h-5 w-5 text-primary" />
                  <span className="font-semibold">{link.name}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Stay updated with the latest news.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <ul className="space-y-3">
                {recentAnnouncements.map(ann => (
                  <li key={ann.id} className="text-sm p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <Link href={ann.link || "/announcements"} className="block">
                      <div className="font-semibold">{ann.message.substring(0,50)}{ann.message.length > 50 ? '...' : ''}</div>
                      <div className="text-xs text-muted-foreground">{new Date(ann.timestamp).toLocaleDateString()}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent announcements.</p>
            )}
            <Button variant="link" asChild className="mt-2 p-0 h-auto">
              <Link href="/announcements">View all announcements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    
