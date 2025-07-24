import { 
  StudentPerformanceData, 
  RiskAssessment, 
  InterventionRecommendation,
  LearningRecommendation,
  PerformanceTrend 
} from '@/types/performance-insights'

/**
 * Intervention recommendation engine for struggling students
 */

export class InterventionEngine {
  /**
   * Generate intervention recommendations based on risk assessment
   */
  generateInterventions(
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData,
    trends?: PerformanceTrend
  ): InterventionRecommendation[] {
    const interventions: InterventionRecommendation[] = []

    // Generate interventions based on risk factors
    for (const factor of riskAssessment.riskFactors) {
      const intervention = this.createInterventionForFactor(
        factor,
        riskAssessment,
        performanceData
      )
      if (intervention) {
        interventions.push(intervention)
      }
    }

    // Add trend-based interventions if available
    if (trends) {
      const trendInterventions = this.createTrendBasedInterventions(
        trends,
        riskAssessment,
        performanceData
      )
      interventions.push(...trendInterventions)
    }

    // Sort by priority and return top recommendations
    return interventions
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
      .slice(0, 5) // Limit to top 5 recommendations
  }

  /**
   * Create intervention for specific risk factor
   */
  private createInterventionForFactor(
    factor: RiskAssessment['riskFactors'][0],
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData
  ): InterventionRecommendation | null {
    const baseId = `${performanceData.studentId}-${performanceData.courseId}-${factor.factor}`
    
    switch (factor.factor) {
      case 'low_grades':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'academic',
          priority: factor.severity === 'high' ? 'urgent' : factor.severity === 'medium' ? 'high' : 'medium',
          title: 'Academic Performance Intervention',
          description: 'Student is struggling with academic performance and needs additional support',
          suggestedActions: [
            {
              action: 'Schedule one-on-one tutoring session',
              timeline: 'Within 3 days',
              responsible: 'teacher',
              resources: ['Tutoring schedule', 'Academic support materials']
            },
            {
              action: 'Review study habits and techniques',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Study skills guide', 'Time management tools']
            },
            {
              action: 'Create personalized study plan',
              timeline: 'Within 1 week',
              responsible: 'student',
              resources: ['Study plan template', 'Progress tracking sheet']
            }
          ],
          expectedOutcome: 'Improve academic performance by 15-20% within 4 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'poor_attendance':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'attendance',
          priority: factor.severity === 'high' ? 'urgent' : 'high',
          title: 'Attendance Improvement Plan',
          description: 'Student attendance is below acceptable levels and requires intervention',
          suggestedActions: [
            {
              action: 'Contact student to discuss attendance barriers',
              timeline: 'Within 2 days',
              responsible: 'teacher',
              resources: ['Attendance tracking report', 'Student contact information']
            },
            {
              action: 'Develop attendance improvement plan',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Attendance policy', 'Flexible scheduling options']
            },
            {
              action: 'Implement daily check-ins',
              timeline: 'Ongoing for 2 weeks',
              responsible: 'teacher',
              resources: ['Check-in tracking system']
            }
          ],
          expectedOutcome: 'Increase attendance rate to above 85% within 3 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'low_engagement':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'engagement',
          priority: factor.severity === 'high' ? 'high' : 'medium',
          title: 'Engagement Enhancement Strategy',
          description: 'Student shows low engagement with course materials and activities',
          suggestedActions: [
            {
              action: 'Introduce interactive learning activities',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Interactive content library', 'Gamification tools']
            },
            {
              action: 'Assign peer collaboration projects',
              timeline: 'Within 2 weeks',
              responsible: 'teacher',
              resources: ['Group project templates', 'Collaboration tools']
            },
            {
              action: 'Provide choice in learning activities',
              timeline: 'Ongoing',
              responsible: 'teacher',
              resources: ['Alternative assignment options', 'Learning style assessment']
            }
          ],
          expectedOutcome: 'Increase engagement metrics by 30% within 4 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'missed_assignments':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'academic',
          priority: factor.severity === 'high' ? 'urgent' : 'high',
          title: 'Assignment Completion Support',
          description: 'Student is missing assignments and needs organizational support',
          suggestedActions: [
            {
              action: 'Create assignment tracking system',
              timeline: 'Within 3 days',
              responsible: 'teacher',
              resources: ['Assignment tracker template', 'Calendar integration']
            },
            {
              action: 'Provide deadline reminders',
              timeline: 'Ongoing',
              responsible: 'teacher',
              resources: ['Automated reminder system', 'Email templates']
            },
            {
              action: 'Offer makeup opportunities for missed work',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Makeup assignment policies', 'Extended deadline forms']
            }
          ],
          expectedOutcome: 'Achieve 90% assignment submission rate within 3 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'late_submissions':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'behavioral',
          priority: 'medium',
          title: 'Time Management Improvement',
          description: 'Student frequently submits assignments late, indicating time management issues',
          suggestedActions: [
            {
              action: 'Teach time management strategies',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Time management workshop', 'Planning tools']
            },
            {
              action: 'Set up interim deadlines',
              timeline: 'For next assignment',
              responsible: 'teacher',
              resources: ['Milestone tracking system', 'Progress check templates']
            },
            {
              action: 'Provide early submission incentives',
              timeline: 'Ongoing',
              responsible: 'teacher',
              resources: ['Incentive program guidelines', 'Reward system']
            }
          ],
          expectedOutcome: 'Reduce late submissions by 70% within 4 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'declining_performance':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'academic',
          priority: 'high',
          title: 'Performance Recovery Plan',
          description: 'Student performance is declining and needs immediate attention',
          suggestedActions: [
            {
              action: 'Conduct comprehensive performance review',
              timeline: 'Within 2 days',
              responsible: 'teacher',
              resources: ['Performance analysis tools', 'Historical grade data']
            },
            {
              action: 'Identify specific knowledge gaps',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Diagnostic assessments', 'Skill gap analysis']
            },
            {
              action: 'Implement targeted remediation',
              timeline: 'Within 2 weeks',
              responsible: 'teacher',
              resources: ['Remediation materials', 'Additional practice exercises']
            }
          ],
          expectedOutcome: 'Stabilize and improve performance trend within 3 weeks',
          createdAt: new Date(),
          status: 'pending'
        }

      case 'inactivity':
        return {
          id: `${baseId}-${Date.now()}`,
          studentId: performanceData.studentId,
          courseId: performanceData.courseId,
          type: 'engagement',
          priority: factor.severity === 'high' ? 'urgent' : 'high',
          title: 'Re-engagement Initiative',
          description: 'Student has been inactive and needs immediate re-engagement',
          suggestedActions: [
            {
              action: 'Make direct contact with student',
              timeline: 'Within 24 hours',
              responsible: 'teacher',
              resources: ['Contact information', 'Outreach templates']
            },
            {
              action: 'Assess barriers to participation',
              timeline: 'Within 3 days',
              responsible: 'teacher',
              resources: ['Barrier assessment survey', 'Support resources list']
            },
            {
              action: 'Create re-entry plan',
              timeline: 'Within 1 week',
              responsible: 'teacher',
              resources: ['Catch-up materials', 'Flexible scheduling options']
            }
          ],
          expectedOutcome: 'Resume active participation within 1 week',
          createdAt: new Date(),
          status: 'pending'
        }

      default:
        return null
    }
  }

  /**
   * Create trend-based interventions
   */
  private createTrendBasedInterventions(
    trends: PerformanceTrend,
    riskAssessment: RiskAssessment,
    performanceData: StudentPerformanceData
  ): InterventionRecommendation[] {
    const interventions: InterventionRecommendation[] = []

    // Multi-factor declining trends
    const decliningTrends = [
      trends.trends.gradesTrend.direction === 'declining',
      trends.trends.engagementTrend.direction === 'declining',
      trends.trends.attendanceTrend.direction === 'declining'
    ].filter(Boolean).length

    if (decliningTrends >= 2) {
      interventions.push({
        id: `${performanceData.studentId}-${performanceData.courseId}-multi-decline-${Date.now()}`,
        studentId: performanceData.studentId,
        courseId: performanceData.courseId,
        type: 'academic',
        priority: 'urgent',
        title: 'Comprehensive Support Plan',
        description: 'Multiple performance indicators are declining, requiring comprehensive intervention',
        suggestedActions: [
          {
            action: 'Schedule emergency academic conference',
            timeline: 'Within 24 hours',
            responsible: 'teacher',
            resources: ['Conference scheduling system', 'Academic advisor contact']
          },
          {
            action: 'Develop multi-faceted support plan',
            timeline: 'Within 3 days',
            responsible: 'teacher',
            resources: ['Comprehensive support template', 'Resource coordination tools']
          },
          {
            action: 'Implement intensive monitoring',
            timeline: 'Ongoing for 4 weeks',
            responsible: 'teacher',
            resources: ['Daily check-in system', 'Progress tracking dashboard']
          }
        ],
        expectedOutcome: 'Stabilize all performance indicators within 2 weeks',
        createdAt: new Date(),
        status: 'pending'
      })
    }

    return interventions
  }

  /**
   * Generate personalized learning recommendations
   */
  generateLearningRecommendations(
    performanceData: StudentPerformanceData,
    riskAssessment: RiskAssessment
  ): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = []

    // Content-based recommendations
    if (performanceData.currentGrade < 75) {
      recommendations.push({
        id: `content-${performanceData.studentId}-${Date.now()}`,
        studentId: performanceData.studentId,
        courseId: performanceData.courseId,
        type: 'content',
        title: 'Review Fundamental Concepts',
        description: 'Focus on strengthening understanding of core concepts',
        reasoning: 'Current grade indicates gaps in fundamental understanding',
        resources: [
          {
            type: 'lesson',
            title: 'Foundation Review Module',
            estimatedTime: 60
          },
          {
            type: 'practice',
            title: 'Interactive Practice Exercises',
            estimatedTime: 45
          }
        ],
        priority: 8,
        createdAt: new Date(),
        status: 'active'
      })
    }

    // Study method recommendations
    if (performanceData.learningVelocity.averageTimePerAssignment > 120) {
      recommendations.push({
        id: `method-${performanceData.studentId}-${Date.now()}`,
        studentId: performanceData.studentId,
        courseId: performanceData.courseId,
        type: 'study_method',
        title: 'Improve Study Efficiency',
        description: 'Learn techniques to study more effectively and efficiently',
        reasoning: 'Taking longer than average to complete assignments',
        resources: [
          {
            type: 'external',
            title: 'Study Techniques Workshop',
            url: '/resources/study-techniques',
            estimatedTime: 30
          },
          {
            type: 'external',
            title: 'Time Management Guide',
            url: '/resources/time-management',
            estimatedTime: 20
          }
        ],
        priority: 6,
        createdAt: new Date(),
        status: 'active'
      })
    }

    // Schedule recommendations
    if (performanceData.engagementMetrics.loginFrequency < 3) {
      recommendations.push({
        id: `schedule-${performanceData.studentId}-${Date.now()}`,
        studentId: performanceData.studentId,
        courseId: performanceData.courseId,
        type: 'schedule',
        title: 'Establish Regular Study Schedule',
        description: 'Create a consistent study routine to improve engagement',
        reasoning: 'Low login frequency suggests irregular study habits',
        resources: [
          {
            type: 'external',
            title: 'Study Schedule Template',
            url: '/resources/study-schedule',
            estimatedTime: 15
          }
        ],
        priority: 7,
        createdAt: new Date(),
        status: 'active'
      })
    }

    // Resource recommendations based on performance patterns
    const lowScoreAssignments = performanceData.assignmentScores
      .filter(score => (score.score / score.maxScore) < 0.7)

    if (lowScoreAssignments.length > 2) {
      recommendations.push({
        id: `resource-${performanceData.studentId}-${Date.now()}`,
        studentId: performanceData.studentId,
        courseId: performanceData.courseId,
        type: 'resource',
        title: 'Additional Learning Resources',
        description: 'Access supplementary materials to strengthen weak areas',
        reasoning: 'Multiple assignments with scores below 70%',
        resources: [
          {
            type: 'external',
            title: 'Supplementary Reading Materials',
            url: '/resources/supplementary',
            estimatedTime: 90
          },
          {
            type: 'external',
            title: 'Video Tutorials',
            url: '/resources/tutorials',
            estimatedTime: 120
          }
        ],
        priority: 5,
        createdAt: new Date(),
        status: 'active'
      })
    }

    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Get priority score for sorting
   */
  private getPriorityScore(priority: InterventionRecommendation['priority']): number {
    const scores = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1
    }
    return scores[priority]
  }
}