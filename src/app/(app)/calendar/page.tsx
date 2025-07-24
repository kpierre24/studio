
"use client";

import { useState, useMemo, type ComponentProps, useCallback } from 'react';
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
  const { date, activeModifiers, displayMonth } = props;
  const { state } = useAppContext();
  const { assignments, currentUser, courses, enrollments } = state;

  const isOutsideMonth = date.getMonth() !== displayMonth.getMonth();

  const relevantCourseIds = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN) return courses.map(c => c.id);
    if (currentUser.role === UserRole.TEACHER) return courses.filter(c => c.teacherId === currentUser.id).map(c => c.id);
    if (currentUser.role === UserRole.STUDENT) return enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    return [];
  }, [currentUser, courses, enrollments]);

  const getAssignmentsForDay = useCallback((day: Date): Assignment[] => {
    if (!currentUser) return [];
    return assignments.filter(a =>
      relevantCourseIds.includes(a.courseId) &&
      isSameDay(new Date(a.dueDate), day)
    );
  }, [currentUser, assignments, relevantCourseIds]);

  const dayAssignments = getAssignmentsForDay(date);
  const isToday = activeModifiers.today;
  const isSelected = activeModifiers.selected;

  return (
    <div className={cn(
        "relative h-full w-full flex flex-col p-1 text-xs",
        isOutsideMonth && "opacity-40 pointer-events-none" // Dim and make non-interactive
    )}>
      <div
        className={cn(
          "absolute top-0.5 right-1 text-xs font-medium z-10",
          isSelected && !isOutsideMonth ? "text-primary-foreground font-bold" :
          isToday && !isOutsideMonth ? "text-accent-foreground font-bold" :
          "text-muted-foreground"
        )}
      >
        {format(date, "d")}
      </div>
      {dayAssignments.length > 0 && !isOutsideMonth && (
        <div className="mt-4 flex-grow space-y-0.5 overflow-y-auto pr-0.5">
          {dayAssignments.map(assignment => (
            <Link
              key={assignment.id}
              href={currentUser?.role === UserRole.STUDENT ? `/student/courses/${assignment.courseId}?assignment=${assignment.id}` : `/teacher/courses/${assignment.courseId}`}
              className="block p-0.5 bg-primary/20 text-primary-foreground rounded-sm hover:bg-primary/30 truncate text-[10px] leading-tight"
              title={assignment.title}
            >
              {assignment.title}
            </Link>
          ))}
        </div>
      )}
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
    classDay: calendarDayInfo.classDay,
    noClassDay: calendarDayInfo.noClassDay,
  };

  const calendarModifiersClassNames = {
    classDay: 'bg-green-500/20 hover:bg-green-500/30 text-green-800 dark:bg-green-700/30 dark:hover:bg-green-700/40 dark:text-green-200 font-semibold',
    noClassDay: 'bg-red-500/20 hover:bg-red-500/30 text-red-800 dark:bg-red-700/30 dark:hover:bg-red-700/40 dark:text-red-200 opacity-70 line-through',
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
            className="p-0 [&_table]:w-full [&_tbody_tr]:flex [&_tbody_tr]:w-full [&_td]:flex-1 [&_td]:p-0 [&_button[name=day]]:h-[120px] [&_button[name=day]]:min-h-[120px] [&_button[name=day]]:w-full [&_button[name=day]]:p-0 [&_button[name=day]]:items-stretch [&_button[name=day]]:justify-start [&_button[name=day]]:text-left [&_button[name=day]]:focus-visible:ring-2 [&_button[name=day]]:focus-visible:ring-ring [&_button[name=day]]:focus-visible:z-10"
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

