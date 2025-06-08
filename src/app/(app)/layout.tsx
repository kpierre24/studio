"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for context to potentially load currentUser
    if (state.currentUser === undefined && !state.users.length) { // Assuming users load with currentUser
      return; 
    }

    if (!state.currentUser) {
      router.replace(`/auth?redirect=${pathname}`);
    }
  }, [state.currentUser, state.users, router, pathname]);

  if (!state.currentUser && !(state.currentUser === undefined && !state.users.length)) {
     // Show a loading skeleton or a minimal loading message while redirecting
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} ClassroomHQ. All rights reserved.
        </footer>
      </div>
    );
  }
  
  if (state.currentUser === undefined && !state.users.length) {
    // Still loading initial data, show loading state
     return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Navbar can show basic state even when loading */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} ClassroomHQ. All rights reserved.
        </footer>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ClassroomHQ. All rights reserved.
      </footer>
    </div>
  );
}
