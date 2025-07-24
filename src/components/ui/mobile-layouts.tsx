"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, X, Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TouchFriendlyInterface, TouchFriendlyButton } from './touch-friendly-interface';

/**
 * MobileStack - A mobile-optimized stack layout with proper spacing
 */
interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileStack({ 
  children, 
  className, 
  spacing = 'md',
  padding = 'md' 
}: MobileStackProps) {
  const isMobile = useIsMobile();
  
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };
  
  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-2',
    md: isMobile ? 'p-4' : 'p-3',
    lg: isMobile ? 'p-6' : 'p-4',
  };
  
  return (
    <div className={cn(
      spacingClasses[spacing],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * MobileGrid - A responsive grid that adapts to mobile screens
 */
interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile: 1 | 2;
    tablet: 2 | 3 | 4;
    desktop: 3 | 4 | 5 | 6;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function MobileGrid({ 
  children, 
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };
  
  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    `grid-cols-${columns.mobile}`,
    `sm:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    className
  );
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

/**
 * MobileCollapsible - A collapsible section optimized for mobile
 */
interface MobileCollapsibleProps {
  children: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function MobileCollapsible({
  children,
  title,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
  icon: Icon,
}: MobileCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <TouchFriendlyInterface
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between p-4 bg-muted/50 border-b",
          "hover:bg-muted/70 transition-colors",
          headerClassName
        )}
        touchSize="lg"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <h3 className="font-medium">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </TouchFriendlyInterface>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={cn("p-4", contentClassName)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * MobileModal - A full-screen modal optimized for mobile
 */
interface MobileModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileModal({
  children,
  isOpen,
  onClose,
  title,
  className,
  showCloseButton = true,
  showBackButton = false,
  onBack,
}: MobileModalProps) {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isMobile) {
    // Use regular modal for desktop
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full max-w-lg mx-4 bg-background border rounded-lg shadow-lg",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 border-b">
                  {title && <h2 className="text-lg font-semibold">{title}</h2>}
                  {showCloseButton && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Full-screen mobile modal
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "fixed inset-0 z-50 bg-background flex flex-col",
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton || showBackButton) && (
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <TouchFriendlyButton
                    onClick={onBack || onClose}
                    className="p-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </TouchFriendlyButton>
                )}
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
              </div>
              {showCloseButton && (
                <TouchFriendlyButton
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </TouchFriendlyButton>
              )}
            </div>
          )}
          
          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {children}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * MobileBottomSheet - A bottom sheet component for mobile
 */
interface MobileBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  snapPoints?: number[]; // Percentage heights
  defaultSnapPoint?: number;
}

export function MobileBottomSheet({
  children,
  isOpen,
  onClose,
  title,
  className,
  snapPoints = [50, 90],
  defaultSnapPoint = 0,
}: MobileBottomSheetProps) {
  const isMobile = useIsMobile();
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isMobile) {
    return null; // Bottom sheets are mobile-only
  }
  
  const currentHeight = snapPoints[currentSnapPoint];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: `${100 - currentHeight}%` }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-xl",
              "flex flex-col max-h-[90vh]",
              className
            )}
            style={{ height: `${currentHeight}vh` }}
          >
            {/* Handle */}
            <div className="flex justify-center p-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Header */}
            {title && (
              <div className="px-4 pb-2">
                <h2 className="text-lg font-semibold text-center">{title}</h2>
              </div>
            )}
            
            {/* Snap point indicators */}
            {snapPoints.length > 1 && (
              <div className="flex justify-center gap-1 pb-2">
                {snapPoints.map((_, index) => (
                  <TouchFriendlyInterface
                    key={index}
                    onClick={() => setCurrentSnapPoint(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentSnapPoint
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
            
            {/* Content */}
            <ScrollArea className="flex-1 px-4 pb-4">
              {children}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * MobileTabs - Tab component optimized for mobile with horizontal scrolling
 */
interface MobileTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface MobileTabsProps {
  tabs: MobileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function MobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'default',
}: MobileTabsProps) {
  const isMobile = useIsMobile();
  
  const variantClasses = {
    default: {
      container: "border-b",
      tab: "border-b-2 border-transparent data-[active=true]:border-primary",
      activeText: "text-primary",
      inactiveText: "text-muted-foreground",
    },
    pills: {
      container: "bg-muted p-1 rounded-lg",
      tab: "rounded-md data-[active=true]:bg-background data-[active=true]:shadow-sm",
      activeText: "text-foreground",
      inactiveText: "text-muted-foreground",
    },
    underline: {
      container: "",
      tab: "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[active=true]:after:scale-x-100 after:transition-transform",
      activeText: "text-primary",
      inactiveText: "text-muted-foreground",
    },
  };
  
  const styles = variantClasses[variant];
  
  return (
    <div className={cn(styles.container, className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <TouchFriendlyInterface
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                data-active={isActive}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative",
                  styles.tab,
                  isActive ? styles.activeText : styles.inactiveText,
                  isMobile && "min-h-[48px]" // Ensure touch target
                )}
                touchSize="md"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                    {tab.badge}
                  </span>
                )}
              </TouchFriendlyInterface>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}