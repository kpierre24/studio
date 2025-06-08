
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
    // If auth state is still loading (currentUser is undefined), do nothing yet.
    if (state.currentUser === undefined) { 
      return; 
    }

    // If auth state is resolved and there's no currentUser (meaning not logged in), redirect to auth.
    if (!state.currentUser) {
      router.replace(`/auth?redirect=${pathname}`);
    }
  }, [state.currentUser, router, pathname]);

  // Show loading skeleton if auth state is still being determined OR if redirecting.
  if (state.currentUser === undefined || (!state.currentUser && pathname !== '/auth')) {
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
  
  // If currentUser exists, render the layout with children.
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
