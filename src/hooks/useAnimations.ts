import { useEffect, useState } from 'react'
import { useEnhancedTheme } from '@/contexts/ThemeContext'

/**
 * Hook to check if animations should be reduced based on user preferences
 */
export function useReducedMotion() {
  const { theme } = useEnhancedTheme()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Return true if either system preference or user setting indicates reduced motion
  return prefersReducedMotion || theme.reducedMotion
}

/**
 * Hook to get animation variants that respect motion preferences
 */
export function useMotionVariants() {
  const shouldReduceMotion = useReducedMotion()

  const getVariants = (variants: any) => {
    if (shouldReduceMotion) {
      // Return static variants for reduced motion
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }
    return variants
  }

  const getTransition = (transition: any) => {
    if (shouldReduceMotion) {
      return { duration: 0.01 }
    }
    return transition
  }

  return { getVariants, getTransition, shouldReduceMotion }
}

/**
 * Hook for staggered animations with motion preference support
 */
export function useStaggerAnimation(itemCount: number, delay = 0.1) {
  const { shouldReduceMotion } = useMotionVariants()

  const containerVariants = {
    initial: {},
    animate: {
      transition: shouldReduceMotion
        ? {}
        : {
            staggerChildren: delay,
            delayChildren: delay,
          },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.01 }
        : { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return { containerVariants, itemVariants }
}

/**
 * Hook for page transition animations
 */
export function usePageTransition() {
  const { getVariants } = useMotionVariants()

  return getVariants({
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  })
}

/**
 * Hook for hover animations that respect motion preferences
 */
export function useHoverAnimation() {
  const { shouldReduceMotion } = useMotionVariants()

  const hoverScale = shouldReduceMotion
    ? {}
    : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      }

  const hoverLift = shouldReduceMotion
    ? {}
    : {
        whileHover: {
          y: -2,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
        whileTap: {
          y: 0,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        },
      }

  return { hoverScale, hoverLift }
}

/**
 * Hook for loading animations
 */
export function useLoadingAnimation() {
  const { shouldReduceMotion } = useMotionVariants()

  const spinnerAnimation = shouldReduceMotion
    ? {}
    : {
        animate: {
          rotate: 360,
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          },
        },
      }

  const pulseAnimation = shouldReduceMotion
    ? {}
    : {
        animate: {
          opacity: [0.5, 1, 0.5],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }

  return { spinnerAnimation, pulseAnimation }
}

/**
 * Hook for progress animations
 */
export function useProgressAnimation(progress: number) {
  const { shouldReduceMotion } = useMotionVariants()

  const progressVariants = {
    initial: { scaleX: 0, originX: 0 },
    animate: {
      scaleX: progress / 100,
      transition: shouldReduceMotion
        ? { duration: 0.01 }
        : { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return progressVariants
}

/**
 * Hook for modal/dialog animations
 */
export function useModalAnimation() {
  const { getVariants } = useMotionVariants()

  const backdropVariants = getVariants({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  })

  const contentVariants = getVariants({
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  })

  return { backdropVariants, contentVariants }
}