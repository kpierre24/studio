
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, TrendingUp, AlertCircle, BarChartBig, ArrowLeft } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { PaymentStatus } from "@/types";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export default function FinancialOverviewReportsPage() {
  const { state } = useAppContext();
  const { payments, courses } = state;

  const financialStats = useMemo(() => {
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID && p.paymentDate);
    
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);

    const revenueThisMonth = paidPayments
      .filter(p => p.paymentDate && isWithinInterval(parseISO(p.paymentDate), { start: startOfThisMonth, end: endOfThisMonth }))
      .reduce((sum, p) => sum + p.amount, 0);

    // Simplified: Sum of 'Pending' payments.
    // A more accurate "Outstanding" would involve calculating (course_cost - amount_paid_for_course_enrollment) per student per course.
    const outstandingPayments = payments
        .filter(p => p.status === PaymentStatus.PENDING)
        .reduce((sum, p) => sum + p.amount, 0);

    const revenueByCourse: Record<string, { name: string, revenue: number }> = {};
    paidPayments.forEach(p => {
      const course = courses.find(c => c.id === p.courseId);
      if (course) {
        if (!revenueByCourse[course.id]) {
          revenueByCourse[course.id] = { name: course.name, revenue: 0 };
        }
        revenueByCourse[course.id].revenue += p.amount;
      }
    });

    const topPerformingCourse = Object.values(revenueByCourse).sort((a,b) => b.revenue - a.revenue)[0] || { name: "N/A", revenue: 0 };
    
    return {
      totalRevenue,
      revenueThisMonth,
      outstandingPayments,
      topPerformingCourse,
      revenueByCourseList: Object.values(revenueByCourse).sort((a,b) => b.revenue - a.revenue),
    };
  }, [payments, courses]);

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild>
        <Link href="/admin/reports">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Reports
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          Financial Overview Reports
        </h1>
      </div>
      <CardDescription className="text-lg">
        Monitor revenue, track payments, and analyze financial performance.
        <span className="block mt-1 text-sm text-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4"/> This page provides a basic overview. Detailed charts and data visualizations are planned.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time (from 'Paid' payments)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialStats.revenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current calendar month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialStats.outstandingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Sum of payments with 'Pending' status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course (Top 5)</CardTitle>
            <CardDescription>Total 'Paid' revenue generated per course.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] bg-muted/50 rounded-md p-6">
            {financialStats.revenueByCourseList.length > 0 ? (
                <ul className="space-y-2">
                    {financialStats.revenueByCourseList.slice(0,5).map(courseItem => (
                        <li key={courseItem.name} className="flex justify-between text-sm border-b pb-1">
                            <span>{courseItem.name}</span>
                            <span className="font-semibold">${courseItem.revenue.toFixed(2)}</span>
                        </li>
                    ))}
                     {financialStats.revenueByCourseList.length === 0 && <p className="text-muted-foreground">No paid revenue data by course yet.</p>}
                </ul>
            ): (
                 <p className="text-muted-foreground text-center py-10">[Chart Placeholder: Revenue by Course - e.g., Top: {financialStats.topPerformingCourse.name} (${financialStats.topPerformingCourse.revenue.toFixed(2)})]</p>
            )}
             <p className="text-xs text-muted-foreground mt-4">Full chart visualization coming soon.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8 bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-center text-lg">Important Note</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                Financial reporting relies heavily on accurate payment data. Ensure all transactions are correctly recorded in the "Manage Payments" section for these reports to be meaningful. 
                Full payment gateway integration will further enhance these reports.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
