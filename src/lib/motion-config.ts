import { MotionConfig } from 'framer-motion'

/**
 * Global motion configuration for Framer Motion
 * This provides consistent animation settings across the app
 */
export const motionConfig = {
  // Reduce motion for users who prefer it
  reducedMotion: 'user', // 'always' | 'never' | 'user'
  
  // Default transition settings
  transition: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier easing
    duration: 0.25,
  },
  
  // Feature flags for motion features
  features: {
    // Enable layout animations
    layout: true,
    // Enable drag gestures
    drag: true,
    // Enable hover gestures
    hover: true,
    // Enable tap gestures
    tap: true,
  },
}

/**
 * Animation presets for common UI patterns
 */
export const animationPresets = {
  // Quick animations for micro-interactions
  quick: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Standard animations for most UI elements
  standard: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Slow animations for complex transitions
  slow: {
    duration: 0.35,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Spring animations for playful interactions
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  
  // Bouncy spring for emphasis
  bouncySpring: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
}

/**
 * Viewport configuration for scroll-triggered animations
 */
export const viewportConfig = {
  // Trigger animations when element is 10% visible
  amount: 0.1,
  // Only trigger once
  once: true,
  // Add margin to trigger area
  margin: '0px 0px -100px 0px',
}

/**
 * Layout transition configuration
 */
export const layoutTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
}

/**
 * Drag constraints and configuration
 */
export const dragConfig = {
  // Elastic constraints
  dragElastic: 0.1,
  // Momentum configuration
  dragMomentum: false,
  // Transition back to original position
  dragTransition: {
    bounceStiffness: 600,
    bounceDamping: 20,
  },
}

/**
 * Gesture configuration
 */
export const gestureConfig = {
  // Hover detection
  hover: {
    // Delay before hover state activates
    delay: 0,
  },
  
  // Tap configuration
  tap: {
    // Scale down on tap
    scale: 0.95,
  },
  
  // Focus configuration
  focus: {
    // Scale up slightly on focus
    scale: 1.02,
  },
}