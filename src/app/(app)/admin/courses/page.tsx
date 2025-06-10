
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, User, CreateCoursePayload, UpdateCoursePayload, DeleteCoursePayload } from '@/types'; 
import { ActionType, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface AdminCourseFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  teacherId: string; 
  prerequisites?: string[];
}

const initialCourseFormData: AdminCourseFormData = {
  name: '',
  description: '',
  category: '',
  cost: 0,
  teacherId: 'unassigned',
  prerequisites: [],
};

export default function AdminCoursesPage() {
  const { state, handleCreateCourse, handleUpdateCourse, handleDeleteCourse } = useAppContext();
  const { courses, users, currentUser, isLoading } = state;
  const { toast } = useToast();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState<AdminCourseFormData>(initialCourseFormData);
  
  const teachers = useMemo(() => users.filter(u => u.role === UserRole.TEACHER), [users]);

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setCourseFormData({
        id: course.id,
        name: course.name,
        description: course.description,
        category: course.category || '',
        cost: course.cost || 0,
        teacherId: course.teacherId || 'unassigned',
        prerequisites: course.prerequisites || [],
      });
    } else {
      setCourseFormData(initialCourseFormData);
    }
    setIsCourseModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) || 0 : value }));
  };

  const handleTeacherChange = (value: string) => {
    setCourseFormData(prev => ({ ...prev, teacherId: value }));
  };

  const validateForm = (): boolean => {
    if (!courseFormData.name.trim() || !courseFormData.description.trim()) {
      toast({ title: "Validation Error", description: "Course Name and Description are required.", variant: "destructive" });
      return false;
    }
    if (courseFormData.teacherId === 'unassigned') {
        toast({ title: "Info", description: "Please assign a teacher to this course or acknowledge it's unassigned.", variant: "default"});
        // Allow unassigned if intended, or make it an error
    }
    return true;
  };

  const handleCourseSubmit = async () => {
    if (!validateForm()) return;

    const payload: CreateCoursePayload | UpdateCoursePayload = {
      ...courseFormData,
      // id is already in courseFormData if editing
    };
    
    if (courseFormData.id) {
        await handleUpdateCourse(payload as UpdateCoursePayload);
    } else {
        await handleCreateCourse(payload as CreateCoursePayload);
    }

    if (!state.error) { // Check if context operation set an error
        setIsCourseModalOpen(false);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    const course = courses.find(c => c.id === courseToDelete.id);
    if (course && course.studentIds.length > 0) {
        toast({
            title: "Cannot Delete Course",
            description: `Course "${course.name}" has enrolled students. Please unenroll students before deleting.`,
            variant: "destructive"
        });
        setCourseToDelete(null);
        return;
    }
    await handleDeleteCourse({ id: courseToDelete.id });
    if (!state.error) {
        setCourseToDelete(null); 
    }
  };

  const getTeacherName = (teacherId: string) => {
    if (teacherId === 'unassigned') return <span className="italic text-muted-foreground">Unassigned</span>;
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : <span className="italic text-muted-foreground">Unknown Teacher</span>;
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Manage All Courses</h1>
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenCourseModal()} disabled={isLoading}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{courseFormData.id ? 'Edit Course' : 'Create New Course'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the course. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={courseFormData.name} onChange={handleFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={courseFormData.description} onChange={handleFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={courseFormData.category} onChange={handleFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Cost ($)</Label>
                <Input id="cost" name="cost" type="number" value={courseFormData.cost} onChange={handleFormChange} className="col-span-3" disabled={isLoading}/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teacherId" className="text-right">Teacher</Label>
                <Select value={courseFormData.teacherId} onValueChange={handleTeacherChange} disabled={isLoading}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleCourseSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && courses.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Loading courses...</p>
      ) : courses.length === 0 ? (
        <Card>
            <CardContent className="pt-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No courses found in the system.</p>
                <p className="text-muted-foreground">Start by adding your first course using the 'Add New Course' button.</p>
                 <Button onClick={() => handleOpenCourseModal()} className="mt-4" disabled={isLoading}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add First Course
                </Button>
            </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <Link href={`/teacher/courses/${course.id}`} className="hover:underline text-primary">
                      {course.name}
                  </Link>
                </TableCell>
                <TableCell>{getTeacherName(course.teacherId)}</TableCell>
                <TableCell>{course.category || 'N/A'}</TableCell>
                <TableCell>{course.studentIds.length}</TableCell>
                <TableCell>${course.cost || 0}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenCourseModal(course)} disabled={isLoading}>
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog open={!!courseToDelete && courseToDelete.id === course.id} onOpenChange={(isOpen) => !isOpen && setCourseToDelete(null)}>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => setCourseToDelete(course)} disabled={isLoading}>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the course: <span className="font-semibold">{courseToDelete?.name}</span>.
                              {courseToDelete && courseToDelete.studentIds.length > 0 && <strong className="block mt-2 text-destructive-foreground bg-destructive p-2 rounded-md">Warning: This course has {courseToDelete.studentIds.length} student(s) enrolled. Deletion is blocked. Unenroll students first.</strong>}
                              Associated lessons and assignments will also be removed from local state. Submissions and files in storage will need manual cleanup.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCourseToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                              onClick={confirmDeleteCourse}
                              disabled={(courseToDelete && courseToDelete.studentIds.length > 0) || isLoading}
                          >
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                              Yes, delete course
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
