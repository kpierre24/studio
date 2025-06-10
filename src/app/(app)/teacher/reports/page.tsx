
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, GraduationCap, CheckSquare, Users, CalendarCheck, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

export default function TeacherReportsPage() {
  const { state } = useAppContext();
  const { currentUser } = state;
  
  const reportSections = [
    {
      title: "Student Performance Reports",
      icon: GraduationCap,
      description: "Track individual student grades across assignments, view overall course performance, and identify students needing support.",
      details: ["Average Grades per Assignment", "Individual Student Gradebooks", "Overall Course Grade Distribution", "Identify At-Risk Students"]
    },
    {
      title: "Assignment Engagement Reports",
      icon: CheckSquare,
      description: "Analyze assignment submission rates, average scores per assignment, and time taken to grade (if tracked).",
      details: ["Submission Rates per Assignment", "Average Score vs. Due Date", "Frequently Missed Questions (for Quizzes)", "Time to Grade Analysis"]
    },
    {
      title: "Attendance Summaries",
      icon: CalendarCheck,
      description: "View attendance patterns for your courses, generate reports for specific date ranges, and track chronic absenteeism.",
      details: ["Overall Attendance Rate per Course", "Attendance by Student", "Absence/Late Trends", "Exportable Attendance Logs"]
    },
    {
      title: "Course Content Effectiveness",
      icon: Users, // Placeholder, could be something like Lightbulb
      description: "Gain insights into which lessons are most viewed or where students might be struggling (requires advanced tracking).",
      details: ["Lesson Completion Rates (if tracked)", "Quiz Performance by Lesson Topic", "Student Feedback Analysis (if collected)"]
    }
  ];

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data or access denied.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-primary" />
          My Course Reports
        </h1>
      </div>
       <CardDescription className="text-lg">
        View detailed reports for your courses, including student progress, assignment performance, and attendance summaries.
        <span className="block mt-1 text-sm text-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4"/> This reporting suite is currently under development. The sections below outline planned capabilities.
        </span>
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2">
        {reportSections.map((section) => (
          <Card key={section.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <section.icon className="h-6 w-6 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2 text-sm">Potential Reports Include:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {section.details.map(detail => <li key={detail}>{detail}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8 bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-center text-lg">Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                We aim to provide powerful reporting tools to help you effectively manage your courses and support your students. 
                Look for more detailed analytics and customization options in future updates!
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
