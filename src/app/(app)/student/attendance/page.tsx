
"use client";

import { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { AttendanceRecord } from '@/types';
import { AttendanceStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentAttendancePage() {
  const { state } = useAppContext();
  const { currentUser, attendanceRecords, courses } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  const studentAttendance = useMemo(() => {
    return attendanceRecords
      .filter(ar => ar.studentId === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
  }, [attendanceRecords, currentUser.id]);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      case AttendanceStatus.ABSENT:
        return <Badge variant="destructive"><XCircle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      case AttendanceStatus.LATE:
        return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"><AlertTriangle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      case AttendanceStatus.EXCUSED:
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><Info className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <CalendarDays className="h-8 w-8 text-primary" />
        My Attendance Records
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Here are your attendance records for all enrolled courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentAttendance.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No attendance records found for you yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAttendance.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                      <TableCell>{getCourseName(record.courseId)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
