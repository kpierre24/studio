
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { User, Course, AttendanceRecord, TakeAttendancePayload } from '@/types';
import { ActionType, AttendanceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, ArrowLeft, Users, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type StudentAttendanceState = {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
};

export default function CourseAttendancePage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { currentUser, courses, users, attendanceRecords } = state;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, StudentAttendanceState>>({});

  const course = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);
  const enrolledStudents = useMemo(() => {
    if (!course) return [];
    return users.filter(u => course.studentIds.includes(u.id));
  }, [course, users]);

  // Load existing attendance for the selected date and course
  useEffect(() => {
    if (!selectedDate || !course) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newAttendanceMap: Record<string, StudentAttendanceState> = {};

    enrolledStudents.forEach(student => {
      const existingRecord = attendanceRecords.find(
        ar => ar.courseId === courseId && ar.studentId === student.id && ar.date === dateStr
      );
      newAttendanceMap[student.id] = {
        studentId: student.id,
        status: existingRecord?.status || AttendanceStatus.PRESENT, // Default to Present
        notes: existingRecord?.notes || '',
      };
    });
    setStudentAttendanceMap(newAttendanceMap);
  }, [selectedDate, course, enrolledStudents, attendanceRecords, courseId]);


  if (!currentUser || currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.SUPER_ADMIN ) {
     // Add SuperAdmin check if they should also manage this
    return <p className="text-center text-muted-foreground">Access Denied. You must be a teacher for this course.</p>;
  }
  
  if (!course) {
    return <p className="text-center text-muted-foreground">Course not found.</p>;
  }
  if (currentUser.role === UserRole.TEACHER && course.teacherId !== currentUser.id) {
    return <p className="text-center text-muted-foreground">Access Denied. You are not the teacher for this course.</p>;
  }


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudentAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedDate || !course) return;

    const payload: TakeAttendancePayload = {
      courseId: course.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      studentStatuses: Object.values(studentAttendanceMap),
    };
    dispatch({ type: ActionType.TAKE_ATTENDANCE, payload });
  };
  
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return "bg-green-100 text-green-700";
      case AttendanceStatus.ABSENT: return "bg-red-100 text-red-700";
      case AttendanceStatus.LATE: return "bg-yellow-100 text-yellow-700";
      case AttendanceStatus.EXCUSED: return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course List / Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Attendance for {course.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {enrolledStudents.length} enrolled students.
            Select a date to take or view attendance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="attendance-date" className="text-base font-medium">Session Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal mt-1"
                  id="attendance-date"
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && enrolledStudents.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Student Name</TableHead>
                    <TableHead className="w-[25%]">Status</TableHead>
                    <TableHead className="w-[35%]">Notes (Optional)</TableHead>
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
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          className="bg-input border-input-border"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {selectedDate && enrolledStudents.length === 0 && (
             <p className="text-muted-foreground text-center py-4">No students enrolled in this course to take attendance.</p>
          )}


          <Button onClick={handleSaveAttendance} disabled={!selectedDate || enrolledStudents.length === 0} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Save Attendance for {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

