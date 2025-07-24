"use client";

import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { BreadcrumbItem } from '@/components/ui/breadcrumb-navigation';
import { UserRole } from '@/types';
import { 
  BookOpen, 
  Users, 
  BarChart2, 
  DollarSign, 
  CalendarCheck, 
  MessageSquare, 
  Megaphone, 
  CalendarDays, 
  Settings, 
  UserCircle,
  LayoutDashboard,
  UserPlus,
  Video,
  FileText,
  GraduationCap
} from 'lucide-react';

export function useBreadcrumbData(): BreadcrumbItem[] {
  const pathname = usePathname();
  const { state } = useAppContext();
  const { currentUser, courses, users } = state;

  // Helper function to get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Course';
  };

  // Helper function to get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'User';
  };

  // Split pathname and filter out empty segments and route groups
  const segments = pathname.split('/').filter(segment => 
    segment && !segment.startsWith('(') && !segment.endsWith(')')
  );

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Define route-specific breadcrumb configurations
    const routeConfig: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
      // Dashboard routes
      'admin': { label: 'Admin', icon: LayoutDashboard },
      'teacher': { label: 'Teacher', icon: LayoutDashboard },
      'student': { label: 'Student', icon: LayoutDashboard },
      'dashboard': { label: 'Dashboard', icon: LayoutDashboard },
      
      // Common routes
      'courses': { label: 'Courses', icon: BookOpen },
      'users': { label: 'Users', icon: Users },
      'enrollments': { label: 'Enrollments', icon: UserPlus },
      'attendance': { label: 'Attendance', icon: CalendarCheck },
      'payments': { label: 'Payments', icon: DollarSign },
      'reports': { label: 'Reports', icon: BarChart2 },
      'messages': { label: 'Messages', icon: MessageSquare },
      'announcements': { label: 'Announcements', icon: Megaphone },
      'calendar': { label: 'Calendar', icon: CalendarDays },
      'settings': { label: 'Settings', icon: Settings },
      'profile': { label: 'Profile', icon: UserCircle },
      'live-class': { label: 'Live Class', icon: Video },
      'lessons': { label: 'Lessons', icon: FileText },
      'assignments': { label: 'Assignments', icon: GraduationCap },
    };

    // Handle dynamic routes
    let label = segment;
    let icon = routeConfig[segment]?.icon;

    // Check if this is a dynamic route (UUID pattern)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    if (isUUID) {
      // Determine what this ID represents based on the previous segment
      const previousSegment = segments[index - 1];
      
      switch (previousSegment) {
        case 'courses':
          label = getCourseName(segment);
          icon = BookOpen;
          break;
        case 'users':
          label = getUserName(segment);
          icon = Users;
          break;
        default:
          label = 'Details';
      }
    } else if (routeConfig[segment]) {
      label = routeConfig[segment].label;
      icon = routeConfig[segment].icon;
    } else {
      // Format segment name (capitalize and replace hyphens with spaces)
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    }

    // Special handling for role-based dashboard paths
    if (segment === 'dashboard' && index > 0) {
      const roleSegment = segments[index - 1];
      if (roleSegment === 'admin' || roleSegment === 'teacher' || roleSegment === 'student') {
        label = `${roleSegment.charAt(0).toUpperCase() + roleSegment.slice(1)} Dashboard`;
      }
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      icon,
    });
  });

  return breadcrumbs;
}

// Helper hook to get role-specific dashboard path
export function useDashboardPath() {
  const { state } = useAppContext();
  const { currentUser } = state;

  if (!currentUser) return '/';

  switch (currentUser.role) {
    case UserRole.SUPER_ADMIN:
      return '/admin/dashboard';
    case UserRole.TEACHER:
      return '/teacher/dashboard';
    case UserRole.STUDENT:
      return '/student/dashboard';
    default:
      return '/';
  }
}