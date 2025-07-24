"use client"

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEnhancedTheme } from '@/contexts/ThemeContext'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// Animation variants for different transition types
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: -30
  }
}

const fadeVariants: Variants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
}

// Reduced motion variants
const reducedMotionVariants: Variants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname()
  const { theme } = useEnhancedTheme()
  const [isNavigating, setIsNavigating] = useState(false)

  // Choose animation variant based on motion preferences
  const getVariants = () => {
    if (theme.reducedMotion) {
      return reducedMotionVariants
    }
    
    // Use different animations for different route types
    if (pathname.includes('/settings')) {
      return slideVariants
    } else if (pathname.includes('/courses')) {
      return pageVariants
    } else {
      return fadeVariants
    }
  }

  const getTransition = () => {
    if (theme.reducedMotion) {
      return {
        duration: 0.15,
        ease: "easeInOut"
      }
    }
    
    return {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsNavigating(false)}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={getTransition()}
        className={className}
        onAnimationStart={() => setIsNavigating(true)}
        onAnimationComplete={() => setIsNavigating(false)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Loading indicator for page transitions
export function PageTransitionLoader() {
  const { theme } = useEnhancedTheme()
  
  if (theme.reducedMotion) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-primary/20">
          <div className="h-full bg-primary w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="h-1 bg-primary/20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      >
        <motion.div
          className="h-full bg-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ originX: 0 }}
        />
      </motion.div>
    </div>
  )
}

// Hook to detect navigation state
export function usePageTransition() {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return { isNavigating }
}

// Navigation transition wrapper for specific route changes
interface RouteTransitionProps {
  children: ReactNode
  direction?: 'forward' | 'backward' | 'none'
}

export function RouteTransition({ children, direction = 'none' }: RouteTransitionProps) {
  const { theme } = useEnhancedTheme()
  
  const getDirectionalVariants = (): Variants => {
    if (theme.reducedMotion) {
      return reducedMotionVariants
    }

    switch (direction) {
      case 'forward':
        return {
          initial: { opacity: 0, x: 50 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: -50 }
        }
      case 'backward':
        return {
          initial: { opacity: 0, x: -50 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: 50 }
        }
      default:
        return fadeVariants
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={getDirectionalVariants()}
      transition={getTransition()}
    >
      {children}
    </motion.div>
  )
}