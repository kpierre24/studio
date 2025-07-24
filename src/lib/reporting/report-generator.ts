import { 
  ReportConfig, 
  ReportData, 
  ReportType, 
  ReportSummary,
  AnalyticsMetric 
} from '@/types/reporting';
import { 
  User, 
  Course, 
  Assignment, 
  Submission, 
  AttendanceRecord, 
  Payment,
  UserRole 
} from '@/types';

export class ReportGenerator {
  private static instance: ReportGenerator;

  public static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  async generateReport(
    config: ReportConfig,
    parameters: Record<string, any>,
    data: {
      users: User[];
      courses: Course[];
      assignments: Assignment[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
      payments: Payment[];
    }
  ): Promise<ReportData> {
    const startTime = Date.now();

    try {
      let reportData: any[] = [];
      let summary: ReportSummary | undefined;

      switch (config.type) {
        case ReportType.STUDENT_PERFORMANCE:
          reportData = this.generateStudentPerformanceReport(data, parameters);
          summary = this.generateStudentPerformanceSummary(reportData);
          break;
        
        case ReportType.COURSE_ANALYTICS:
          reportData = this.generateCourseAnalyticsReport(data, parameters);
          summary = this.generateCourseAnalyticsSummary(reportData);
          break;
        
        case ReportType.ATTENDANCE_SUMMARY:
          reportData = this.generateAttendanceSummaryReport(data, parameters);
          summary = this.generateAttendanceSummary(reportData);
          break;
        
        case ReportType.GRADE_DISTRIBUTION:
          reportData = this.generateGradeDistributionReport(data, parameters);
          summary = this.generateGradeDistributionSummary(reportData);
          break;
        
        case ReportType.ENGAGEMENT_METRICS:
          reportData = this.generateEngagementMetricsReport(data, parameters);
          summary = this.generateEngagementSummary(reportData);
          break;
        
        case ReportType.FINANCIAL_SUMMARY:
          reportData = this.generateFinancialSummaryReport(data, parameters);
          summary = this.generateFinancialSummary(reportData);
          break;
        
        case ReportType.COMPARATIVE_ANALYSIS:
          reportData = this.generateComparativeAnalysisReport(data, parameters);
          summary = this.generateComparativeSummary(reportData);
          break;
        
        default:
          throw new Error(`Unsupported report type: ${config.type}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        id: `report_${Date.now()}`,
        reportId: config.id,
        data: reportData,
        metadata: {
          generatedAt: new Date(),
          parameters,
          totalRecords: reportData.length,
          executionTime
        },
        summary
      };
    } catch (error) {
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateStudentPerformanceReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, studentId, dateRange } = parameters;
    const students = data.users.filter((u: User) => u.role === UserRole.STUDENT);
    
    return students.map((student: User) => {
      const studentSubmissions = data.submissions.filter((s: Submission) => 
        s.studentId === student.id &&
        (!courseId || data.assignments.find((a: Assignment) => a.id === s.assignmentId)?.courseId === courseId)
      );

      const grades = studentSubmissions
        .filter((s: Submission) => s.grade !== undefined)
        .map((s: Submission) => s.grade!);

      const averageGrade = grades.length > 0 
        ? grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length 
        : 0;

      const attendanceRecords = data.attendance.filter((a: AttendanceRecord) => 
        a.studentId === student.id &&
        (!courseId || a.courseId === courseId)
      );

      const attendanceRate = attendanceRecords.length > 0
        ? (attendanceRecords.filter((a: any) => a.status === 'Present').length / attendanceRecords.length) * 100
        : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        averageGrade: Math.round(averageGrade * 100) / 100,
        totalSubmissions: studentSubmissions.length,
        gradedSubmissions: grades.length,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lastSubmission: studentSubmissions.length > 0 
          ? Math.max(...studentSubmissions.map((s: any) => new Date(s.submittedAt).getTime()))
          : null,
        courseId: courseId || 'all'
      };
    });
  }

  private generateCourseAnalyticsReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, dateRange } = parameters;
    const courses = courseId 
      ? data.courses.filter((c: Course) => c.id === courseId)
      : data.courses;

    return courses.map((course: Course) => {
      const courseAssignments = data.assignments.filter((a: Assignment) => a.courseId === course.id);
      const courseSubmissions = data.submissions.filter((s: Submission) => 
        courseAssignments.some((a: any) => a.id === s.assignmentId)
      );

      const enrolledStudents = course.studentIds.length;
      const activeStudents = new Set(courseSubmissions.map((s: any) => s.studentId)).size;
      
      const grades = courseSubmissions
        .filter((s: any) => s.grade !== undefined)
        .map((s: any) => s.grade!);

      const averageGrade = grades.length > 0 
        ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
        : 0;

      const completionRate = courseAssignments.length > 0
        ? (courseSubmissions.length / (courseAssignments.length * enrolledStudents)) * 100
        : 0;

      return {
        courseId: course.id,
        courseName: course.name,
        teacherId: course.teacherId,
        enrolledStudents,
        activeStudents,
        totalAssignments: courseAssignments.length,
        totalSubmissions: courseSubmissions.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        engagementScore: Math.round((activeStudents / enrolledStudents) * 100)
      };
    });
  }

  private generateAttendanceSummaryReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, dateRange } = parameters;
    
    const attendanceRecords = data.attendance.filter((a: AttendanceRecord) => 
      !courseId || a.courseId === courseId
    );

    const groupedByStudent = attendanceRecords.reduce((acc: any, record: AttendanceRecord) => {
      if (!acc[record.studentId]) {
        acc[record.studentId] = [];
      }
      acc[record.studentId].push(record);
      return acc;
    }, {});

    return Object.entries(groupedByStudent).map(([studentId, records]: [string, any]) => {
      const student = data.users.find((u: User) => u.id === studentId);
      const totalDays = records.length;
      const presentDays = records.filter((r: AttendanceRecord) => r.status === 'Present').length;
      const lateDays = records.filter((r: AttendanceRecord) => r.status === 'Late').length;
      const absentDays = records.filter((r: AttendanceRecord) => r.status === 'Absent').length;
      const excusedDays = records.filter((r: AttendanceRecord) => r.status === 'Excused').length;

      return {
        studentId,
        studentName: student?.name || 'Unknown',
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        excusedDays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
        punctualityRate: totalDays > 0 ? Math.round(((presentDays - lateDays) / totalDays) * 100) : 0
      };
    });
  }

  private generateGradeDistributionReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, assignmentId } = parameters;
    
    let submissions = data.submissions.filter((s: Submission) => s.grade !== undefined);
    
    if (courseId) {
      const courseAssignments = data.assignments.filter((a: Assignment) => a.courseId === courseId);
      submissions = submissions.filter((s: Submission) => 
        courseAssignments.some((a: any) => a.id === s.assignmentId)
      );
    }
    
    if (assignmentId) {
      submissions = submissions.filter((s: Submission) => s.assignmentId === assignmentId);
    }

    const gradeRanges = [
      { range: 'A (90-100)', min: 90, max: 100 },
      { range: 'B (80-89)', min: 80, max: 89 },
      { range: 'C (70-79)', min: 70, max: 79 },
      { range: 'D (60-69)', min: 60, max: 69 },
      { range: 'F (0-59)', min: 0, max: 59 }
    ];

    return gradeRanges.map(gradeRange => {
      const count = submissions.filter((s: Submission) => 
        s.grade! >= gradeRange.min && s.grade! <= gradeRange.max
      ).length;

      return {
        gradeRange: gradeRange.range,
        count,
        percentage: submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0
      };
    });
  }

  private generateEngagementMetricsReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, dateRange } = parameters;
    
    const students = data.users.filter((u: User) => u.role === UserRole.STUDENT);
    
    return students.map((student: User) => {
      const studentSubmissions = data.submissions.filter((s: Submission) => 
        s.studentId === student.id
      );

      const recentSubmissions = studentSubmissions.filter((s: Submission) => {
        const submissionDate = new Date(s.submittedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return submissionDate >= thirtyDaysAgo;
      });

      const onTimeSubmissions = studentSubmissions.filter((s: Submission) => {
        const assignment = data.assignments.find((a: Assignment) => a.id === s.assignmentId);
        if (!assignment) return false;
        return new Date(s.submittedAt) <= new Date(assignment.dueDate);
      });

      return {
        studentId: student.id,
        studentName: student.name,
        totalSubmissions: studentSubmissions.length,
        recentSubmissions: recentSubmissions.length,
        onTimeSubmissions: onTimeSubmissions.length,
        lateSubmissions: studentSubmissions.length - onTimeSubmissions.length,
        engagementScore: this.calculateEngagementScore(studentSubmissions, data.assignments),
        lastActivity: studentSubmissions.length > 0 
          ? new Date(Math.max(...studentSubmissions.map((s: any) => new Date(s.submittedAt).getTime())))
          : null
      };
    });
  }

  private generateFinancialSummaryReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { courseId, dateRange } = parameters;
    
    let payments = data.payments;
    if (courseId) {
      payments = payments.filter((p: Payment) => p.courseId === courseId);
    }

    const courses = courseId 
      ? data.courses.filter((c: Course) => c.id === courseId)
      : data.courses;

    return courses.map((course: Course) => {
      const coursePayments = payments.filter((p: Payment) => p.courseId === course.id);
      const totalRevenue = coursePayments
        .filter((p: Payment) => p.status === 'Paid')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      const pendingRevenue = coursePayments
        .filter((p: Payment) => p.status === 'Pending')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      const enrolledStudents = course.studentIds.length;
      const paidStudents = new Set(
        coursePayments
          .filter((p: Payment) => p.status === 'Paid')
          .map((p: Payment) => p.studentId)
      ).size;

      return {
        courseId: course.id,
        courseName: course.name,
        courseCost: course.cost,
        enrolledStudents,
        paidStudents,
        totalRevenue,
        pendingRevenue,
        collectionRate: enrolledStudents > 0 ? Math.round((paidStudents / enrolledStudents) * 100) : 0,
        expectedRevenue: enrolledStudents * course.cost
      };
    });
  }

  private generateComparativeAnalysisReport(
    data: any,
    parameters: Record<string, any>
  ): any[] {
    const { comparisonType, baselineId, comparisonIds } = parameters;
    
    // This would implement comparative analysis logic
    // For now, returning a basic structure
    return [{
      comparisonType,
      baselineId,
      comparisonIds,
      results: 'Comparative analysis implementation needed'
    }];
  }

  private calculateEngagementScore(submissions: Submission[], assignments: Assignment[]): number {
    if (submissions.length === 0) return 0;
    
    let score = 0;
    const weights = {
      submission: 0.4,
      timeliness: 0.3,
      quality: 0.3
    };

    // Submission rate
    const submissionRate = submissions.length / assignments.length;
    score += submissionRate * weights.submission * 100;

    // Timeliness
    const onTimeSubmissions = submissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignmentId);
      return assignment && new Date(s.submittedAt) <= new Date(assignment.dueDate);
    });
    const timelinessRate = onTimeSubmissions.length / submissions.length;
    score += timelinessRate * weights.timeliness * 100;

    // Quality (based on grades)
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
    if (gradedSubmissions.length > 0) {
      const averageGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade!, 0) / gradedSubmissions.length;
      score += (averageGrade / 100) * weights.quality * 100;
    }

    return Math.round(score);
  }

  private generateStudentPerformanceSummary(data: any[]): ReportSummary {
    const totalStudents = data.length;
    const averageGrade = data.reduce((sum, student) => sum + student.averageGrade, 0) / totalStudents;
    const averageAttendance = data.reduce((sum, student) => sum + student.attendanceRate, 0) / totalStudents;

    return {
      keyMetrics: [
        { label: 'Total Students', value: totalStudents },
        { label: 'Average Grade', value: `${Math.round(averageGrade)}%` },
        { label: 'Average Attendance', value: `${Math.round(averageAttendance)}%` }
      ],
      insights: [
        `${totalStudents} students analyzed`,
        `Class average grade is ${Math.round(averageGrade)}%`,
        `Average attendance rate is ${Math.round(averageAttendance)}%`
      ]
    };
  }

  private generateCourseAnalyticsSummary(data: any[]): ReportSummary {
    const totalCourses = data.length;
    const totalStudents = data.reduce((sum, course) => sum + course.enrolledStudents, 0);
    const averageEngagement = data.reduce((sum, course) => sum + course.engagementScore, 0) / totalCourses;

    return {
      keyMetrics: [
        { label: 'Total Courses', value: totalCourses },
        { label: 'Total Students', value: totalStudents },
        { label: 'Average Engagement', value: `${Math.round(averageEngagement)}%` }
      ],
      insights: [
        `${totalCourses} courses analyzed`,
        `${totalStudents} total student enrollments`,
        `Average engagement score is ${Math.round(averageEngagement)}%`
      ]
    };
  }

  private generateAttendanceSummary(data: any[]): ReportSummary {
    const totalStudents = data.length;
    const averageAttendance = data.reduce((sum, student) => sum + student.attendanceRate, 0) / totalStudents;
    const perfectAttendance = data.filter(student => student.attendanceRate === 100).length;

    return {
      keyMetrics: [
        { label: 'Students Tracked', value: totalStudents },
        { label: 'Average Attendance', value: `${Math.round(averageAttendance)}%` },
        { label: 'Perfect Attendance', value: perfectAttendance }
      ],
      insights: [
        `${totalStudents} students tracked`,
        `${perfectAttendance} students have perfect attendance`,
        `Overall attendance rate is ${Math.round(averageAttendance)}%`
      ]
    };
  }

  private generateGradeDistributionSummary(data: any[]): ReportSummary {
    const totalGrades = data.reduce((sum, range) => sum + range.count, 0);
    const highestRange = data.reduce((max, range) => range.count > max.count ? range : max);

    return {
      keyMetrics: [
        { label: 'Total Grades', value: totalGrades },
        { label: 'Most Common Grade', value: highestRange.gradeRange },
        { label: 'Distribution', value: `${highestRange.percentage}%` }
      ],
      insights: [
        `${totalGrades} grades analyzed`,
        `Most students scored in ${highestRange.gradeRange} range`,
        `${highestRange.percentage}% of students in top range`
      ]
    };
  }

  private generateEngagementSummary(data: any[]): ReportSummary {
    const totalStudents = data.length;
    const averageEngagement = data.reduce((sum, student) => sum + student.engagementScore, 0) / totalStudents;
    const highEngagement = data.filter(student => student.engagementScore >= 80).length;

    return {
      keyMetrics: [
        { label: 'Students Analyzed', value: totalStudents },
        { label: 'Average Engagement', value: `${Math.round(averageEngagement)}%` },
        { label: 'High Engagement', value: highEngagement }
      ],
      insights: [
        `${totalStudents} students analyzed`,
        `${highEngagement} students show high engagement`,
        `Average engagement score is ${Math.round(averageEngagement)}%`
      ]
    };
  }

  private generateFinancialSummary(data: any[]): ReportSummary {
    const totalRevenue = data.reduce((sum, course) => sum + course.totalRevenue, 0);
    const totalPending = data.reduce((sum, course) => sum + course.pendingRevenue, 0);
    const averageCollection = data.reduce((sum, course) => sum + course.collectionRate, 0) / data.length;

    return {
      keyMetrics: [
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
        { label: 'Pending Revenue', value: `$${totalPending.toLocaleString()}` },
        { label: 'Collection Rate', value: `${Math.round(averageCollection)}%` }
      ],
      insights: [
        `$${totalRevenue.toLocaleString()} in total revenue`,
        `$${totalPending.toLocaleString()} in pending payments`,
        `${Math.round(averageCollection)}% average collection rate`
      ]
    };
  }

  private generateComparativeSummary(data: any[]): ReportSummary {
    return {
      keyMetrics: [
        { label: 'Comparisons', value: data.length },
        { label: 'Status', value: 'In Development' }
      ],
      insights: [
        'Comparative analysis feature in development',
        'Will provide detailed cross-period comparisons'
      ]
    };
  }
}