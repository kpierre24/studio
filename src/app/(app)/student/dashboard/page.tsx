
"use client";

import { useMemo } from 'react';
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Edit3, CalendarDays, GraduationCap, FileText, DollarSign, CalendarCheck, CheckCircle, Video } from "lucide-react";
import { format } from 'date-fns';

export default function StudentDashboardPage() {
  const { state } = useAppContext();
  // Ensure all state values are destructured after useAppContext is called.
  const { currentUser, courses, assignments, submissions, enrollments, announcements, isLoading } = state;

  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL RETURNS.
  const studentEnrollments = useMemo(() => {
    if (!currentUser) return [];
    return enrollments.filter(e => e.studentId === currentUser.id);
  }, [enrollments, currentUser]); // Depend on currentUser directly

  const enrolledCourseIds = useMemo(() => {
    // No need to check currentUser here if studentEnrollments handles it
    return studentEnrollments.map(e => e.courseId);
  }, [studentEnrollments]); 

  const enrolledCourses = useMemo(() => {
    // No need to check currentUser here if enrolledCourseIds is derived correctly
    return courses.filter(c => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  const upcomingAssignments = useMemo(() => {
    if (!currentUser) return []; 
    return assignments
      .filter(a => enrolledCourseIds.includes(a.courseId) && new Date(a.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [assignments, enrolledCourseIds, currentUser]); // Depend on currentUser

  const nextDueAssignmentLink = useMemo(() => {
    if (upcomingAssignments.length > 0 && upcomingAssignments[0].courseId && upcomingAssignments[0].id) {
      return `/student/courses/${upcomingAssignments[0].courseId}?assignment=${upcomingAssignments[0].id}`;
    }
    return "/student/courses"; // Fallback to general courses page
  }, [upcomingAssignments]);

  const recentAnnouncements = useMemo(() => {
    if (!currentUser) return []; 
    return (announcements || [])
      .filter(ann => ann.userId === currentUser.id || (ann.courseId && enrolledCourseIds.includes(ann.courseId)) || (ann.type === 'announcement' && ann.userId === undefined && !ann.courseId))
      .sort((a,b) => b.timestamp - a.timestamp)
      .slice(0,3);
  }, [announcements, currentUser, enrolledCourseIds]); // Depend on currentUser

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
          courseId: assignment?.courseId, // Add courseId for linking
        };
      });
  }, [submissions, assignments, courses, currentUser]); // Depend on currentUser


  // Conditional returns now come AFTER all hook calls.
  if (isLoading || currentUser === undefined) { // Check if currentUser is undefined (still resolving) or isLoading is true
    return <p className="text-center text-muted-foreground py-10">Loading dashboard...</p>;
  }

  if (!currentUser) { // currentUser is null, meaning not logged in (or auth failed)
    return <p className="text-center text-muted-foreground py-10">Verifying authentication... Please ensure you are logged in.</p>;
  }
  
  const quickLinks = [
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Join Live Class", href: "/student/live-class", icon: Video },
    { name: "My Assignments", href: "/student/courses", icon: Edit3 }, 
    { name: "My Grades", href: "/student/courses", icon: GraduationCap }, 
    { name: "My Attendance", href: "/student/attendance", icon: CalendarCheck },
    { name: "My Payments", href: "/student/payments", icon: DollarSign },
    { name: "View Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome back, {currentUser.name}!</h1>
      <p className="text-muted-foreground">Your learning journey continues here. Stay on top of your courses and assignments.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <Link href="/student/courses" className="text-xs text-primary hover:underline">View all courses</Link>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            <Edit3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
            <Link href={nextDueAssignmentLink} className="text-xs text-primary hover:underline">
              {upcomingAssignments.length > 0 ? "Go to next assignment" : "View assignments"}
            </Link>
          </CardContent>
        </Card>
         <Card className="shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentlyGradedSubmissions.length > 0 ? (
              <div className="space-y-1">
                {recentlyGradedSubmissions.map(sub => (
                  <Link 
                    key={sub.id} 
                    href={sub.courseId ? `/student/courses/${sub.courseId}?assignment=${sub.assignmentId}` : "/student/courses"} 
                    className="text-xs text-primary hover:underline block"
                  >
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
    
