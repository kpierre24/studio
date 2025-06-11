
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Payment, User, Course, RecordPaymentPayload, UpdatePaymentPayload, DeletePaymentPayload } from '@/types';
import { UserRole, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Edit, Trash2, DollarSign, Filter, Users, BookOpen, CheckCircle, AlertCircle, Loader2, CalendarIcon, Search, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const ALL_COURSES_VALUE = "all_courses";
const ALL_STATUSES_VALUE = "all_statuses";

type PaymentFormData = Omit<RecordPaymentPayload, 'id'> & { id?: string };

const initialPaymentFormData: PaymentFormData = {
  studentId: '',
  courseId: '',
  amount: 0,
  status: PaymentStatus.PENDING,
  paymentDate: new Date().toISOString().split('T')[0], 
  transactionId: '',
  notes: '',
};

interface StudentCourseBalanceInfo {
  courseCost: number;
  totalPaid: number;
  amountOwed: number;
  isFullyPaid: boolean;
  warningMessage?: string;
}

export default function AdminPaymentsPage() {
  const { state, handleRecordPayment, handleUpdatePayment, handleDeletePayment } = useAppContext();
  const { payments, users, courses, currentUser, isLoading } = state;
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(ALL_COURSES_VALUE);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(ALL_STATUSES_VALUE);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>(initialPaymentFormData);
  const [studentCourseBalanceInfo, setStudentCourseBalanceInfo] = useState<StudentCourseBalanceInfo | null>(null);

  const studentUsers = useMemo(() => users.filter(u => u.role === UserRole.STUDENT), [users]);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'Unknown Course';

  useEffect(() => {
    if (!isPaymentModalOpen) {
        setStudentCourseBalanceInfo(null);
        return;
    }

    if (paymentFormData.studentId && paymentFormData.courseId) {
        const course = courses.find(c => c.id === paymentFormData.courseId);
        if (!course) {
            setStudentCourseBalanceInfo(null);
            return;
        }

        const courseCost = course.cost || 0;
        const paidPayments = payments.filter(p => 
            p.studentId === paymentFormData.studentId && 
            p.courseId === paymentFormData.courseId && 
            p.status === PaymentStatus.PAID &&
            (!editingPaymentId || p.id !== editingPaymentId) // Exclude current payment if editing
        );
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const amountOwed = Math.max(0, courseCost - totalPaid);
        const isFullyPaid = amountOwed === 0 && courseCost > 0;
        
        let warningMessage = '';
        const currentPaymentAmount = Number(paymentFormData.amount) || 0;

        if (isFullyPaid && currentPaymentAmount > 0 && (!editingPaymentId || payments.find(p=>p.id === editingPaymentId)?.amount !== currentPaymentAmount)) {
             warningMessage = "This course is already fully paid. Recording another payment will result in overpayment.";
        } else if (!isFullyPaid && totalPaid + currentPaymentAmount > courseCost) {
             warningMessage = `This payment of $${currentPaymentAmount.toFixed(2)} will result in an overpayment of $${((totalPaid + currentPaymentAmount) - courseCost).toFixed(2)}.`;
        }


        setStudentCourseBalanceInfo({
            courseCost,
            totalPaid,
            amountOwed: isFullyPaid && currentPaymentAmount > 0 && editingPaymentId && payments.find(p=>p.id === editingPaymentId)?.amount === currentPaymentAmount ? 0 : amountOwed,
            isFullyPaid,
            warningMessage,
        });

    } else {
        setStudentCourseBalanceInfo(null);
    }
  }, [paymentFormData.studentId, paymentFormData.courseId, paymentFormData.amount, isPaymentModalOpen, courses, payments, editingPaymentId]);


  const filteredPayments = useMemo(() => {
    return payments
      .filter(payment => {
        const studentName = getUserName(payment.studentId).toLowerCase();
        const courseName = getCourseName(payment.courseId).toLowerCase();
        const term = searchTerm.toLowerCase();
        
        const matchesSearch = studentName.includes(term) || 
                              courseName.includes(term) || 
                              (payment.transactionId || '').toLowerCase().includes(term);
        const matchesCourse = selectedCourseFilter === ALL_COURSES_VALUE ? true : payment.courseId === selectedCourseFilter;
        const matchesStatus = selectedStatusFilter === ALL_STATUSES_VALUE ? true : payment.status === selectedStatusFilter;
        
        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime());
  }, [payments, searchTerm, selectedCourseFilter, selectedStatusFilter, users, courses]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      case PaymentStatus.PENDING:
        return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"><AlertCircle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3.5 w-3.5" /> {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenPaymentModal = (payment?: Payment) => {
    if (payment) {
      setEditingPaymentId(payment.id);
      setPaymentFormData({
        studentId: payment.studentId,
        courseId: payment.courseId,
        amount: payment.amount,
        status: payment.status,
        paymentDate: payment.paymentDate ? format(parseISO(payment.paymentDate), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
        transactionId: payment.transactionId || '',
        notes: payment.notes || '',
        id: payment.id,
      });
    } else {
      setEditingPaymentId(null);
      setPaymentFormData(initialPaymentFormData);
    }
    setIsPaymentModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (name: keyof PaymentFormData, value: string) => {
    setPaymentFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setPaymentFormData(prev => ({ ...prev, paymentDate: format(date, 'yyyy-MM-dd') }));
    }
  };

  const validateForm = (): boolean => {
    if (!paymentFormData.studentId || !paymentFormData.courseId || paymentFormData.amount <= 0 || !paymentFormData.paymentDate) {
      toast({ title: "Validation Error", description: "Student, Course, Amount (positive), and Payment Date are required.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handlePaymentSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...paymentFormData,
      paymentDate: new Date(paymentFormData.paymentDate!).toISOString(), 
    };
    
    if (editingPaymentId && paymentFormData.id) {
      await handleUpdatePayment(payload as UpdatePaymentPayload);
    } else {
      await handleRecordPayment(payload as RecordPaymentPayload);
    }

    if (!state.error) {
      setIsPaymentModalOpen(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    await handleDeletePayment({ id: paymentToDelete.id });
    if (!state.error) {
      setPaymentToDelete(null);
    }
  };

  if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
    return <p className="text-center text-muted-foreground py-10">Access Denied. You must be a Super Admin to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          Manage Payments
        </h1>
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenPaymentModal()} disabled={isLoading}>
              <PlusCircle className="mr-2 h-5 w-5" /> Record New Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingPaymentId ? 'Edit Payment Record' : 'Record New Payment'}</DialogTitle>
              <DialogDescription>
                Fill in the payment details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="studentId">Student</Label>
                <Select value={paymentFormData.studentId} onValueChange={(value) => handleSelectChange('studentId', value)} disabled={isLoading}>
                  <SelectTrigger id="studentId"><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {studentUsers.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name} ({student.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="courseId">Course</Label>
                <Select value={paymentFormData.courseId} onValueChange={(value) => handleSelectChange('courseId', value)} disabled={isLoading}>
                  <SelectTrigger id="courseId"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name} (Cost: ${course.cost.toFixed(2)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {studentCourseBalanceInfo && (
                <Card className="bg-muted/50 p-3 text-sm">
                  <CardContent className="p-0 space-y-1">
                    <p>Course Cost: <span className="font-semibold">${studentCourseBalanceInfo.courseCost.toFixed(2)}</span></p>
                    <p>Total Paid (excluding this payment if editing): <span className="font-semibold text-green-600">${studentCourseBalanceInfo.totalPaid.toFixed(2)}</span></p>
                    <p>Amount Currently Owed: <span className={`font-bold ${studentCourseBalanceInfo.amountOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${studentCourseBalanceInfo.amountOwed.toFixed(2)}
                    </span></p>
                    {studentCourseBalanceInfo.isFullyPaid && !editingPaymentId && (
                      <Badge className="bg-green-500 mt-1">Course Fully Paid</Badge>
                    )}
                    {studentCourseBalanceInfo.isFullyPaid && editingPaymentId && studentCourseBalanceInfo.amountOwed === 0 && (
                      <Badge className="bg-green-500 mt-1">Course Fully Paid</Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-1">
                <Label htmlFor="amount">Amount Paid</Label>
                <Input id="amount" name="amount" type="number" value={paymentFormData.amount} onChange={handleFormChange} placeholder="0.00" disabled={isLoading}/>
              </div>
                {studentCourseBalanceInfo?.warningMessage && (
                    <div className="p-2 my-1 text-xs bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-center gap-1">
                       <Info className="h-4 w-4 shrink-0"/> {studentCourseBalanceInfo.warningMessage}
                    </div>
                )}

              <div className="space-y-1">
                <Label htmlFor="status">Payment Status</Label>
                <Select value={paymentFormData.status} onValueChange={(value) => handleSelectChange('status', value as PaymentStatus)} disabled={isLoading}>
                  <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentStatus).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="paymentDate"
                        variant={"outline"}
                        className={("w-full justify-start text-left font-normal")}
                        disabled={isLoading}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentFormData.paymentDate ? format(parseISO(paymentFormData.paymentDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={paymentFormData.paymentDate ? parseISO(paymentFormData.paymentDate) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={isLoading}
                    />
                    </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input id="transactionId" name="transactionId" value={paymentFormData.transactionId} onChange={handleFormChange} placeholder="e.g., ch_123abc" disabled={isLoading}/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" value={paymentFormData.notes} onChange={handleFormChange} placeholder="Any relevant notes..." disabled={isLoading}/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
              <Button type="submit" onClick={handlePaymentSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {editingPaymentId ? 'Save Changes' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Payment Filters</CardTitle>
           <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <Input
              placeholder="Search by student, course, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-input-border"
              disabled={isLoading}
            />
            <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter} disabled={isLoading}>
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
            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter} disabled={isLoading}>
              <SelectTrigger className="bg-input border-input-border">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES_VALUE}>All Statuses</SelectItem>
                {Object.values(PaymentStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">Loading payments...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2"/>
              No payments match your filters, or no payment records exist yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentDate ? format(parseISO(payment.paymentDate), "PPP") : 'N/A'}</TableCell>
                      <TableCell>{getUserName(payment.studentId)}</TableCell>
                      <TableCell>{getCourseName(payment.courseId)}</TableCell>
                      <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-xs">{payment.transactionId || 'N/A'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={payment.notes || undefined}>{payment.notes || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenPaymentModal(payment)} disabled={isLoading}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog open={!!paymentToDelete && paymentToDelete.id === payment.id} onOpenChange={(isOpen) => !isOpen && setPaymentToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setPaymentToDelete(payment)} disabled={isLoading}>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the payment record of ${paymentToDelete?.amount.toFixed(2)} for {getUserName(paymentToDelete?.studentId || '')} in course {getCourseName(paymentToDelete?.courseId || '')}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setPaymentToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDeletePayment} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, delete payment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
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
