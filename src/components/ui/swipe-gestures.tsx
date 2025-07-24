"use client";

import React, { useRef, useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface SwipeGestureProps {
  children: React.ReactNode;
  className?: string;
  
  // Swipe callbacks
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  
  // Swipe configuration
  swipeThreshold?: number;
  velocityThreshold?: number;
  
  // Visual feedback
  showSwipeIndicators?: boolean;
  swipeIndicatorText?: {
    left?: string;
    right?: string;
    up?: string;
    down?: string;
  };
  
  // Constraints
  enabledDirections?: ('left' | 'right' | 'up' | 'down')[];
  
  // Resistance when swiping beyond threshold
  resistance?: number;
}

export function SwipeGesture({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  velocityThreshold = 500,
  showSwipeIndicators = true,
  swipeIndicatorText = {},
  enabledDirections = ['left', 'right'],
  resistance = 0.5,
}: SwipeGestureProps) {
  const isMobile = useIsMobile();
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for visual feedback
  const leftIndicatorOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const upIndicatorOpacity = useTransform(y, [-swipeThreshold, 0], [1, 0]);
  const downIndicatorOpacity = useTransform(y, [0, swipeThreshold], [0, 1]);
  
  const handlePanStart = useCallback(() => {
    setIsSwipeActive(true);
  }, []);
  
  const handlePan = useCallback((event: any, info: PanInfo) => {
    const { offset } = info;
    
    // Determine primary swipe direction
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      setSwipeDirection(offset.x > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(offset.y > 0 ? 'down' : 'up');
    }
  }, []);
  
  const handlePanEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    setIsSwipeActive(false);
    setSwipeDirection(null);
    
    // Reset position
    x.set(0);
    y.set(0);
    
    // Check for swipe completion based on distance or velocity
    const isSwipeComplete = (distance: number, vel: number) => 
      Math.abs(distance) > swipeThreshold || Math.abs(vel) > velocityThreshold;
    
    // Handle horizontal swipes
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > 0 && enabledDirections.includes('right') && isSwipeComplete(offset.x, velocity.x)) {
        onSwipeRight?.();
      } else if (offset.x < 0 && enabledDirections.includes('left') && isSwipeComplete(offset.x, velocity.x)) {
        onSwipeLeft?.();
      }
    }
    // Handle vertical swipes
    else {
      if (offset.y > 0 && enabledDirections.includes('down') && isSwipeComplete(offset.y, velocity.y)) {
        onSwipeDown?.();
      } else if (offset.y < 0 && enabledDirections.includes('up') && isSwipeComplete(offset.y, velocity.y)) {
        onSwipeUp?.();
      }
    }
  }, [
    x, y, swipeThreshold, velocityThreshold, enabledDirections,
    onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown
  ]);
  
  // Don't add swipe gestures on desktop
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Swipe Indicators */}
      {showSwipeIndicators && (
        <>
          {/* Left swipe indicator */}
          {enabledDirections.includes('left') && onSwipeLeft && (
            <motion.div
              style={{ opacity: leftIndicatorOpacity }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 text-destructive pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">
                {swipeIndicatorText.left || 'Swipe left'}
              </span>
            </motion.div>
          )}
          
          {/* Right swipe indicator */}
          {enabledDirections.includes('right') && onSwipeRight && (
            <motion.div
              style={{ opacity: rightIndicatorOpacity }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 text-primary pointer-events-none"
            >
              <span className="text-sm font-medium">
                {swipeIndicatorText.right || 'Swipe right'}
              </span>
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          )}
          
          {/* Up swipe indicator */}
          {enabledDirections.includes('up') && onSwipeUp && (
            <motion.div
              style={{ opacity: upIndicatorOpacity }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-primary pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5 rotate-90" />
              <span className="text-sm font-medium">
                {swipeIndicatorText.up || 'Swipe up'}
              </span>
            </motion.div>
          )}
          
          {/* Down swipe indicator */}
          {enabledDirections.includes('down') && onSwipeDown && (
            <motion.div
              style={{ opacity: downIndicatorOpacity }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-primary pointer-events-none"
            >
              <span className="text-sm font-medium">
                {swipeIndicatorText.down || 'Swipe down'}
              </span>
              <ChevronRight className="h-5 w-5 rotate-90" />
            </motion.div>
          )}
        </>
      )}
      
      {/* Swipeable content */}
      <motion.div
        drag={enabledDirections.length > 0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={resistance}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ x, y }}
        className={cn(
          "touch-manipulation",
          isSwipeActive && "cursor-grabbing"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * SwipeableCard - A card component with swipe actions
 */
interface SwipeableCardProps {
  children: React.ReactNode;
  className?: string;
  
  // Swipe actions
  leftAction?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color?: 'destructive' | 'primary' | 'secondary';
    onAction: () => void;
  };
  
  rightAction?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color?: 'destructive' | 'primary' | 'secondary';
    onAction: () => void;
  };
}

export function SwipeableCard({
  children,
  className,
  leftAction,
  rightAction,
}: SwipeableCardProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile || (!leftAction && !rightAction)) {
    return (
      <div className={cn("rounded-lg border bg-card p-4", className)}>
        {children}
      </div>
    );
  }
  
  return (
    <SwipeGesture
      className={className}
      onSwipeLeft={leftAction?.onAction}
      onSwipeRight={rightAction?.onAction}
      enabledDirections={[
        ...(leftAction ? ['left'] as const : []),
        ...(rightAction ? ['right'] as const : [])
      ]}
      swipeIndicatorText={{
        left: leftAction?.label,
        right: rightAction?.label,
      }}
    >
      <div className="rounded-lg border bg-card p-4">
        {children}
      </div>
    </SwipeGesture>
  );
}

/**
 * SwipeableList - A list component with swipe-to-reveal actions
 */
interface SwipeableListItem {
  id: string;
  content: React.ReactNode;
  leftAction?: SwipeableCardProps['leftAction'];
  rightAction?: SwipeableCardProps['rightAction'];
}

interface SwipeableListProps {
  items: SwipeableListItem[];
  className?: string;
  itemClassName?: string;
}

export function SwipeableList({
  items,
  className,
  itemClassName,
}: SwipeableListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <SwipeableCard
          key={item.id}
          className={itemClassName}
          leftAction={item.leftAction}
          rightAction={item.rightAction}
        >
          {item.content}
        </SwipeableCard>
      ))}
    </div>
  );
}

