
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, User, Enrollment, EnrollStudentPayload, UnenrollStudentPayload } from '@/types';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, UserMinus, BookOpen, Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function AdminEnrollmentsPage() {
  const { state, handleEnrollStudent, handleUnenrollStudent } = useAppContext();
  const { courses, users, enrollments, isLoading, currentUser } = state;

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTermEnrolled, setSearchTermEnrolled] = useState('');
  const [searchTermAvailable, setSearchTermAvailable] = useState('');
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(null);

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  const courseEnrollments = useMemo(() => {
    if (!selectedCourseId) return [];
    return enrollments.filter(e => e.courseId === selectedCourseId);
  }, [enrollments, selectedCourseId]);

  const enrolledStudentIds = useMemo(() => {
    return courseEnrollments.map(e => e.studentId);
  }, [courseEnrollments]);

  const enrolledStudentsList = useMemo(() => {
    const students = users
      .filter(user => user.role === UserRole.STUDENT && enrolledStudentIds.includes(user.id))
      .filter(user => user.name.toLowerCase().includes(searchTermEnrolled.toLowerCase()) || user.email.toLowerCase().includes(searchTermEnrolled.toLowerCase()));
    return students;
  }, [users, enrolledStudentIds, searchTermEnrolled]);

  const availableStudentsList = useMemo(() => {
    const students = users
      .filter(user => user.role === UserRole.STUDENT && !enrolledStudentIds.includes(user.id))
      .filter(user => user.name.toLowerCase().includes(searchTermAvailable.toLowerCase()) || user.email.toLowerCase().includes(searchTermAvailable.toLowerCase()));
    return students;
  }, [users, enrolledStudentIds, searchTermAvailable]);

  const onEnroll = async (studentId: string) => {
    if (!selectedCourseId) return;
    setProcessingStudentId(studentId);
    await handleEnrollStudent({ courseId: selectedCourseId, studentId });
    setProcessingStudentId(null);
  };

  const onUnenroll = async (studentId: string) => {
    if (!selectedCourseId) return;
    setProcessingStudentId(studentId);
    await handleUnenrollStudent({ courseId: selectedCourseId, studentId });
    setProcessingStudentId(null);
  };
  
  const onEnrollAllAvailable = async () => {
    if (!selectedCourseId || availableStudentsList.length === 0) return;
    setProcessingStudentId('all'); // Indicate bulk operation
    // For simplicity, we call individual enrollments. A true batch API would be better for large numbers.
    for (const student of availableStudentsList) {
        await handleEnrollStudent({ courseId: selectedCourseId, studentId: student.id });
    }
    setProcessingStudentId(null);
  };

  if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
    return <p className="text-center text-muted-foreground py-10">Access Denied. You must be a Super Admin to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <UserPlus className="h-8 w-8 text-primary" />
        Manage Student Enrollments
      </h1>
      <CardDescription>Select a course to manage its student enrollments.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <Select onValueChange={setSelectedCourseId} value={selectedCourseId || undefined}>
            <SelectTrigger className="w-full md:w-1/2 mt-2">
              <SelectValue placeholder="Choose a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        {isLoading && selectedCourseId && <p className="p-6 text-muted-foreground">Loading enrollment data...</p>}
        
        {selectedCourse && (
          <CardContent className="pt-6 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-1">{selectedCourse.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-green-500"/>Enrolled Students ({enrolledStudentsList.length})</CardTitle>
                  <Input 
                    placeholder="Search enrolled students..." 
                    value={searchTermEnrolled} 
                    onChange={(e) => setSearchTermEnrolled(e.target.value)}
                    className="mt-2 bg-input border-input-border"
                  />
                </CardHeader>
                <CardContent>
                  {enrolledStudentsList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No students currently enrolled or matching search.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Avatar</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudentsList.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>
                                <Image src={student.avatarUrl || `https://placehold.co/32x32.png?text=${student.name.substring(0,1)}`} alt={student.name} width={32} height={32} className="rounded-full" data-ai-hint="student avatar" />
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-xs">{student.email}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onUnenroll(student.id)}
                                disabled={isLoading || processingStudentId === student.id}
                              >
                                { (isLoading && processingStudentId === student.id) ? <Loader2 className="animate-spin"/> : <UserMinus className="mr-1 h-4 w-4" />}
                                Unenroll
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserPlus className="h-6 w-6 text-blue-500"/>Available Students ({availableStudentsList.length})</CardTitle>
                   <Input 
                    placeholder="Search available students..." 
                    value={searchTermAvailable} 
                    onChange={(e) => setSearchTermAvailable(e.target.value)}
                    className="mt-2 bg-input border-input-border"
                  />
                </CardHeader>
                <CardContent>
                  {availableStudentsList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">All students are enrolled or no students match search.</p>
                  ) : (
                    <>
                    <Button 
                        onClick={onEnrollAllAvailable} 
                        disabled={isLoading || processingStudentId === 'all' || availableStudentsList.length === 0} 
                        className="w-full mb-4"
                        variant="secondary"
                    >
                        {(isLoading && processingStudentId === 'all') ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" /> }
                        Enroll All ({availableStudentsList.length}) Available Students
                    </Button>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Avatar</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableStudentsList.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>
                                <Image src={student.avatarUrl || `https://placehold.co/32x32.png?text=${student.name.substring(0,1)}`} alt={student.name} width={32} height={32} className="rounded-full" data-ai-hint="student avatar" />
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-xs">{student.email}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                onClick={() => onEnroll(student.id)}
                                disabled={isLoading || processingStudentId === student.id}
                              >
                                {(isLoading && processingStudentId === student.id) ? <Loader2 className="animate-spin"/> : <UserPlus className="mr-1 h-4 w-4" />}
                                Enroll
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
         {!selectedCourseId && !isLoading && (
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-10">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2"/>
                    Please select a course above to manage its enrollments.
                </p>
            </CardContent>
        )}
      </Card>
    </div>
  );
}
