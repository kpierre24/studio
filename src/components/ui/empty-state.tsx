import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import { AnimatedButton } from "./micro-animations"

interface EmptyStateProps {
  illustration?: React.ComponentType<{ className?: string }> | string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
  children?: React.ReactNode
}

// Default illustrations as SVG components
const DefaultIllustrations = {
  courses: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <rect x="60" y="70" width="80" height="60" rx="8" fill="hsl(var(--muted))" />
      <rect x="70" y="80" width="60" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="70" y="90" width="40" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="70" y="100" width="50" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
    </svg>
  ),
  assignments: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <rect x="70" y="60" width="60" height="80" rx="8" fill="hsl(var(--muted))" />
      <rect x="80" y="75" width="40" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="80" y="85" width="30" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="80" y="95" width="35" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <circle cx="85" cy="110" r="3" fill="hsl(var(--primary))" />
      <rect x="95" y="107" width="20" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
    </svg>
  ),
  students: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <circle cx="100" cy="85" r="20" fill="hsl(var(--muted))" />
      <path d="M70 140 Q100 120 130 140 L130 160 L70 160 Z" fill="hsl(var(--muted))" />
    </svg>
  ),
  search: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <circle cx="90" cy="90" r="25" stroke="hsl(var(--muted-foreground))" strokeWidth="4" fill="none" />
      <line x1="110" y1="110" x2="130" y2="130" stroke="hsl(var(--muted-foreground))" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  grades: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <rect x="60" y="70" width="80" height="60" rx="8" fill="hsl(var(--muted))" />
      <text x="100" y="105" textAnchor="middle" className="text-2xl font-bold" fill="hsl(var(--muted-foreground))">A+</text>
    </svg>
  ),
  notifications: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <path d="M80 90 Q80 70 100 70 Q120 70 120 90 L120 110 Q125 115 125 120 L75 120 Q75 115 80 110 Z" fill="hsl(var(--muted))" />
      <rect x="95" y="125" width="10" height="8" rx="5" fill="hsl(var(--muted))" />
    </svg>
  ),
  generic: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
      <rect x="70" y="70" width="60" height="60" rx="8" fill="hsl(var(--muted))" />
      <rect x="80" y="80" width="40" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="80" y="90" width="30" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      <rect x="80" y="100" width="35" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
    </svg>
  )
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
  animate = true
}: EmptyStateProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-8',
          illustration: 'w-24 h-24',
          title: 'text-lg',
          description: 'text-sm',
          spacing: 'space-y-3'
        }
      case 'lg':
        return {
          container: 'py-16',
          illustration: 'w-48 h-48',
          title: 'text-2xl',
          description: 'text-base',
          spacing: 'space-y-6'
        }
      default:
        return {
          container: 'py-12',
          illustration: 'w-32 h-32',
          title: 'text-xl',
          description: 'text-sm',
          spacing: 'space-y-4'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  const renderIllustration = () => {
    if (typeof illustration === 'string') {
      return <img src={illustration} alt="" className={sizeClasses.illustration} />
    }
    
    if (illustration) {
      const IllustrationComponent = illustration
      return <IllustrationComponent className={sizeClasses.illustration} />
    }
    
    return <DefaultIllustrations.generic className={sizeClasses.illustration} />
  }

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center text-center max-w-md mx-auto",
      sizeClasses.container,
      sizeClasses.spacing,
      className
    )}>
      <motion.div
        variants={animate ? staggerItem : undefined}
        className="text-muted-foreground"
      >
        {renderIllustration()}
      </motion.div>
      
      <motion.div
        variants={animate ? staggerItem : undefined}
        className="space-y-2"
      >
        <h3 className={cn("font-semibold text-foreground", sizeClasses.title)}>
          {title}
        </h3>
        <p className={cn("text-muted-foreground", sizeClasses.description)}>
          {description}
        </p>
      </motion.div>
      
      {(action || secondaryAction) && (
        <motion.div
          variants={animate ? staggerItem : undefined}
          className="flex flex-col sm:flex-row gap-3"
        >
          {action && (
            <AnimatedButton
              onClick={action.onClick}
              variant="gentle"
              className={cn(
                action.variant === 'secondary' 
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {action.label}
            </AnimatedButton>
          )}
          {secondaryAction && (
            <AnimatedButton
              onClick={secondaryAction.onClick}
              variant="gentle"
              className="bg-transparent text-muted-foreground border border-border hover:bg-accent"
            >
              {secondaryAction.label}
            </AnimatedButton>
          )}
        </motion.div>
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {content}
      </motion.div>
    )
  }

  return content
}

// Role-specific empty state components
interface RoleSpecificEmptyStateProps {
  role: 'student' | 'teacher' | 'admin'
  context: 'courses' | 'assignments' | 'grades' | 'students' | 'notifications'
  className?: string
}

export function RoleSpecificEmptyState({
  role,
  context,
  className
}: RoleSpecificEmptyStateProps) {
  const getEmptyStateConfig = () => {
    const configs = {
      student: {
        courses: {
          title: "No Courses Yet",
          description: "You haven't enrolled in any courses yet. Browse available courses to get started with your learning journey.",
          illustration: DefaultIllustrations.courses,
          action: {
            label: "Browse Courses",
            onClick: () => console.log("Navigate to course catalog")
          }
        },
        assignments: {
          title: "No Assignments",
          description: "You don't have any assignments at the moment. Check back later or contact your teacher if you think this is an error.",
          illustration: DefaultIllustrations.assignments,
          action: {
            label: "Refresh",
            onClick: () => window.location.reload()
          }
        },
        grades: {
          title: "No Grades Available",
          description: "Your grades will appear here once your teacher has graded your assignments.",
          illustration: DefaultIllustrations.grades
        },
        notifications: {
          title: "No New Notifications",
          description: "You're all caught up! New notifications will appear here when you receive them.",
          illustration: DefaultIllustrations.notifications
        }
      },
      teacher: {
        courses: {
          title: "No Courses Created",
          description: "Start building your curriculum by creating your first course. You can add lessons, assignments, and manage students.",
          illustration: DefaultIllustrations.courses,
          action: {
            label: "Create Course",
            onClick: () => console.log("Navigate to course creation")
          }
        },
        assignments: {
          title: "No Assignments Created",
          description: "Create assignments to assess your students' progress and understanding of the course material.",
          illustration: DefaultIllustrations.assignments,
          action: {
            label: "Create Assignment",
            onClick: () => console.log("Navigate to assignment creation")
          }
        },
        students: {
          title: "No Students Enrolled",
          description: "Once students enroll in your courses, you'll be able to see them here and track their progress.",
          illustration: DefaultIllustrations.students,
          action: {
            label: "Invite Students",
            onClick: () => console.log("Open student invitation modal")
          }
        },
        grades: {
          title: "No Submissions to Grade",
          description: "Student submissions will appear here when they submit their assignments for grading.",
          illustration: DefaultIllustrations.grades
        }
      },
      admin: {
        courses: {
          title: "No Courses in System",
          description: "The platform is ready for teachers to create courses. Monitor course creation and manage the curriculum from here.",
          illustration: DefaultIllustrations.courses,
          action: {
            label: "View Analytics",
            onClick: () => console.log("Navigate to analytics")
          }
        },
        students: {
          title: "No Students Registered",
          description: "Student registrations will appear here. You can manage user accounts and monitor platform usage.",
          illustration: DefaultIllustrations.students,
          action: {
            label: "User Management",
            onClick: () => console.log("Navigate to user management")
          }
        },
        notifications: {
          title: "No System Notifications",
          description: "System alerts and important notifications will appear here when they require your attention.",
          illustration: DefaultIllustrations.notifications
        }
      }
    }

    return (configs as any)[role]?.[context] || {
      title: "No Data Available",
      description: "There's nothing to show here right now.",
      illustration: DefaultIllustrations.generic
    }
  }

  const config = getEmptyStateConfig()

  return (
    <EmptyState
      title={config.title}
      description={config.description}
      illustration={config.illustration}
      action={config.action}
      className={className}
    />
  )
}

// Search empty state
interface SearchEmptyStateProps {
  query: string
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  onClearSearch?: () => void
  className?: string
}

export function SearchEmptyState({
  query,
  suggestions = [],
  onSuggestionClick,
  onClearSearch,
  className
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or browse the suggestions below."
      illustration={DefaultIllustrations.search}
      action={onClearSearch ? {
        label: "Clear Search",
        onClick: onClearSearch,
        variant: 'secondary'
      } : undefined}
      className={className}
    >
      {suggestions.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="mt-6 w-full max-w-sm"
        >
          <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                onClick={() => onSuggestionClick?.(suggestion)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </EmptyState>
  )
}

// Error empty state
interface ErrorEmptyStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  onGoBack?: () => void
  className?: string
}

export function ErrorEmptyState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  onGoBack,
  className
}: ErrorEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      illustration={({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" fill="hsl(var(--destructive))" opacity="0.1" />
          <circle cx="100" cy="100" r="30" stroke="hsl(var(--destructive))" strokeWidth="4" fill="none" />
          <line x1="85" y1="85" x2="115" y2="115" stroke="hsl(var(--destructive))" strokeWidth="4" strokeLinecap="round" />
          <line x1="115" y1="85" x2="85" y2="115" stroke="hsl(var(--destructive))" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry
      } : undefined}
      secondaryAction={onGoBack ? {
        label: "Go Back",
        onClick: onGoBack
      } : undefined}
      className={className}
    />
  )
}