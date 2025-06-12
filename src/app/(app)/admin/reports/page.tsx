
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart2, Users, BookOpen, DollarSign, AlertTriangle, Activity, ChevronRight } from "lucide-react";

export default function AdminReportsPage() {
  const reportSections = [
    {
      title: "User Activity Reports",
      icon: Users,
      description: "Track new user registrations, active users, role distributions, and engagement trends.",
      details: ["New Registrations Over Time", "Active Users (DAU/MAU)", "User Role Breakdown"],
      link: "/admin/reports/user-activity",
      status: "beta"
    },
    {
      title: "Course Engagement Reports",
      icon: BookOpen,
      description: "Analyze course enrollment trends, completion rates, popular courses, and identify areas for content improvement.",
      details: ["Enrollment Statistics per Course", "Course Completion Rates", "Most/Least Popular Courses"],
      link: null, // To be implemented
      status: "planned"
    },
    {
      title: "Financial Overview Reports",
      icon: DollarSign,
      description: "Monitor revenue from course enrollments, track payment statuses, and generate financial summaries.",
      details: ["Revenue by Course/Category", "Outstanding Payments", "Payment Method Analysis"],
      link: "/admin/reports/financial-overview",
      status: "beta"
    },
    {
      title: "System Health & Usage",
      icon: Activity,
      description: "Get insights into overall platform performance, identify potential bottlenecks, and monitor resource usage.",
      details: ["Error Logs & Frequency", "Page Load Times", "Storage Usage Statistics"],
      link: null, // To be implemented
      status: "planned"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-primary" />
          System Reports & Analytics
        </h1>
      </div>
      <CardDescription className="text-lg">
        Access comprehensive reports on platform usage, user activity, and course statistics.
        <span className="block mt-1 text-sm text-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4"/> Some reports are still under development.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2">
        {reportSections.map((section) => (
          <Card key={section.title} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <section.icon className="h-6 w-6 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold mb-2 text-sm">Key Metrics:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {section.details.map(detail => <li key={detail}>{detail}</li>)}
              </ul>
            </CardContent>
            <CardFooter>
              {section.link ? (
                <Button asChild className="w-full mt-2">
                  <Link href={section.link}>
                    View {section.title} <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full mt-2 opacity-70">
                  {section.status === "planned" ? "Coming Soon" : "View Report"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8 bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-center text-lg">More to Come!</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                We are continuously working on expanding the reporting capabilities of ClassroomHQ. 
                Future updates may include customizable report generation, data export options, and more granular analytics.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
