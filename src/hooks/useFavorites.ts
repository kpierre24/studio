"use client";

import { useState, useEffect, useCallback } from 'react';
import { FavoriteItem } from '@/components/ui/favorites-manager';
import { useAppContext } from '@/contexts/AppContext';

const FAVORITES_STORAGE_KEY = 'classroomhq-favorites';

export function useFavorites() {
  const { state } = useAppContext();
  const { currentUser } = state;
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${FAVORITES_STORAGE_KEY}-${currentUser.id}`);
      if (stored) {
        const parsedFavorites = JSON.parse(stored).map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt),
        }));
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!currentUser || isLoading) return;

    try {
      localStorage.setItem(
        `${FAVORITES_STORAGE_KEY}-${currentUser.id}`,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, currentUser, isLoading]);

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    const newFavorite: FavoriteItem = {
      ...item,
      addedAt: new Date(),
    };

    setFavorites(prev => {
      // Check if already exists
      if (prev.some(fav => fav.id === item.id)) {
        return prev;
      }
      return [newFavorite, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  }, []);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    const isFavorited = favorites.some(fav => fav.id === item.id);
    
    if (isFavorited) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorited = useCallback((id: string) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  const getFavoritesByType = useCallback((type: FavoriteItem['type']) => {
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoritesByType,
    clearAllFavorites,
  };
}

// Helper hook for getting favorite data for specific content types
export function useFavoriteHelpers() {
  const { state } = useAppContext();
  const { courses, assignments, lessons } = state;

  const createFavoriteFromCourse = useCallback((courseId: string): Omit<FavoriteItem, 'addedAt'> | null => {
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

  const createFavoriteFromAssignment = useCallback((assignmentId: string): Omit<FavoriteItem, 'addedAt'> | null => {
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

  const createFavoriteFromLesson = useCallback((lessonId: string): Omit<FavoriteItem, 'addedAt'> | null => {
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

  return {
    createFavoriteFromCourse,
    createFavoriteFromAssignment,
    createFavoriteFromLesson,
  };
}