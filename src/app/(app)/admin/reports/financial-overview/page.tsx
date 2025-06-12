
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, TrendingUp, AlertCircle, BarChartBig, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { PaymentStatus } from "@/types";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
// Recharts components
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";


const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

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

    const outstandingPayments = payments
        .filter(p => p.status === PaymentStatus.PENDING)
        .reduce((sum, p) => sum + p.amount, 0);

    const revenueByCourse: Record<string, { name: string, revenue: number, id: string }> = {};
    paidPayments.forEach(p => {
      const course = courses.find(c => c.id === p.courseId);
      if (course) {
        if (!revenueByCourse[course.id]) {
          revenueByCourse[course.id] = { name: course.name, revenue: 0, id: course.id };
        }
        revenueByCourse[course.id].revenue += p.amount;
      }
    });
    
    const revenueByCourseList = Object.values(revenueByCourse).sort((a,b) => b.revenue - a.revenue);
    
    return {
      totalRevenue,
      revenueThisMonth,
      outstandingPayments,
      revenueByCourseList,
      chartData: revenueByCourseList.slice(0, 7).map(item => ({ month: item.name, revenue: item.revenue, fill: "hsl(var(--chart-1))" })).reverse() // Show top 7 for chart
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
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Total 'Paid' revenue generated per course (Top {financialStats.chartData.length} shown in chart).
            {financialStats.revenueByCourseList.length > financialStats.chartData.length && ` Total ${financialStats.revenueByCourseList.length} courses with revenue.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] bg-muted/50 rounded-md p-4">
            {financialStats.chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialStats.chartData} layout="vertical" margin={{ right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="revenue" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <YAxis dataKey="month" type="category" tickLine={false} axisLine={false} width={150} hide={financialStats.chartData.length > 10} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="revenue" radius={5} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
                 <p className="text-muted-foreground text-center py-10">No paid revenue data by course yet.</p>
            )}
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
