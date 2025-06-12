
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BarChartHorizontalBig, UserPlus, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { UserRole } from "@/types";

export default function UserActivityReportsPage() {
  const { state } = useAppContext();
  const { users } = state;

  const userStats = useMemo(() => {
    const totalUsers = users.length;
    // Placeholder: "New Today" would require user creation timestamps.
    const newRegistrationsToday = users.filter(u => {
        // This is a mock. Real implementation needs creation timestamps.
        // For now, let's assume users created in the last 24 hours if we had a 'createdAt' field.
        // const today = new Date();
        // const yesterday = new Date(today);
        // yesterday.setDate(today.getDate() - 1);
        // return u.createdAt && new Date(u.createdAt) > yesterday;
        return false; // No createdAt field on User type
    }).length;

    // Placeholder: Active users (DAU/MAU) require activity tracking (e.g., last login).
    const activeUsersDAU = Math.floor(totalUsers * 0.3) || 0; // Mock DAU
    const activeUsersMAU = Math.floor(totalUsers * 0.7) || 0; // Mock MAU

    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      totalUsers,
      newRegistrationsToday: 1, // Static placeholder as creationTime not available
      activeUsersDAU,
      activeUsersMAU,
      roleDistribution,
    };
  }, [users]);

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
          <AlertTriangle className="h-4 w-4"/> Some metrics are placeholders. Detailed charts and data visualizations are planned.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today (Mock)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.newRegistrationsToday}</div>
            <p className="text-xs text-muted-foreground">Mock data - requires creation timestamps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (DAU Mock)</CardTitle>
            <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsersDAU}</div>
            <p className="text-xs text-muted-foreground">Mock daily active users</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (MAU Mock)</CardTitle>
            <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsersMAU}</div>
            <p className="text-xs text-muted-foreground">Mock monthly active users</p>
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
            <p className="text-muted-foreground">[Chart Placeholder: New Registrations - Requires Timestamps]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by role.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
             <div className="text-center text-muted-foreground">
                <p>[Chart Placeholder: Role Distribution]</p>
                <ul className="mt-2 text-sm">
                  <li>Students: {userStats.roleDistribution.Student || 0}</li>
                  <li>Teachers: {userStats.roleDistribution.Teacher || 0}</li>
                  <li>Super Admins: {userStats.roleDistribution.SuperAdmin || 0}</li>
                </ul>
             </div>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8 bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-center text-lg">Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                More detailed reports such as user engagement metrics (e.g., session duration, feature usage), cohort analysis, and demographic data will be added here. This requires additional data tracking.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
