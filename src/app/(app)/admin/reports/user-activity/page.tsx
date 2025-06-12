
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BarChartHorizontalBig, UserPlus, AlertTriangle, ArrowLeft } from "lucide-react";

// Placeholder data - replace with actual data fetching and charting components
const sampleUserStats = {
  totalUsers: 1250,
  newRegistrationsToday: 15,
  activeUsersDAU: 350,
  activeUsersMAU: 900,
  roleDistribution: {
    Student: 1000,
    Teacher: 200,
    SuperAdmin: 50,
  },
};

export default function UserActivityReportsPage() {
  return (
    <div className="space-y-8">
      <Button variant="outline" asChild>
        <Link href="/admin/reports">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Reports
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          User Activity Reports
        </h1>
      </div>
      <CardDescription className="text-lg">
        Insights into user registration, engagement, and demographics.
         <span className="block mt-1 text-sm text-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4"/> This page is a placeholder. Detailed charts and data visualizations are planned.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleUserStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleUserStats.newRegistrationsToday}</div>
            <p className="text-xs text-muted-foreground">Registrations in last 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (DAU)</CardTitle>
            <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleUserStats.activeUsersDAU}</div>
            <p className="text-xs text-muted-foreground">Daily active users</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (MAU)</CardTitle>
            <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleUserStats.activeUsersMAU}</div>
            <p className="text-xs text-muted-foreground">Monthly active users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Registrations Over Time</CardTitle>
            <CardDescription>Chart showing new user sign-ups (e.g., daily, weekly, monthly).</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">[Chart Placeholder: New Registrations]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Pie chart or bar chart showing the breakdown of users by role.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
             <p className="text-muted-foreground">[Chart Placeholder: Role Distribution - Students: {sampleUserStats.roleDistribution.Student}, Teachers: {sampleUserStats.roleDistribution.Teacher}, Admins: {sampleUserStats.roleDistribution.SuperAdmin}]</p>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8 bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-center text-lg">Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                More detailed reports such as user engagement metrics (e.g., session duration, feature usage), cohort analysis, and demographic data will be added here.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