/**
 * PullToRefresh - A component that enables pull-to-refresh functionality
 */
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  refreshThreshold?: number;
  refreshText?: string;
  refreshingText?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  refreshThreshold = 80,
  refreshText = "Pull to refresh",
  refreshingText = "Refreshing...",
}: PullToRefreshProps) {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const y = useMotionValue(0);
  const refreshOpacity = useTransform(y, [0, refreshThreshold], [0, 1]);
  
  const handlePan = useCallback((event: any, info: PanInfo) => {
    const { offset } = info;
    if (offset.y > 0) {
      setPullDistance(offset.y);
    }
  }, []);
  
  const handlePanEnd = useCallback(async (event: any, info: PanInfo) => {
    const { offset } = info;
    setPullDistance(0);
    y.set(0);
    
    if (offset.y > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [refreshThreshold, isRefreshing, onRefresh, y]);
  
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div className={cn("relative", className)}>
      {/* Pull to refresh indicator */}
      <motion.div
        style={{ opacity: refreshOpacity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center gap-2 p-4 pointer-events-none"
      >
        <div className={cn(
          "w-8 h-8 rounded-full border-2 border-primary",
          isRefreshing && "animate-spin border-t-transparent"
        )} />
        <span className="text-sm font-medium text-primary">
          {isRefreshing ? refreshingText : refreshText}
        </span>
      </motion.div>
      
      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ y }}
        className="touch-manipulation"
      >
        {children}
      </motion.div>
    </div>
  );
}