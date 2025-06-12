
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, TrendingUp, AlertCircle, BarChartBig, ArrowLeft } from "lucide-react";

// Placeholder data - replace with actual data fetching and charting
const sampleFinancialStats = {
  totalRevenue: 7500.00,
  revenueThisMonth: 1200.00,
  outstandingPayments: 350.00,
  topPerformingCourse: { name: "Introduction to Programming", revenue: 3000.00 },
};

export default function FinancialOverviewReportsPage() {
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
          <AlertTriangle className="h-4 w-4"/> This page is a placeholder. Detailed charts and data visualizations are planned.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sampleFinancialStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time gross revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sampleFinancialStats.revenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current calendar month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sampleFinancialStats.outstandingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all pending invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Chart showing revenue generated per course.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">[Chart Placeholder: Revenue by Course - e.g., Top: {sampleFinancialStats.topPerformingCourse.name} (${sampleFinancialStats.topPerformingCourse.revenue.toFixed(2)})]</p>
          </CardContent>
        </Card>
        {/* Add more placeholder cards for other planned financial reports as needed */}
        {/* e.g., Payment Status Breakdown, Revenue Trends Over Time */}
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
