"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/layout/AppSidebar';
import { BreadcrumbNavigation } from '@/components/ui/breadcrumb-navigation';
import { useBreadcrumbData } from '@/hooks/useBreadcrumbData';
import { RecentItemsTracker } from '@/components/ui/recent-items-tracker';
import { PageTransition } from '@/components/ui/page-transitions';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { useFocusManagement, useAccessibilityShortcuts } from '@/hooks/useFocusManagement';
import { APP_NAME } from '@/lib/constants';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const breadcrumbs = useBreadcrumbData();
  
  // Enable focus management and accessibility shortcuts
  useFocusManagement();
  useAccessibilityShortcuts();

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
      <div className="flex min-h-screen">
        <div className="hidden md:block border-r bg-muted/40">
          <div className="w-64 p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-full mt-8" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
             <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <div className="flex-grow">
            <header className="flex items-center justify-between h-16 px-8 border-b">
                <Skeleton className="h-8 w-8 md:hidden" />
                <div className="flex items-center gap-4 ml-auto">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </main>
        </div>
      </div>
    );
  }
  
  // If currentUser exists, render the layout with children.
  return (
    <SidebarProvider>
        <NavigationLoader showProgressBar={true} />
        <AppSidebar />
        <SidebarInset>
            <Navbar />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <BreadcrumbNavigation items={breadcrumbs} />
                </div>
                <RecentItemsTracker>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </RecentItemsTracker>
            </main>
            <footer className="py-6 text-center text-sm text-muted-foreground border-t">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
