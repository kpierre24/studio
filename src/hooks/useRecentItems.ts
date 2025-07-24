"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export interface RecentItem {
  id: string;
  type: 'course' | 'assignment' | 'lesson' | 'user';
  title: string;
  url: string;
  accessedAt: Date;
  metadata?: {
    description?: string;
    courseName?: string;
    dueDate?: string;
    [key: string]: any;
  };
}

const RECENT_ITEMS_STORAGE_KEY = 'classroomhq-recent-items';
const MAX_RECENT_ITEMS = 20;
const CLEANUP_DAYS = 30; // Remove items older than 30 days

export function useRecentItems() {
  const { state } = useAppContext();
  const { currentUser } = state;
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent items from localStorage on mount
  useEffect(() => {
    if (!currentUser) {
      setRecentItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${RECENT_ITEMS_STORAGE_KEY}-${currentUser.id}`);
      if (stored) {
        const parsedItems = JSON.parse(stored).map((item: any) => ({
          ...item,
          accessedAt: new Date(item.accessedAt),
        }));
        
        // Clean up old items
        const cleanedItems = cleanupOldItems(parsedItems);
        setRecentItems(cleanedItems);
      }
    } catch (error) {
      console.error('Error loading recent items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Save recent items to localStorage whenever they change
  useEffect(() => {
    if (!currentUser || isLoading) return;

    try {
      localStorage.setItem(
        `${RECENT_ITEMS_STORAGE_KEY}-${currentUser.id}`,
        JSON.stringify(recentItems)
      );
    } catch (error) {
      console.error('Error saving recent items:', error);
    }
  }, [recentItems, currentUser, isLoading]);

  // Clean up items older than CLEANUP_DAYS
  const cleanupOldItems = useCallback((items: RecentItem[]): RecentItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);
    
    return items.filter(item => item.accessedAt > cutoffDate);
  }, []);

  // Add or update a recent item
  const addRecentItem = useCallback((item: Omit<RecentItem, 'accessedAt'>) => {
    const newItem: RecentItem = {
      ...item,
      accessedAt: new Date(),
    };

    setRecentItems(prev => {
      // Remove existing item with same id if it exists
      const filtered = prev.filter(existing => existing.id !== item.id);
      
      // Add new item at the beginning
      const updated = [newItem, ...filtered];
      
      // Limit to MAX_RECENT_ITEMS
      const limited = updated.slice(0, MAX_RECENT_ITEMS);
      
      // Clean up old items
      return cleanupOldItems(limited);
    });
  }, [cleanupOldItems]);

  // Remove a specific recent item
  const removeRecentItem = useCallback((id: string) => {
    setRecentItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear all recent items
  const clearAllRecentItems = useCallback(() => {
    setRecentItems([]);
  }, []);

  // Get recent items by type
  const getRecentItemsByType = useCallback((type: RecentItem['type']) => {
    return recentItems.filter(item => item.type === type);
  }, [recentItems]);

  // Get recent items with limit
  const getRecentItems = useCallback((limit?: number) => {
    return limit ? recentItems.slice(0, limit) : recentItems;
  }, [recentItems]);

  // Check if an item is in recent items
  const isRecentItem = useCallback((id: string) => {
    return recentItems.some(item => item.id === id);
  }, [recentItems]);

  return {
    recentItems,
    isLoading,
    addRecentItem,
    removeRecentItem,
    clearAllRecentItems,
    getRecentItemsByType,
    getRecentItems,
    isRecentItem,
  };
}

// Helper hook for creating recent items from app data
export function useRecentItemHelpers() {
  const { state } = useAppContext();
  const { courses, assignments, lessons, users } = state;

  const createRecentItemFromCourse = useCallback((courseId: string): Omit<RecentItem, 'accessedAt'> | null => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    return {
      id: course.id,
      type: 'course',
      title: course.name,
      url: `/courses/${course.id}`,
      metadata: {
        description: course.description,
      },
    };
  }, [courses]);

  const createRecentItemFromAssignment = useCallback((assignmentId: string): Omit<RecentItem, 'accessedAt'> | null => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    const course = courses.find(c => c.id === assignment.courseId);

    return {
      id: assignment.id,
      type: 'assignment',
      title: assignment.title,
      url: `/courses/${assignment.courseId}/assignments/${assignment.id}`,
      metadata: {
        courseName: course?.name,
        dueDate: assignment.dueDate,
        description: assignment.description,
      },
    };
  }, [assignments, courses]);

  const createRecentItemFromLesson = useCallback((lessonId: string): Omit<RecentItem, 'accessedAt'> | null => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const course = courses.find(c => c.id === lesson.courseId);

    return {
      id: lesson.id,
      type: 'lesson',
      title: lesson.title,
      url: `/courses/${lesson.courseId}/lessons/${lesson.id}`,
      metadata: {
        courseName: course?.name,
      },
    };
  }, [lessons, courses]);

  const createRecentItemFromUser = useCallback((userId: string): Omit<RecentItem, 'accessedAt'> | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    return {
      id: user.id,
      type: 'user',
      title: user.name,
      url: `/users/${user.id}`,
      metadata: {
        description: user.bio,
      },
    };
  }, [users]);

  return {
    createRecentItemFromCourse,
    createRecentItemFromAssignment,
    createRecentItemFromLesson,
    createRecentItemFromUser,
  };
}