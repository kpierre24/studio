
"use client";

import { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { AttendanceRecord } from '@/types';
import { AttendanceStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Users, BookOpen, Filter, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const ALL_COURSES_VALUE = "all_courses";
const ALL_STATUSES_VALUE = "all_statuses";

export default function AdminAttendancePage() {
  const { state } = useAppContext();
  const { attendanceRecords, users, courses, isLoading: isContextLoading } = state;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(ALL_COURSES_VALUE); // Default to "All Courses"
  const [selectedStatus, setSelectedStatus] = useState(ALL_STATUSES_VALUE);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'Unknown Course';

  const filteredAttendance = useMemo(() => {
    return attendanceRecords
      .filter(ar => {
        const studentName = getUserName(ar.studentId).toLowerCase();
        const courseName = getCourseName(ar.courseId).toLowerCase();
        const term = searchTerm.toLowerCase();
        
        const matchesSearch = studentName.includes(term) || courseName.includes(term) || ar.date.includes(term);
        const matchesCourse = selectedCourse === ALL_COURSES_VALUE ? true : ar.courseId === selectedCourse;
        const matchesStatus = selectedStatus === ALL_STATUSES_VALUE ? true : ar.status === selectedStatus;
        
        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
  }, [attendanceRecords, searchTerm, selectedCourse, selectedStatus, users, courses]);

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
        <CalendarCheck className="h-8 w-8 text-primary" />
        All Attendance Records
      </h1>
      <CardDescription>View and filter all attendance records across the platform.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filters</CardTitle>
           <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <Input
              placeholder="Search by student, course, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-input-border"
            />
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="bg-input border-input-border">
                <SelectValue placeholder="Filter by Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COURSES_VALUE}>All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-input border-input-border">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES_VALUE}>All Statuses</SelectItem>
                {Object.values(AttendanceStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isContextLoading && attendanceRecords.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="mx-auto h-10 w-10 animate-spin mb-2 text-primary" />
                Loading attendance records...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2"/>
              No attendance records match your filters, or no records exist yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                      <TableCell>{getUserName(record.studentId)}</TableCell>
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
