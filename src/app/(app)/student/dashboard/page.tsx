
"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Edit3, CalendarDays, GraduationCap, FileText, DollarSign, CalendarCheck } from "lucide-react";

export default function StudentDashboardPage() {
  const { state } = useAppContext();
  const { currentUser, courses, assignments, enrollments, announcements } = state;

  if (!currentUser) return <p>Loading...</p>;

  const studentEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));

  const upcomingAssignments = assignments
    .filter(a => enrolledCourseIds.includes(a.courseId) && new Date(a.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Ensure announcements is an array before filtering
  const recentAnnouncements = (announcements || [])
    .filter(ann => ann.userId === currentUser.id || (ann.courseId && enrolledCourseIds.includes(ann.courseId)) || (ann.type === 'announcement' && ann.userId === undefined && !ann.courseId))
    .sort((a,b) => b.timestamp - a.timestamp)
    .slice(0,3);


  const quickLinks = [
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "My Assignments", href: "/student/assignments", icon: Edit3 },
    { name: "My Grades", href: "/student/grades", icon: GraduationCap },
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
            <Link href="/student/assignments" className="text-xs text-primary hover:underline">View all assignments</Link>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Placeholder for grades */}
            <div className="text-2xl font-bold">-</div>
            <Link href="/student/grades" className="text-xs text-primary hover:underline">View all grades</Link>
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
