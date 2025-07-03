
"use client";

import { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Course, Payment } from '@/types';
import { PaymentStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Banknote, CheckCircle, AlertCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StudentPaymentSummary {
  course: Course;
  totalPaid: number;
  amountOwed: number;
  isFullyPaid: boolean;
  paymentHistory: Payment[];
}

export default function StudentPaymentsPage() {
  const { state } = useAppContext();
  const { currentUser, courses, enrollments, payments } = state;

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Loading user data...</p>;
  }

  const paymentSummaries = useMemo(() => {
    const studentEnrolledCourseIds = enrollments
      .filter(e => e.studentId === currentUser.id)
      .map(e => e.courseId);

    const enrolledStudentCourses = courses.filter(c => studentEnrolledCourseIds.includes(c.id));

    return enrolledStudentCourses.map(course => {
      const coursePayments = payments.filter(
        p => p.studentId === currentUser.id && p.courseId === course.id && p.status === PaymentStatus.PAID
      );
      const totalPaid = coursePayments.reduce((sum, p) => sum + p.amount, 0);
      const amountOwed = Math.max(0, (course.cost || 0) - totalPaid);
      const isFullyPaid = amountOwed === 0 && (course.cost || 0) > 0;

      const paymentHistory = payments.filter(p => p.studentId === currentUser.id && p.courseId === course.id)
                                      .sort((a,b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime());


      return {
        course,
        totalPaid,
        amountOwed,
        isFullyPaid,
        paymentHistory,
      };
    });
  }, [currentUser.id, courses, enrollments, payments]);

  const overallTotalOwed = paymentSummaries.reduce((sum, summary) => sum + summary.amountOwed, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          My Payments
        </h1>
        <div className="mt-2 md:mt-0">
          {overallTotalOwed > 0 ? (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              <AlertCircle className="mr-2 h-5 w-5" />
              Total Outstanding: ${overallTotalOwed.toFixed(2)}
            </Badge>
          ) : (
            <Badge className="text-lg px-4 py-2 bg-green-500 hover:bg-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              All dues cleared!
            </Badge>
          )}
        </div>
      </div>

      {paymentSummaries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Payment Information Found.</p>
            <p className="text-muted-foreground">This may be because you are not enrolled in any courses with a cost, or payment data is not yet available.</p>
            <Button asChild className="mt-4">
              <Link href="/student/courses">View My Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paymentSummaries.map(summary => (
            <Card key={summary.course.id} className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <CardTitle className="text-2xl hover:text-primary">
                    <Link href={`/student/courses/${summary.course.id}`}>{summary.course.name}</Link>
                  </CardTitle>
                  {summary.isFullyPaid ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-sm"><CheckCircle className="mr-1 h-4 w-4" /> Fully Paid</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-sm"><AlertCircle className="mr-1 h-4 w-4" /> Outstanding Balance</Badge>
                  )}
                </div>
                <CardDescription>Category: {summary.course.category || "N/A"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-base mb-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Course Cost</p>
                    <p className="font-semibold text-lg">${(summary.course.cost || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="font-semibold text-lg text-green-600">${summary.totalPaid.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-md ${summary.amountOwed > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <p className={`text-sm ${summary.amountOwed > 0 ? 'text-red-700 dark:text-red-200' : 'text-green-700 dark:text-green-200'}`}>Amount Owing</p>
                    <p className={`font-semibold text-lg ${summary.amountOwed > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
                      ${summary.amountOwed.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {summary.paymentHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-md">Payment History:</h4>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount Paid</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Transaction ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.paymentHistory.map(payment => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.paymentDate ? format(new Date(payment.paymentDate), "PPP") : 'N/A'}</TableCell>
                              <TableCell>${payment.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={payment.status === PaymentStatus.PAID ? 'default' : payment.status === PaymentStatus.FAILED ? 'destructive' : 'secondary'}
                                  className={payment.status === PaymentStatus.PAID ? 'bg-green-500 hover:bg-green-600' : ''}
                                >{payment.status}</Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{payment.transactionId || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                {summary.paymentHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">No payment history for this course.</p>
                )}

              </CardContent>
              {!summary.isFullyPaid && (summary.course.cost || 0) > 0 && (
                <CardFooter>
                   <p className="text-xs text-muted-foreground">
                     Please contact administration to settle any outstanding balances. (Payment gateway integration coming soon!)
                   </p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
