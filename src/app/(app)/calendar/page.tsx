
"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, getDay } from 'date-fns';
import Link from 'next/link';

export default function CalendarPage() {
  const { state } = useAppContext();
  const { assignments, currentUser } = state;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const enrolledCourseIds = useMemo(() => {
    if (!currentUser) return [];
    return state.enrollments
      .filter(e => e.studentId === currentUser.id)
      .map(e => e.courseId);
  }, [currentUser, state.enrollments]);

  const teacherCourseIds = useMemo(() => {
    if(!currentUser || currentUser.role !== 'Teacher') return [];
    return state.courses
        .filter(c => c.teacherId === currentUser.id)
        .map(c => c.id);
  }, [currentUser, state.courses]);
  

  const relevantAssignments = useMemo(() => {
    if (!currentUser) return [];
    return assignments.filter(assignment => {
      if (currentUser.role === 'SuperAdmin') return true;
      if (currentUser.role === 'Student') {
        return enrolledCourseIds.includes(assignment.courseId);
      }
      if (currentUser.role === 'Teacher') {
        return teacherCourseIds.includes(assignment.courseId);
      }
      return false;
    });
  }, [assignments, currentUser, enrolledCourseIds, teacherCourseIds]);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const getAssignmentsForDay = (day: Date) => {
    return relevantAssignments.filter(a => isSameDay(new Date(a.dueDate), day));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px border-t border-l border-border bg-border overflow-hidden rounded-lg">
            {dayNames.map(dayName => (
              <div key={dayName} className="py-2 text-center font-medium text-sm bg-muted text-muted-foreground">{dayName}</div>
            ))}
            {daysInMonth.map((day, dayIdx) => (
              <div
                key={day.toString()}
                className={`p-2 min-h-[100px] sm:min-h-[120px] border-b border-r border-border relative transition-colors duration-150
                  ${isSameMonth(day, currentMonth) ? 'bg-card hover:bg-muted/50' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}
                  ${isSameDay(day, new Date()) ? 'bg-primary/10 ring-2 ring-primary z-10' : ''}
                `}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className={`absolute top-2 right-2 text-xs font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </time>
                <div className="mt-6 space-y-1 overflow-y-auto max-h-[80px] sm:max-h-[100px]">
                  {getAssignmentsForDay(day).map(assignment => (
                    <Link 
                      key={assignment.id} 
                      href={`/student/courses/${assignment.courseId}?assignment=${assignment.id}`}
                      className="block p-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:opacity-80 truncate"
                      title={assignment.title}
                    >
                      {assignment.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

