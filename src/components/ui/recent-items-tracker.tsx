"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRecentItems, useRecentItemHelpers } from '@/hooks/useRecentItems';

interface RecentItemsTrackerProps {
  children: React.ReactNode;
}

// Helper function to extract IDs from pathname
function extractEntityInfo(pathname: string): { type: string; id: string } | null {
  // Match patterns like /courses/[id], /courses/[courseId]/assignments/[assignmentId], etc.
  const courseMatch = pathname.match(/^\/courses\/([^\/]+)$/);
  if (courseMatch) {
    return { type: 'course', id: courseMatch[1] };
  }
  
  const assignmentMatch = pathname.match(/^\/courses\/[^\/]+\/assignments\/([^\/]+)/);
  if (assignmentMatch) {
    return { type: 'assignment', id: assignmentMatch[1] };
  }
  
  const lessonMatch = pathname.match(/^\/courses\/[^\/]+\/lessons\/([^\/]+)/);
  if (lessonMatch) {
    return { type: 'lesson', id: lessonMatch[1] };
  }
  
  const userMatch = pathname.match(/^\/users\/([^\/]+)/);
  if (userMatch) {
    return { type: 'user', id: userMatch[1] };
  }
  
  return null;
}

export function RecentItemsTracker({ children }: RecentItemsTrackerProps) {
  const pathname = usePathname();
  const { addRecentItem } = useRecentItems();
  const {
    createRecentItemFromCourse,
    createRecentItemFromAssignment,
    createRecentItemFromLesson,
    createRecentItemFromUser,
  } = useRecentItemHelpers();

  useEffect(() => {
    const entityInfo = extractEntityInfo(pathname);
    if (!entityInfo) return;

    let recentItem = null;

    switch (entityInfo.type) {
      case 'course':
        recentItem = createRecentItemFromCourse(entityInfo.id);
        break;
      case 'assignment':
        recentItem = createRecentItemFromAssignment(entityInfo.id);
        break;
      case 'lesson':
        recentItem = createRecentItemFromLesson(entityInfo.id);
        break;
      case 'user':
        recentItem = createRecentItemFromUser(entityInfo.id);
        break;
    }

    if (recentItem) {
      // Add a small delay to ensure the page has loaded and data is available
      const timeoutId = setTimeout(() => {
        addRecentItem(recentItem);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, addRecentItem, createRecentItemFromCourse, createRecentItemFromAssignment, createRecentItemFromLesson, createRecentItemFromUser]);

  return <>{children}</>;
}

// Hook for manually tracking recent items
export function useRecentItemsTracker() {
  const { addRecentItem } = useRecentItems();
  const {
    createRecentItemFromCourse,
    createRecentItemFromAssignment,
    createRecentItemFromLesson,
    createRecentItemFromUser,
  } = useRecentItemHelpers();

  const trackCourse = (courseId: string) => {
    const item = createRecentItemFromCourse(courseId);
    if (item) addRecentItem(item);
  };

  const trackAssignment = (assignmentId: string) => {
    const item = createRecentItemFromAssignment(assignmentId);
    if (item) addRecentItem(item);
  };

  const trackLesson = (lessonId: string) => {
    const item = createRecentItemFromLesson(lessonId);
    if (item) addRecentItem(item);
  };

  const trackUser = (userId: string) => {
    const item = createRecentItemFromUser(userId);
    if (item) addRecentItem(item);
  };

  const trackCustomItem = (item: Parameters<typeof addRecentItem>[0]) => {
    addRecentItem(item);
  };

  return {
    trackCourse,
    trackAssignment,
    trackLesson,
    trackUser,
    trackCustomItem,
  };
}