"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, DollarSign, BarChart2, PlusCircle } from "lucide-react";

export default function AdminDashboardPage() {
  // Placeholder data - in a real app, this would come from context/state
  const stats = {
    totalUsers: 150,
    activeCourses: 25,
    totalStudents: 120,
    totalTeachers: 10,
  };

  const quickLinks = [
    { name: "Manage Users", href: "/admin/users", icon: Users },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Site Settings", href: "/admin/settings", icon: PlusCircle }, // Assuming settings page
    { name: "View Reports", href: "/admin/reports", icon: BarChart2 }, // Assuming reports page
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+5 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
             <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active and assigned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Button key={link.name} variant="outline" asChild className="justify-start text-left h-auto py-3">
              <Link href={link.href}>
                <link.icon className="mr-3 h-5 w-5 text-primary" />
                <span className="flex flex-col">
                  <span className="font-semibold">{link.name}</span>
                  <span className="text-xs text-muted-foreground">Go to {link.name.toLowerCase()}</span>
                </span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Placeholder for more sections like Recent Activity, System Health, etc. */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display. This section will show important system events or actions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
