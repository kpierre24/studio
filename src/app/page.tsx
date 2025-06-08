"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (state.currentUser === undefined) { // Still loading from context
      return;
    }

    if (state.currentUser) {
      switch (state.currentUser.role) {
        case UserRole.SUPER_ADMIN:
          router.replace('/admin/dashboard');
          break;
        case UserRole.TEACHER:
          router.replace('/teacher/dashboard');
          break;
        case UserRole.STUDENT:
          router.replace('/student/dashboard');
          break;
        default:
          router.replace('/auth'); // Fallback, should not happen
      }
    } else {
      router.replace('/auth');
    }
  }, [state.currentUser, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    </div>
  );
}
