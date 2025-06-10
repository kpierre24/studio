
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, DollarSign, BarChart2, Settings, Activity, UserCheck, UserCog, CalendarCheck, UserPlus } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { UserRole } from "@/types";
import { useMemo } from "react";

export default function AdminDashboardPage() {
  const { state } = useAppContext();

  const stats = useMemo(() => {
    const totalUsers = state.users.length;
    const activeCourses = state.courses.length;
    const totalStudents = state.users.filter(u => u.role === UserRole.STUDENT).length;
    const totalTeachers = state.users.filter(u => u.role === UserRole.TEACHER).length;
    return { totalUsers, activeCourses, totalStudents, totalTeachers };
  }, [state.users, state.courses]);

  const quickLinks = [
    { name: "Manage Users", href: "/admin/users", icon: Users, description: "View and manage all user accounts." },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen, description: "Oversee all courses in the system." },
    { name: "Manage Enrollments", href: "/admin/enrollments", icon: UserPlus, description: "Bulk enroll/unenroll students." },
    { name: "Attendance Records", href: "/admin/attendance", icon: CalendarCheck, description: "View all attendance data." },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, description: "Configure application-wide settings." },
    { name: "View Reports", href: "/admin/reports", icon: BarChart2, description: "Access system usage and analytics." },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Super Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered accounts</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Courses available on platform</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
             <p className="text-xs text-muted-foreground">Enrolled student users</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <UserCog className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Registered teacher users</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Button key={link.name} variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors">
              <Link href={link.href}>
                <link.icon className="mr-3 h-6 w-6 text-primary" />
                <span className="flex flex-col">
                  <span className="font-semibold text-base">{link.name}</span>
                  <span className="text-xs text-muted-foreground">{link.description}</span>
                </span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display recent important system events such as new user registrations, course creations, or critical system alerts.
            (Placeholder: No recent activity to display currently.)
          </p>
          {/* Example of what an activity item could look like:
          <ul className="space-y-3 mt-4">
            <li className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
              <Users className="h-5 w-5 text-green-500"/>
              <div>
                <p className="text-sm font-medium">New user registered: student@example.com</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
              <BookOpen className="h-5 w-5 text-blue-500"/>
              <div>
                <p className="text-sm font-medium">Course "Advanced AI" created by teacher@example.com</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </li>
          </ul>
          */}
        </CardContent>
      </Card>
    </div>
  );
}

