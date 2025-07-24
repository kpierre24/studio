"use client";

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchFriendlyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant for touch targets
   * - sm: 40px minimum (for secondary actions)
   * - md: 44px minimum (recommended default)
   * - lg: 48px minimum (for primary actions)
   */
  touchSize?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to add haptic feedback on touch (if supported)
   */
  hapticFeedback?: boolean;
  
  /**
   * Whether to show touch ripple effect
   */
  showRipple?: boolean;
  
  /**
   * Whether to add touch-specific hover states
   */
  touchHover?: boolean;
  
  /**
   * Custom touch area padding
   */
  touchPadding?: string;
  
  /**
   * Whether this is a pressable element
   */
  pressable?: boolean;
  
  /**
   * Motion props for animations
   */
  motionProps?: MotionProps;
}

/**
 * TouchFriendlyInterface component that provides enhanced touch interactions
 * Follows iOS and Android touch target guidelines (minimum 44px)
 */
export const TouchFriendlyInterface = forwardRef<HTMLDivElement, TouchFriendlyProps>(
  ({
    children,
    className,
    touchSize = 'md',
    hapticFeedback = false,
    showRipple = true,
    touchHover = true,
    touchPadding,
    pressable = true,
    motionProps,
    onClick,
    onTouchStart,
    onTouchEnd,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10); // Light haptic feedback
      }
      onTouchStart?.(e);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      onTouchEnd?.(e);
    };

    const touchSizeClasses = {
      sm: 'min-h-[40px] min-w-[40px]',
      md: 'min-h-[44px] min-w-[44px]',
      lg: 'min-h-[48px] min-w-[48px]',
    };

    const baseClasses = cn(
      // Touch target sizing
      touchSizeClasses[touchSize],
      
      // Touch-friendly spacing
      touchPadding || (isMobile ? 'p-3' : 'p-2'),
      
      // Touch interactions
      'touch-manipulation',
      'select-none',
      
      // Visual feedback
      touchHover && [
        'transition-all duration-150 ease-out',
        'hover:bg-accent/50',
        'active:bg-accent/70',
        'active:scale-[0.98]',
      ],
      
      // Accessibility
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      
      // Cursor
      onClick && 'cursor-pointer',
      
      className
    );

    const motionConfig: MotionProps = {
      whileTap: pressable ? { scale: 0.98 } : undefined,
      transition: { type: "spring", stiffness: 400, damping: 25 },
      ...motionProps,
    };

    if (isMobile && (pressable || motionProps)) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          onClick={onClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          {...(motionConfig as any)}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchFriendlyInterface.displayName = 'TouchFriendlyInterface';

/**
 * TouchFriendlyButton - A button optimized for touch interactions
 */
interface TouchFriendlyButtonProps extends TouchFriendlyProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const TouchFriendlyButton = forwardRef<HTMLButtonElement, TouchFriendlyButtonProps & { 
  children: React.ReactNode;
  onClick?: () => void;
}>(
  ({
    children,
    className,
    variant = 'default',
    size = 'md',
    disabled = false,
    touchSize,
    hapticFeedback = true,
    onClick,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    
    const handleClick = () => {
      if (disabled) return;
      
      if (hapticFeedback && isMobile && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      onClick?.();
    };

    const variantClasses = {
      default: 'bg-background border border-input hover:bg-accent hover:text-accent-foreground',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-11 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    const buttonClasses = cn(
      // Base button styles
      'inline-flex items-center justify-center rounded-md font-medium',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      
      // Touch optimizations
      'touch-manipulation',
      isMobile && 'min-h-[44px]', // Ensure minimum touch target
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[size],
      
      // Active states for mobile
      isMobile && [
        'active:scale-[0.98]',
        'active:transition-transform active:duration-75',
      ],
      
      className
    );

    if (isMobile) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          onClick={handleClick}
          disabled={disabled}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          {...(props as any)}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled}
        {...(props as any)}
      >
        {children}
      </button>
    );
  }
);

TouchFriendlyButton.displayName = 'TouchFriendlyButton';

/**
 * TouchFriendlyCard - A card component optimized for touch interactions
 */
interface TouchFriendlyCardProps extends TouchFriendlyProps {
  interactive?: boolean;
  elevated?: boolean;
}

export const TouchFriendlyCard = forwardRef<HTMLDivElement, TouchFriendlyCardProps>(
  ({
    children,
    className,
    interactive = false,
    elevated = false,
    touchSize = 'md',
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    
    const cardClasses = cn(
      // Base card styles
      'rounded-lg border bg-card text-card-foreground',
      
      // Elevation
      elevated ? 'shadow-lg' : 'shadow-sm',
      
      // Interactive states
      interactive && [
        'transition-all duration-200',
        'hover:shadow-md',
        isMobile && 'active:shadow-lg active:scale-[0.99]',
      ],
      
      // Touch optimizations
      isMobile && interactive && 'touch-manipulation',
      
      className
    );

    if (interactive && isMobile) {
      return (
        <TouchFriendlyInterface
          ref={ref}
          className={cardClasses}
          touchSize={touchSize}
          pressable={interactive}
          {...props}
        >
          {children}
        </TouchFriendlyInterface>
      );
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchFriendlyCard.displayName = 'TouchFriendlyCard';