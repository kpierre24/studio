
"use client";

import { useState, useMemo, type ComponentProps } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar'; // Shadcn Calendar
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import Link from 'next/link';
import { UserRole, type Assignment, type CourseDaySchedule } from '@/types';
import { type DayContentProps, type ActiveModifiers } from 'react-day-picker';
import { cn } from '@/lib/utils';

// Custom DayContent component to render assignments and the day number
function CustomDayContent(props: DayContentProps) {
  const { date, activeModifiers } = props;
  const { state } = useAppContext();
  const { assignments, currentUser, courses, enrollments } = state;

  const relevantCourseIds = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN) return courses.map(c => c.id);
    if (currentUser.role === UserRole.TEACHER) return courses.filter(c => c.teacherId === currentUser.id).map(c => c.id);
    if (currentUser.role === UserRole.STUDENT) return enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    return [];
  }, [currentUser, courses, enrollments]);

  const getAssignmentsForDay = (day: Date): Assignment[] => {
    if (!currentUser) return [];
    return assignments.filter(a =>
      relevantCourseIds.includes(a.courseId) &&
      isSameDay(new Date(a.dueDate), day)
    );
  };

  const dayAssignments = getAssignmentsForDay(date);
  const isToday = activeModifiers.today;
  const isSelected = activeModifiers.selected;

  return (
    <div className="relative h-full w-full flex flex-col p-0.5"> {/* Full height, flex column, tiny padding for items */}
      <div
        className={cn(
          "absolute top-1 right-1.5 text-xs font-medium",
          isToday && !isSelected && "text-accent-foreground font-bold", // Today, not selected
          isSelected && "text-primary-foreground font-bold", // Selected (overrides today color for number if also today)
          !isToday && !isSelected && "text-muted-foreground" // Default
        )}
      >
        {format(date, "d")}
      </div>
      <div className="mt-5 flex-grow space-y-0.5 overflow-y-auto text-xs pr-0.5"> {/* Margin top for day number, scrollable area */}
        {dayAssignments.map(assignment => (
          <Link
            key={assignment.id}
            href={currentUser?.role === UserRole.STUDENT ? `/student/courses/${assignment.courseId}?assignment=${assignment.id}` : `/teacher/courses/${assignment.courseId}`}
            className="block p-1 bg-primary/20 text-primary-foreground rounded-sm hover:bg-primary/30 truncate"
            title={assignment.title}
          >
            {assignment.title}
          </Link>
        ))}
      </div>
    </div>
  );
}


export default function CalendarPage() {
  const { state } = useAppContext();
  const { currentUser, courses, enrollments, courseSchedules } = state;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const relevantCourseIds = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN) return courses.map(c => c.id);
    if (currentUser.role === UserRole.TEACHER) return courses.filter(c => c.teacherId === currentUser.id).map(c => c.id);
    if (currentUser.role === UserRole.STUDENT) return enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    return [];
  }, [currentUser, courses, enrollments]);

  const calendarDayInfo = useMemo(() => {
    const classDaysSet = new Set<string>();
    const noClassDaysSet = new Set<string>();

    courseSchedules
      .filter(cs => relevantCourseIds.includes(cs.courseId))
      .forEach(cs => {
        const dateStr = cs.id;
        if (cs.status === 'class') {
          classDaysSet.add(dateStr);
        } else if (cs.status === 'no_class') {
          noClassDaysSet.add(dateStr);
        }
      });

    const finalNoClassDays = Array.from(noClassDaysSet).filter(dateStr => !classDaysSet.has(dateStr));

    return {
      classDay: Array.from(classDaysSet).map(dateStr => parseISO(dateStr)),
      noClassDay: finalNoClassDays.map(dateStr => parseISO(dateStr))
    };
  }, [courseSchedules, relevantCourseIds]);


  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());


  const calendarModifiers = {
    classDay: calendarDayInfo.classDays,
    noClassDay: calendarDayInfo.noClassDays,
    // today is implicitly handled by react-day-picker
  };

  // These class names are applied to the button elements for each day
  const calendarModifiersClassNames = {
    classDay: 'bg-green-500/20 hover:bg-green-500/30 text-green-800 dark:bg-green-700/30 dark:hover:bg-green-700/40 dark:text-green-200 font-semibold',
    noClassDay: 'bg-red-500/20 hover:bg-red-500/30 text-red-800 dark:bg-red-700/30 dark:hover:bg-red-700/40 dark:text-red-200 opacity-70 line-through',
    // Default 'today' style comes from calendar.tsx (bg-accent text-accent-foreground)
    // Default 'selected' style also comes from calendar.tsx (bg-primary text-primary-foreground)
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevMonth} size="icon"><ChevronLeft className="h-5 w-5" /></Button>
          <Button variant="outline" onClick={today} className="px-4">Today</Button>
          <Button variant="outline" onClick={nextMonth} size="icon"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={calendarModifiers}
            modifiersClassNames={calendarModifiersClassNames}
            components={{
              DayContent: CustomDayContent,
            }}
            // Force day buttons to be taller and remove their internal padding.
            // items-stretch ensures the CustomDayContent can fill the height.
            className="p-0 [&_button[name=day]]:h-[100px] sm:[&_button[name=day]]:h-[120px] [&_button[name=day]]:p-0 [&_button[name=day]]:items-stretch [&_button[name=day]]:focus-visible:ring-2 [&_button[name=day]]:focus-visible:ring-ring [&_button[name=day]]:focus-visible:z-10"
          />
           <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-green-500/20 border border-green-600/50"></span> Class Day
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-600/50"></span> No Class Day
            </div>
             <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary/20 border border-primary/50"></span> Assignment Due
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-accent border border-accent-foreground/30"></span> Today
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
