
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { User, Course, AttendanceRecord, TakeAttendancePayload, CourseDaySchedule, UpdateCourseDaySchedulePayload, ClearCourseDaySchedulePayload } from '@/types';
import { UserRole, AttendanceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, ArrowLeft, Users, Save, Loader2, CalendarPlus, CalendarX, Trash2, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type StudentAttendanceState = {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
};

export default function CourseAttendancePage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { state, fetchCourseSchedule, handleUpdateCourseDaySchedule, handleClearCourseDaySchedule, handleSaveAttendanceRecords } = useAppContext();
  const { currentUser, courses, users, attendanceRecords, courseSchedules } = state;
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, StudentAttendanceState>>({});
  const [dayNotes, setDayNotes] = useState('');
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  const course = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);
  const enrolledStudents = useMemo(() => {
    if (!course) return [];
    return users.filter(u => course.studentIds.includes(u.id));
  }, [course, users]);

  const selectedDayStatus = useMemo(() => {
    if (!selectedDate || !course) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const schedule = courseSchedules.find(cs => cs.courseId === courseId && cs.id === dateStr);
    return schedule ? schedule.status : null; // null if not set, 'class' or 'no_class' if set
  }, [selectedDate, courseId, courseSchedules, course]);
  
  const selectedDayScheduleDetails = useMemo(() => {
    if (!selectedDate || !course) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return courseSchedules.find(cs => cs.courseId === courseId && cs.id === dateStr);
  }, [selectedDate, courseId, courseSchedules, course]);


  useEffect(() => {
    if (courseId) {
      fetchCourseSchedule(courseId);
    }
  }, [courseId, fetchCourseSchedule]);

  useEffect(() => {
    if (!selectedDate || !course) {
      setStudentAttendanceMap({});
      setDayNotes('');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newAttendanceMap: Record<string, StudentAttendanceState> = {};
    
    const daySchedule = courseSchedules.find(cs => cs.courseId === courseId && cs.id === dateStr);
    setDayNotes(daySchedule?.notes || '');

    enrolledStudents.forEach(student => {
      const existingRecord = attendanceRecords.find(
        ar => ar.courseId === courseId && ar.studentId === student.id && ar.date === dateStr
      );
      newAttendanceMap[student.id] = {
        studentId: student.id,
        status: existingRecord?.status || AttendanceStatus.PRESENT,
        notes: existingRecord?.notes || '',
      };
    });
    setStudentAttendanceMap(newAttendanceMap);
  }, [selectedDate, course, enrolledStudents, attendanceRecords, courseSchedules, courseId]);


  const isContextLoading = false; // Remove this since isLoading was removed from context
  
  if (!currentUser) {
    return <p className="text-center text-muted-foreground py-10">Loading session data...</p>;
  }
  if (!currentUser || (currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return <p className="text-center text-muted-foreground">Access Denied. You must be a teacher or admin.</p>;
  }
  if (!course && !isContextLoading) {
    return <p className="text-center text-muted-foreground">Course not found.</p>;
  }
  if (!course && isContextLoading) {
     return <p className="text-center text-muted-foreground py-10">Loading course details...</p>;
  }
  if (currentUser.role === UserRole.TEACHER && course && course.teacherId !== currentUser.id) {
    return <p className="text-center text-muted-foreground">Access Denied. You are not the teacher for this course.</p>;
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleStudentNotesChange = (studentId: string, notes: string) => {
    setStudentAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const onSaveAttendance = async () => {
    if (!selectedDate || !course || selectedDayStatus !== 'class') {
      toast({ title: "Cannot Save", description: "Attendance can only be saved for a selected 'Class Day'.", variant: "destructive"});
      return;
    }
    setIsSavingAttendance(true);
    const payload: TakeAttendancePayload = {
      courseId: course.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      studentStatuses: Object.values(studentAttendanceMap),
    };
    await handleSaveAttendanceRecords(payload);
    setIsSavingAttendance(false);
  };
  
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-200";
      case AttendanceStatus.ABSENT: return "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-200";
      case AttendanceStatus.LATE: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-200";
      case AttendanceStatus.EXCUSED: return "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-200";
    }
  };

  const calendarModifiers = {
    classDay: courseSchedules.filter(cs => cs.courseId === courseId && cs.status === 'class').map(cs => parseISO(cs.id)),
    noClassDay: courseSchedules.filter(cs => cs.courseId === courseId && cs.status === 'no_class').map(cs => parseISO(cs.id)),
  };
  const calendarModifiersClassNames = {
    classDay: 'bg-green-500/20 text-green-800 dark:bg-green-500/30 dark:text-green-200 font-semibold rounded',
    noClassDay: 'bg-red-500/20 text-red-800 dark:bg-red-500/30 dark:text-red-200 line-through rounded',
  };

  const handleSetDayStatus = async (status: 'class' | 'no_class') => {
    if (!selectedDate || !course) return;
    const payload: UpdateCourseDaySchedulePayload = {
      courseId: course.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status,
      notes: dayNotes,
    };
    await handleUpdateCourseDaySchedule(payload);
  };
  
  const handleClearDayStatus = async () => {
    if (!selectedDate || !course) return;
    const payload: ClearCourseDaySchedulePayload = {
      courseId: course.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
    };
    await handleClearCourseDaySchedule(payload);
    setDayNotes(''); 
  };


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} disabled={isContextLoading || isSavingAttendance}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course List / Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Attendance for {course?.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {enrolledStudents.length} enrolled students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="attendance-date" className="text-base font-medium">1. Select Session Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                    id="attendance-date"
                    disabled={isContextLoading || isSavingAttendance}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    modifiers={calendarModifiers}
                    modifiersClassNames={calendarModifiersClassNames}
                    disabled={isContextLoading || isSavingAttendance}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {selectedDate && (
            <div className="space-y-3 p-4 border rounded-md bg-muted/50">
                <Label className="text-base font-medium block">2. Set Day Status for: <span className="text-primary font-semibold">{format(selectedDate, "PPP")}</span></Label>
                 <Input 
                    type="text"
                    placeholder="Optional notes (e.g., Holiday, Special Event)"
                    value={dayNotes}
                    onChange={(e) => setDayNotes(e.target.value)}
                    className="bg-background border-border"
                    disabled={isContextLoading || isSavingAttendance}
                 />
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleSetDayStatus('class')} disabled={selectedDayStatus === 'class' || isContextLoading || isSavingAttendance} variant={selectedDayStatus === 'class' ? 'default' : 'outline'} size="sm">
                        <CalendarPlus className="mr-2 h-4 w-4"/> Mark as Class Day
                    </Button>
                    <Button onClick={() => handleSetDayStatus('no_class')} disabled={selectedDayStatus === 'no_class' || isContextLoading || isSavingAttendance} variant={selectedDayStatus === 'no_class' ? 'destructive' : 'outline'} size="sm">
                        <CalendarX className="mr-2 h-4 w-4"/> Mark as No Class
                    </Button>
                    {selectedDayStatus && (
                        <Button onClick={handleClearDayStatus} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" disabled={isContextLoading || isSavingAttendance}>
                            <Trash2 className="mr-2 h-4 w-4"/> Clear Setting
                        </Button>
                    )}
                </div>
                {selectedDayScheduleDetails && (
                    <p className="text-xs text-muted-foreground">
                        Status: <span className="font-semibold capitalize">{selectedDayScheduleDetails.status.replace('_', ' ')}</span>
                        {selectedDayScheduleDetails.notes && ` - Notes: ${selectedDayScheduleDetails.notes}`}
                    </p>
                )}
            </div>
            )}
          </div>

          {selectedDate && selectedDayStatus === 'class' && enrolledStudents.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-xl font-semibold mb-2">3. Record Attendance</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Student Name</TableHead>
                      <TableHead className="w-[25%]">Status</TableHead>
                      <TableHead className="w-[35%]">Student Notes (Optional)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Select
                            value={studentAttendanceMap[student.id]?.status || AttendanceStatus.PRESENT}
                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            disabled={isContextLoading || isSavingAttendance}
                          >
                            <SelectTrigger className={`w-full ${getStatusColor(studentAttendanceMap[student.id]?.status || AttendanceStatus.PRESENT)} border-0`}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(AttendanceStatus).map(status => (
                                <SelectItem key={status} value={status} className={`focus:${getStatusColor(status)}`}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            placeholder="e.g., Left early"
                            value={studentAttendanceMap[student.id]?.notes || ''}
                            onChange={(e) => handleStudentNotesChange(student.id, e.target.value)}
                            className="bg-input border-input-border"
                            disabled={isContextLoading || isSavingAttendance}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

           {selectedDate && selectedDayStatus === 'no_class' && (
             <Card className="mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400"/>
                        <div>
                            <p className="font-semibold text-yellow-700 dark:text-yellow-300">No Class Scheduled</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                This day is marked as a 'No Class Day'. Attendance is not required.
                                {selectedDayScheduleDetails?.notes && ` Reason: ${selectedDayScheduleDetails.notes}`}
                            </p>
                        </div>
                    </div>
                </CardContent>
             </Card>
          )}
          {selectedDate && !selectedDayStatus && (
             <Card className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                <CardContent className="pt-6">
                     <div className="flex items-center gap-3">
                        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
                        <div>
                            <p className="font-semibold text-blue-700 dark:text-blue-300">Set Day Status</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Please mark this day as a 'Class Day' to take attendance or 'No Class Day' if no session is planned.</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
          )}


          {selectedDate && enrolledStudents.length === 0 && selectedDayStatus === 'class' &&(
             <p className="text-muted-foreground text-center py-4">No students enrolled in this course to take attendance.</p>
          )}
        </CardContent>
        {selectedDate && selectedDayStatus === 'class' && enrolledStudents.length > 0 && (
          <CardFooter>
            <Button onClick={onSaveAttendance} disabled={!selectedDate || enrolledStudents.length === 0 || isContextLoading || isSavingAttendance} className="w-full sm:w-auto">
              {(isContextLoading || isSavingAttendance) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Attendance for {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

