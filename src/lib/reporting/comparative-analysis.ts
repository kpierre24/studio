import { ComparativeAnalysis, AnalyticsMetric } from '@/types/reporting';
import { Course, User, Submission, AttendanceRecord } from '@/types';

export class ComparativeAnalysisEngine {
  private static instance: ComparativeAnalysisEngine;

  public static getInstance(): ComparativeAnalysisEngine {
    if (!ComparativeAnalysisEngine.instance) {
      ComparativeAnalysisEngine.instance = new ComparativeAnalysisEngine();
    }
    return ComparativeAnalysisEngine.instance;
  }

  async compareCourses(
    baselineCourseId: string,
    comparisonCourseIds: string[],
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<ComparativeAnalysis> {
    const baselineCourse = data.courses.find(c => c.id === baselineCourseId);
    if (!baselineCourse) {
      throw new Error(`Baseline course ${baselineCourseId} not found`);
    }

    const baselineMetrics = await this.calculateCourseMetrics(baselineCourse, data);
    
    const comparisons = await Promise.all(
      comparisonCourseIds.map(async courseId => {
        const course = data.courses.find(c => c.id === courseId);
        if (!course) {
          throw new Error(`Comparison course ${courseId} not found`);
        }

        const metrics = await this.calculateCourseMetrics(course, data);
        const variance = this.calculateVariance(baselineMetrics, metrics);

        return {
          id: courseId,
          name: course.name,
          metrics,
          variance
        };
      })
    );

    return {
      id: `course_comparison_${Date.now()}`,
      type: 'course',
      baseline: {
        id: baselineCourseId,
        name: baselineCourse.name,
        metrics: baselineMetrics
      },
      comparisons
    };
  }

  async compareSemesters(
    baselineSemester: string,
    comparisonSemesters: string[],
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<ComparativeAnalysis> {
    // Mock semester comparison - in real implementation, you'd filter data by semester
    const baselineMetrics = await this.calculateSemesterMetrics(baselineSemester, data);
    
    const comparisons = await Promise.all(
      comparisonSemesters.map(async semester => {
        const metrics = await this.calculateSemesterMetrics(semester, data);
        const variance = this.calculateVariance(baselineMetrics, metrics);

        return {
          id: semester,
          name: `Semester ${semester}`,
          metrics,
          variance
        };
      })
    );

    return {
      id: `semester_comparison_${Date.now()}`,
      type: 'semester',
      baseline: {
        id: baselineSemester,
        name: `Semester ${baselineSemester}`,
        metrics: baselineMetrics
      },
      comparisons
    };
  }

  async compareYears(
    baselineYear: number,
    comparisonYears: number[],
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<ComparativeAnalysis> {
    const baselineMetrics = await this.calculateYearMetrics(baselineYear, data);
    
    const comparisons = await Promise.all(
      comparisonYears.map(async year => {
        const metrics = await this.calculateYearMetrics(year, data);
        const variance = this.calculateVariance(baselineMetrics, metrics);

        return {
          id: year.toString(),
          name: `Year ${year}`,
          metrics,
          variance
        };
      })
    );

    return {
      id: `year_comparison_${Date.now()}`,
      type: 'year',
      baseline: {
        id: baselineYear.toString(),
        name: `Year ${baselineYear}`,
        metrics: baselineMetrics
      },
      comparisons
    };
  }

  async compareCohorts(
    baselineCohortId: string,
    comparisonCohortIds: string[],
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<ComparativeAnalysis> {
    // Mock cohort comparison
    const baselineMetrics = await this.calculateCohortMetrics(baselineCohortId, data);
    
    const comparisons = await Promise.all(
      comparisonCohortIds.map(async cohortId => {
        const metrics = await this.calculateCohortMetrics(cohortId, data);
        const variance = this.calculateVariance(baselineMetrics, metrics);

        return {
          id: cohortId,
          name: `Cohort ${cohortId}`,
          metrics,
          variance
        };
      })
    );

    return {
      id: `cohort_comparison_${Date.now()}`,
      type: 'cohort',
      baseline: {
        id: baselineCohortId,
        name: `Cohort ${baselineCohortId}`,
        metrics: baselineMetrics
      },
      comparisons
    };
  }

  private async calculateCourseMetrics(
    course: Course,
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<AnalyticsMetric[]> {
    const courseSubmissions = data.submissions.filter(s => 
      data.courses.find(c => c.id === course.id && 
        c.studentIds.includes(s.studentId)
      )
    );

    const courseAttendance = data.attendance.filter(a => a.courseId === course.id);

    const metrics: AnalyticsMetric[] = [];

    // Enrollment metric
    metrics.push({
      id: 'enrollment',
      name: 'Enrollment',
      value: course.studentIds.length,
      unit: 'students',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    // Average grade metric
    const grades = courseSubmissions
      .filter(s => s.grade !== undefined)
      .map(s => s.grade!);
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
      : 0;

    metrics.push({
      id: 'average_grade',
      name: 'Average Grade',
      value: Math.round(averageGrade),
      unit: '%',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    // Attendance rate metric
    const attendanceRate = courseAttendance.length > 0
      ? (courseAttendance.filter(a => a.status === 'Present').length / courseAttendance.length) * 100
      : 0;

    metrics.push({
      id: 'attendance_rate',
      name: 'Attendance Rate',
      value: Math.round(attendanceRate),
      unit: '%',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    // Completion rate metric
    const totalAssignments = data.courses.length; // Simplified
    const completedAssignments = courseSubmissions.length;
    const completionRate = totalAssignments > 0 
      ? (completedAssignments / (totalAssignments * course.studentIds.length)) * 100 
      : 0;

    metrics.push({
      id: 'completion_rate',
      name: 'Completion Rate',
      value: Math.round(completionRate),
      unit: '%',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    return metrics;
  }

  private async calculateSemesterMetrics(
    semester: string,
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<AnalyticsMetric[]> {
    // Mock semester metrics calculation
    // In real implementation, you'd filter data by semester dates
    
    const metrics: AnalyticsMetric[] = [];

    metrics.push({
      id: 'total_courses',
      name: 'Total Courses',
      value: data.courses.length,
      unit: 'courses',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    metrics.push({
      id: 'total_students',
      name: 'Total Students',
      value: data.users.filter(u => u.role === 'Student').length,
      unit: 'students',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    const grades = data.submissions
      .filter(s => s.grade !== undefined)
      .map(s => s.grade!);
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
      : 0;

    metrics.push({
      id: 'semester_average_grade',
      name: 'Semester Average Grade',
      value: Math.round(averageGrade),
      unit: '%',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    return metrics;
  }

  private async calculateYearMetrics(
    year: number,
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<AnalyticsMetric[]> {
    // Mock year metrics calculation
    const metrics: AnalyticsMetric[] = [];

    metrics.push({
      id: 'yearly_enrollment',
      name: 'Yearly Enrollment',
      value: data.users.filter(u => u.role === 'Student').length,
      unit: 'students',
      trend: { direction: 'up', percentage: 10, period: 'vs previous year' }
    });

    metrics.push({
      id: 'yearly_courses',
      name: 'Courses Offered',
      value: data.courses.length,
      unit: 'courses',
      trend: { direction: 'up', percentage: 5, period: 'vs previous year' }
    });

    const grades = data.submissions
      .filter(s => s.grade !== undefined)
      .map(s => s.grade!);
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
      : 0;

    metrics.push({
      id: 'yearly_performance',
      name: 'Yearly Performance',
      value: Math.round(averageGrade),
      unit: '%',
      trend: { direction: 'up', percentage: 3, period: 'vs previous year' }
    });

    return metrics;
  }

  private async calculateCohortMetrics(
    cohortId: string,
    data: {
      courses: Course[];
      users: User[];
      submissions: Submission[];
      attendance: AttendanceRecord[];
    }
  ): Promise<AnalyticsMetric[]> {
    // Mock cohort metrics calculation
    const metrics: AnalyticsMetric[] = [];

    // In real implementation, you'd filter users by cohort
    const cohortSize = Math.floor(data.users.length / 3); // Mock cohort size

    metrics.push({
      id: 'cohort_size',
      name: 'Cohort Size',
      value: cohortSize,
      unit: 'students',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    const grades = data.submissions
      .filter(s => s.grade !== undefined)
      .slice(0, cohortSize) // Mock cohort filtering
      .map(s => s.grade!);
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
      : 0;

    metrics.push({
      id: 'cohort_performance',
      name: 'Cohort Performance',
      value: Math.round(averageGrade),
      unit: '%',
      trend: { direction: 'stable', percentage: 0, period: 'current' }
    });

    return metrics;
  }

  private calculateVariance(
    baselineMetrics: AnalyticsMetric[],
    comparisonMetrics: AnalyticsMetric[]
  ): Record<string, number> {
    const variance: Record<string, number> = {};

    baselineMetrics.forEach(baselineMetric => {
      const comparisonMetric = comparisonMetrics.find(m => m.id === baselineMetric.id);
      if (comparisonMetric) {
        const baselineValue = baselineMetric.value;
        const comparisonValue = comparisonMetric.value;
        
        if (baselineValue !== 0) {
          variance[baselineMetric.id] = ((comparisonValue - baselineValue) / baselineValue) * 100;
        } else {
          variance[baselineMetric.id] = comparisonValue > 0 ? 100 : 0;
        }
      }
    });

    return variance;
  }

  // Statistical significance testing
  async calculateStatisticalSignificance(
    baseline: number[],
    comparison: number[],
    confidenceLevel: number = 0.95
  ): Promise<{
    isSignificant: boolean;
    pValue: number;
    confidenceInterval: [number, number];
  }> {
    // Simplified t-test implementation
    // In a real application, you'd use a proper statistical library
    
    const baselineMean = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
    const comparisonMean = comparison.reduce((sum, val) => sum + val, 0) / comparison.length;
    
    const baselineVariance = baseline.reduce((sum, val) => sum + Math.pow(val - baselineMean, 2), 0) / (baseline.length - 1);
    const comparisonVariance = comparison.reduce((sum, val) => sum + Math.pow(val - comparisonMean, 2), 0) / (comparison.length - 1);
    
    const pooledStandardError = Math.sqrt(
      (baselineVariance / baseline.length) + (comparisonVariance / comparison.length)
    );
    
    const tStatistic = (comparisonMean - baselineMean) / pooledStandardError;
    
    // Mock p-value calculation (in reality, you'd use proper statistical functions)
    const pValue = Math.abs(tStatistic) > 2 ? 0.01 : 0.1;
    const isSignificant = pValue < (1 - confidenceLevel);
    
    const marginOfError = 1.96 * pooledStandardError; // 95% confidence
    const confidenceInterval: [number, number] = [
      (comparisonMean - baselineMean) - marginOfError,
      (comparisonMean - baselineMean) + marginOfError
    ];
    
    return {
      isSignificant,
      pValue,
      confidenceInterval
    };
  }
}