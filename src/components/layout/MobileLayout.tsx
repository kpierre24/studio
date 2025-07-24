"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { PullToRefresh } from '@/components/ui/swipe-gestures';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  
  // Navigation options
  showBottomNavigation?: boolean;
  navigationVariant?: 'bottom-tabs' | 'hamburger';
  
  // Pull to refresh
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  
  // Layout options
  fullHeight?: boolean;
  safeArea?: boolean;
  
  // Custom navigation items (if needed)
  customNavigation?: React.ReactNode;
}

export function MobileLayout({
  children,
  className,
  showBottomNavigation = true,
  navigationVariant = 'bottom-tabs',
  enablePullToRefresh = false,
  onRefresh,
  fullHeight = true,
  safeArea = true,
  customNavigation,
}: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  
  // Don't apply mobile layout on desktop
  if (!isMobile) {
    return <>{children}</>;
  }
  
  // Determine if we should show bottom navigation based on current route
  const shouldShowBottomNav = showBottomNavigation && !pathname.includes('/auth');
  
  const layoutClasses = cn(
    "flex flex-col",
    fullHeight && "min-h-screen",
    safeArea && [
      "safe-area-inset-top",
      shouldShowBottomNav && "safe-area-inset-bottom"
    ],
    className
  );
  
  const contentClasses = cn(
    "flex-1 overflow-auto",
    // Add bottom padding when bottom navigation is shown
    shouldShowBottomNav && "pb-20" // Account for bottom navigation height
  );
  
  const content = (
    <main className={contentClasses}>
      {children}
    </main>
  );
  
  return (
    <div className={layoutClasses}>
      {/* Main content with optional pull-to-refresh */}
      {enablePullToRefresh && onRefresh ? (
        <PullToRefresh onRefresh={onRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
      
      {/* Bottom Navigation */}
      {shouldShowBottomNav && (
        customNavigation || (
          <MobileNavigation variant={navigationVariant} />
        )
      )}
    </div>
  );
}

/**
 * MobilePageLayout - A complete page layout for mobile with header and content
 */
interface MobilePageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  
  // Header options
  showHeader?: boolean;
  headerClassName?: string;
  
  // Back navigation
  showBackButton?: boolean;
  onBack?: () => void;
  
  // Layout options
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobilePageLayout({
  children,
  title,
  subtitle,
  headerActions,
  className,
  contentClassName,
  showHeader = true,
  headerClassName,
  showBackButton = false,
  onBack,
  padding = 'md',
  spacing = 'md',
}: MobilePageLayoutProps) {
  const isMobile = useIsMobile();
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };
  
  if (!isMobile) {
    return (
      <div className={cn(paddingClasses[padding], spacingClasses[spacing], className)}>
        {showHeader && (title || subtitle || headerActions) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            {headerActions && <div className="mt-4">{headerActions}</div>}
          </div>
        )}
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(paddingClasses[padding], spacingClasses[spacing], className)}>
      {/* Mobile Header */}
      {showHeader && (title || subtitle || headerActions || showBackButton) && (
        <div className={cn("mb-4", headerClassName)}>
          {/* Title section */}
          {(title || subtitle) && (
            <div className="mb-3">
              {title && (
                <h1 className="text-xl font-bold leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {/* Header actions */}
          {headerActions && (
            <div className="flex flex-wrap gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}

/**
 * MobileContentLayout - A layout specifically for content-heavy pages
 */
interface MobileContentLayoutProps {
  children: React.ReactNode;
  className?: string;
  
  // Content options
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  
  // Reading experience
  optimizeForReading?: boolean;
}

export function MobileContentLayout({
  children,
  className,
  maxWidth = 'none',
  centered = false,
  optimizeForReading = false,
}: MobileContentLayoutProps) {
  const isMobile = useIsMobile();
  
  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  const contentClasses = cn(
    // Base layout
    "w-full",
    
    // Max width
    maxWidthClasses[maxWidth],
    
    // Centering
    centered && "mx-auto",
    
    // Reading optimization
    optimizeForReading && [
      "prose prose-sm max-w-none",
      "prose-headings:font-semibold",
      "prose-p:leading-relaxed",
      "prose-li:leading-relaxed",
      isMobile && [
        "prose-headings:text-base prose-headings:leading-tight",
        "prose-p:text-sm",
        "prose-li:text-sm",
      ]
    ],
    
    className
  );
  
  return (
    <div className={contentClasses}>
      {children}
    </div>
  );
}