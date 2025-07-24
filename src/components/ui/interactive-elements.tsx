"use client"

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react'
import { useEnhancedTheme } from '@/contexts/ThemeContext'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced Button with loading states and animations
interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false,
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const { theme } = useEnhancedTheme()
    
    const baseClasses = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "relative overflow-hidden",
      {
        // Variants
        "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
        "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === 'outline',
        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
        "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
        "text-primary underline-offset-4 hover:underline": variant === 'link',
        
        // Sizes
        "h-10 px-4 py-2": size === 'default',
        "h-9 rounded-md px-3": size === 'sm',
        "h-11 rounded-md px-8": size === 'lg',
        "h-10 w-10": size === 'icon',
      },
      className
    )

    const motionProps: HTMLMotionProps<"button"> = theme.reducedMotion ? {} : {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.1 }
    }

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        
        <motion.span
          animate={{ opacity: loading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {loading && loadingText ? loadingText : children}
        </motion.span>
        
        {/* Ripple effect for non-reduced motion */}
        {!theme.reducedMotion && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-md"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </motion.button>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

// Enhanced Card with hover effects
interface EnhancedCardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean
  clickable?: boolean
  children: ReactNode
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hoverable = false, clickable = false, children, ...props }, ref) => {
    const { theme } = useEnhancedTheme()
    
    const motionProps: HTMLMotionProps<"div"> = theme.reducedMotion ? {} : {
      whileHover: hoverable || clickable ? { 
        y: -2, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      } : {},
      whileTap: clickable ? { scale: 0.98 } : {},
      transition: { duration: 0.2 }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          "transition-all duration-200",
          {
            "hover:shadow-md cursor-pointer": hoverable || clickable,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2": clickable
          },
          className
        )}
        tabIndex={clickable ? 0 : undefined}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

EnhancedCard.displayName = "EnhancedCard"

// Enhanced Input with focus animations
interface EnhancedInputProps extends HTMLMotionProps<"input"> {
  label?: string
  error?: string
  success?: boolean
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, success, ...props }, ref) => {
    const { theme } = useEnhancedTheme()
    
    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            initial={theme.reducedMotion ? {} : { opacity: 0, y: -5 }}
            animate={theme.reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <motion.input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            {
              "border-destructive focus-visible:ring-destructive": error,
              "border-green-500 focus-visible:ring-green-500": success,
            },
            className
          )}
          whileFocus={theme.reducedMotion ? {} : { scale: 1.01 }}
          transition={{ duration: 0.1 }}
          {...props}
        />
        
        {error && (
          <motion.p
            className="text-sm text-destructive"
            initial={theme.reducedMotion ? {} : { opacity: 0, y: -5 }}
            animate={theme.reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

// Interactive Link with hover effects
interface EnhancedLinkProps extends HTMLMotionProps<"a"> {
  children: ReactNode
  underlineOnHover?: boolean
}

export const EnhancedLink = forwardRef<HTMLAnchorElement, EnhancedLinkProps>(
  ({ className, children, underlineOnHover = true, ...props }, ref) => {
    const { theme } = useEnhancedTheme()
    
    return (
      <motion.a
        ref={ref}
        className={cn(
          "text-primary transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          {
            "hover:underline": underlineOnHover
          },
          className
        )}
        whileHover={theme.reducedMotion ? {} : { scale: 1.02 }}
        whileTap={theme.reducedMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {children}
      </motion.a>
    )
  }
)

EnhancedLink.displayName = "EnhancedLink"

// Loading state wrapper for any component
interface LoadingWrapperProps {
  loading: boolean
  children: ReactNode
  loadingComponent?: ReactNode
  className?: string
}

export function LoadingWrapper({ 
  loading, 
  children, 
  loadingComponent,
  className 
}: LoadingWrapperProps) {
  const { theme } = useEnhancedTheme()
  
  const defaultLoader = (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
  
  return (
    <div className={cn("relative", className)}>
      <motion.div
        animate={{ opacity: loading ? 0.5 : 1 }}
        transition={theme.reducedMotion ? { duration: 0 } : { duration: 0.2 }}
      >
        {children}
      </motion.div>
      
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md"
          initial={theme.reducedMotion ? {} : { opacity: 0 }}
          animate={theme.reducedMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {loadingComponent || defaultLoader}
        </motion.div>
      )}
    </div>
  )
}