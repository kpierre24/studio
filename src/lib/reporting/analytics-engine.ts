import { AnalyticsMetric, ComparativeAnalysis } from '@/types/reporting';
import { User, Course, Assignment, Submission, AttendanceRecord, Payment } from '@/types';

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  // Core Analytics Calculations
  async calculateEngagementMetrics(
    users: User[],
    submissions: Submission[],
    attendance: AttendanceRecord[],
    timeframe: { start: Date; end: Date }
  ): Promise<AnalyticsMetric[]> {
    const metrics: AnalyticsMetric[] = [];

    // Active Users Metric
    const activeUsers = this.getActiveUsers(users, submissions, timeframe);
    metrics.push({
      id: 'active_users',
      name: 'Active Users',
      value: activeUsers.length,
      unit: 'users',
      trend: await this.calculateTrend('active_users', activeUsers.length, timeframe),
      benchmark: users.length * 0.7, // 70% benchmark
      target: users.length * 0.8 // 80% target
    });

    // Submission Rate Metric
    const submissionRate = this.calculateSubmissionRate(submissions, timeframe);
    metrics.push({
      id: 'submission_rate',
      name: 'Submission Rate',
      value: submissionRate,
      unit: '%',
      trend: await this.calculateTrend('submission_rate', submissionRate, timeframe),
      benchmark: 75,
      target: 85
    });

    // Attendance Rate Metric
    const attendanceRate = this.calculateAttendanceRate(attendance, timeframe);
    metrics.push({
      id: 'attendance_rate',
      name: 'Attendance Rate',
      value: attendanceRate,
      unit: '%',
      trend: await this.calculateTrend('attendance_rate', attendanceRate, timeframe),
      benchmark: 80,
      target: 90
    });

    return metrics;
  }

  async calculatePerformanceMetrics(
    submissions: Submission[],
    assignments: Assignment[],
    timeframe: { start: Date; end: Date }
  ): Promise<AnalyticsMetric[]> {
    const metrics: AnalyticsMetric[] = [];

    // Average Grade Metric
    const averageGrade = this.calculateAverageGrade(submissions, timeframe);
    metrics.push({
      id: 'average_grade',
      name: 'Average Grade',
      value: averageGrade,
      unit: '%',
      trend: await this.calculateTrend('average_grade', averageGrade, timeframe),
      benchmark: 75,
      target: 80
    });

    // Completion Rate Metric
    const completionRate = this.calculateCompletionRate(submissions, assignments, timeframe);
    metrics.push({
      id: 'completion_rate',
      name: 'Completion Rate',
      value: completionRate,
      unit: '%',
      trend: await this.calculateTrend('completion_rate', completionRate, timeframe),
      benchmark: 85,
      target: 95
    });

    // Grade Distribution Variance
    const gradeVariance = this.calculateGradeVariance(submissions, timeframe);
    metrics.push({
      id: 'grade_variance',
      name: 'Grade Variance',
      value: gradeVariance,
      unit: 'points',
      trend: await this.calculateTrend('grade_variance', gradeVariance, timeframe),
      benchmark: 15,
      target: 10
    });

    return metrics;
  }

  async calculateFinancialMetrics(
    payments: Payment[],
    courses: Course[],
    timeframe: { start: Date; end: Date }
  ): Promise<AnalyticsMetric[]> {
    const metrics: AnalyticsMetric[] = [];

    // Total Revenue
    const totalRevenue = this.calculateTotalRevenue(payments, timeframe);
    metrics.push({
      id: 'total_revenue',
      name: 'Total Revenue',
      value: totalRevenue,
      unit: '$',
      trend: await this.calculateTrend('total_revenue', totalRevenue, timeframe)
    });

    // Collection Rate
    const collectionRate = this.calculateCollectionRate(payments, timeframe);
    metrics.push({
      id: 'collection_rate',
      name: 'Collection Rate',
      value: collectionRate,
      unit: '%',
      trend: await this.calculateTrend('collection_rate', collectionRate, timeframe),
      benchmark: 85,
      target: 95
    });

    // Average Revenue Per Course
    const avgRevenuePerCourse = this.calculateAverageRevenuePerCourse(payments, courses, timeframe);
    metrics.push({
      id: 'avg_revenue_per_course',
      name: 'Avg Revenue Per Course',
      value: avgRevenuePerCourse,
      unit: '$',
      trend: await this.calculateTrend('avg_revenue_per_course', avgRevenuePerCourse, timeframe)
    });

    return metrics;
  }

  // Predictive Analytics
  async predictStudentPerformance(
    studentId: string,
    submissions: Submission[],
    attendance: AttendanceRecord[]
  ): Promise<{
    predictedGrade: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);
    const studentAttendance = attendance.filter(a => a.studentId === studentId);

    // Simple prediction model based on current performance
    const recentGrades = studentSubmissions
      .filter(s => s.grade !== undefined)
      .slice(-5) // Last 5 submissions
      .map(s => s.grade!);

    const averageGrade = recentGrades.length > 0 
      ? recentGrades.reduce((sum, grade) => sum + grade, 0) / recentGrades.length 
      : 0;

    const attendanceRate = studentAttendance.length > 0
      ? (studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100
      : 0;

    // Weighted prediction (70% grades, 30% attendance)
    const predictedGrade = (averageGrade * 0.7) + (attendanceRate * 0.3);

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];

    if (predictedGrade < 60) {
      riskLevel = 'high';
      recommendations.push('Immediate intervention required');
      recommendations.push('Schedule one-on-one meeting');
      recommendations.push('Provide additional resources');
    } else if (predictedGrade < 75) {
      riskLevel = 'medium';
      recommendations.push('Monitor progress closely');
      recommendations.push('Offer additional support');
    } else {
      riskLevel = 'low';
      recommendations.push('Continue current approach');
    }

    if (attendanceRate < 80) {
      recommendations.push('Address attendance issues');
    }

    return {
      predictedGrade: Math.round(predictedGrade),
      riskLevel,
      recommendations
    };
  }

  // Trend Analysis
  async analyzeTrends(
    metricId: string,
    data: number[],
    timePoints: Date[]
  ): Promise<{
    trend: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    correlation: number;
    forecast: number[];
  }> {
    if (data.length < 2) {
      return {
        trend: 'stable',
        slope: 0,
        correlation: 0,
        forecast: []
      };
    }

    // Calculate linear regression
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate correlation coefficient
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(slope) > 0.1) {
      trend = slope > 0 ? 'increasing' : 'decreasing';
    }

    // Simple forecast (next 3 points)
    const forecast = [1, 2, 3].map(i => slope * (n + i) + intercept);

    return {
      trend,
      slope,
      correlation,
      forecast
    };
  }

  // Helper Methods
  private getActiveUsers(
    users: User[],
    submissions: Submission[],
    timeframe: { start: Date; end: Date }
  ): User[] {
    const activeUserIds = new Set(
      submissions
        .filter(s => {
          const submissionDate = new Date(s.submittedAt);
          return submissionDate >= timeframe.start && submissionDate <= timeframe.end;
        })
        .map(s => s.studentId)
    );

    return users.filter(u => activeUserIds.has(u.id));
  }

  private calculateSubmissionRate(
    submissions: Submission[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframeSubmissions = submissions.filter(s => {
      const submissionDate = new Date(s.submittedAt);
      return submissionDate >= timeframe.start && submissionDate <= timeframe.end;
    });

    // This is a simplified calculation
    // In reality, you'd need to compare against expected submissions
    return timeframeSubmissions.length > 0 ? 85 : 0; // Mock calculation
  }

  private calculateAttendanceRate(
    attendance: AttendanceRecord[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframeAttendance = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate >= timeframe.start && attendanceDate <= timeframe.end;
    });

    if (timeframeAttendance.length === 0) return 0;

    const presentCount = timeframeAttendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / timeframeAttendance.length) * 100);
  }

  private calculateAverageGrade(
    submissions: Submission[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframeSubmissions = submissions.filter(s => {
      const submissionDate = new Date(s.submittedAt);
      return submissionDate >= timeframe.start && 
             submissionDate <= timeframe.end && 
             s.grade !== undefined;
    });

    if (timeframeSubmissions.length === 0) return 0;

    const totalGrade = timeframeSubmissions.reduce((sum, s) => sum + s.grade!, 0);
    return Math.round(totalGrade / timeframeSubmissions.length);
  }

  private calculateCompletionRate(
    submissions: Submission[],
    assignments: Assignment[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframeAssignments = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= timeframe.start && dueDate <= timeframe.end;
    });

    if (timeframeAssignments.length === 0) return 0;

    const completedAssignments = timeframeAssignments.filter(a => 
      submissions.some(s => s.assignmentId === a.id)
    );

    return Math.round((completedAssignments.length / timeframeAssignments.length) * 100);
  }

  private calculateGradeVariance(
    submissions: Submission[],
    timeframe: { start: Date; end: Date }
  ): number {
    const grades = submissions
      .filter(s => {
        const submissionDate = new Date(s.submittedAt);
        return submissionDate >= timeframe.start && 
               submissionDate <= timeframe.end && 
               s.grade !== undefined;
      })
      .map(s => s.grade!);

    if (grades.length === 0) return 0;

    const mean = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const variance = grades.reduce((sum, grade) => sum + Math.pow(grade - mean, 2), 0) / grades.length;
    
    return Math.round(Math.sqrt(variance));
  }

  private calculateTotalRevenue(
    payments: Payment[],
    timeframe: { start: Date; end: Date }
  ): number {
    return payments
      .filter(p => {
        if (!p.paymentDate) return false;
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= timeframe.start && 
               paymentDate <= timeframe.end && 
               p.status === 'Paid';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  private calculateCollectionRate(
    payments: Payment[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframePayments = payments.filter(p => {
      if (!p.paymentDate) return false;
      const paymentDate = new Date(p.paymentDate);
      return paymentDate >= timeframe.start && paymentDate <= timeframe.end;
    });

    if (timeframePayments.length === 0) return 0;

    const paidPayments = timeframePayments.filter(p => p.status === 'Paid');
    return Math.round((paidPayments.length / timeframePayments.length) * 100);
  }

  private calculateAverageRevenuePerCourse(
    payments: Payment[],
    courses: Course[],
    timeframe: { start: Date; end: Date }
  ): number {
    const timeframeRevenue = this.calculateTotalRevenue(payments, timeframe);
    return courses.length > 0 ? Math.round(timeframeRevenue / courses.length) : 0;
  }

  private async calculateTrend(
    metricId: string,
    currentValue: number,
    timeframe: { start: Date; end: Date }
  ): Promise<{ direction: 'up' | 'down' | 'stable'; percentage: number; period: string }> {
    // Mock trend calculation
    // In a real implementation, you'd compare with historical data
    const mockPreviousValue = currentValue * (0.9 + Math.random() * 0.2);
    const percentage = Math.round(((currentValue - mockPreviousValue) / mockPreviousValue) * 100);
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentage) > 5) {
      direction = percentage > 0 ? 'up' : 'down';
    }

    return {
      direction,
      percentage: Math.abs(percentage),
      period: 'vs last period'
    };
  }
}