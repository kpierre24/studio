
"use client";

import { useState, useMemo, type ComponentProps } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import Link from 'next/link';
import { UserRole, type Assignment, type CourseDaySchedule } from '@/types';

// Custom DayContent component to render assignments
function CustomDayContent(props: ComponentProps<"div"> & { date: Date; displayMonth: Date }) {
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
  
  const dayAssignments = getAssignmentsForDay(props.date);

  // Default styling from react-day-picker for the day number
  const dayNumberStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    fontSize: '0.75rem', // text-xs
    fontWeight: isSameDay(props.date, new Date()) ? 'bold' : 'normal',
    color: isSameDay(props.date, new Date()) ? 'hsl(var(--primary))' : undefined,
  };


  return (
    <div className="relative w-full h-full min-h-[100px] sm:min-h-[120px] p-1 pt-5 overflow-hidden">
       {/* react-day-picker handles rendering the day number itself, we just add content */}
      <div className="space-y-1 overflow-y-auto max-h-[80px] sm:max-h-[95px] text-xs">
        {dayAssignments.map(assignment => (
          <Link 
            key={assignment.id} 
            href={currentUser?.role === UserRole.STUDENT ? `/student/courses/${assignment.courseId}?assignment=${assignment.id}` : `/teacher/courses/${assignment.courseId}`}
            className="block p-1 bg-accent text-accent-foreground rounded-sm hover:opacity-80 truncate"
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
        // cs.id is already YYYY-MM-DD from Firestore doc ID
        const dateStr = cs.id; 
        if (cs.status === 'class') {
          classDaysSet.add(dateStr);
        } else if (cs.status === 'no_class') {
          noClassDaysSet.add(dateStr);
        }
      });
    
    // Prevent a day being both a class day and no class day; class day takes precedence
    const finalNoClassDays = Array.from(noClassDaysSet).filter(dateStr => !classDaysSet.has(dateStr));

    return { 
      classDays: Array.from(classDaysSet).map(dateStr => parseISO(dateStr)), 
      noClassDays: finalNoClassDays.map(dateStr => parseISO(dateStr))
    };
  }, [courseSchedules, relevantCourseIds]);


  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());


  const calendarModifiers = {
    classDay: calendarDayInfo.classDays,
    noClassDay: calendarDayInfo.noClassDays,
    // today is handled by react-day-picker by default
  };

  const calendarModifiersClassNames = {
    classDay: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-200 font-semibold',
    noClassDay: 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-200 line-through opacity-70',
    // today default style: bg-accent text-accent-foreground
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
            mode="single" // Keeps single day selectable, good for potential future features
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={calendarModifiers}
            modifiersClassNames={calendarModifiersClassNames}
            components={{
              DayContent: CustomDayContent,
            }}
            className="p-0 [&_button[name=day]]:min-h-[100px] sm:[&_button[name=day]]:min-h-[120px] [&_button[name=day]]:h-full [&_button[name=day]]:items-start [&_button[name=day]]:pt-5"
            // Styles to make day cells taller and align content.
            // Actual day number rendering and selected day state are handled by react-day-picker
          />
           <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-green-500/20 border border-green-600/50"></span> Class Day
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-red-500/20 border border-red-600/50"></span> No Class Day
            </div>
             <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-accent"></span> Assignment Due
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary/10 border border-primary/50"></span> Today
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    