import { Variants, Transition } from 'framer-motion'

// Animation durations
export const DURATIONS = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
} as const

// Easing functions
export const EASINGS = {
  ease: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const

// Common animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const slideInUp: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

export const slideInDown: Variants = {
  initial: {
    y: '-100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

// Stagger animations for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

// Page transition variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

// Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Pulse animation for loading states
export const pulseVariants: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Hover and tap animations
export const hoverScale = {
  whileHover: {
    scale: 1.05,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
  whileTap: {
    scale: 0.95,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
}

export const hoverLift = {
  whileHover: {
    y: -2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
  whileTap: {
    y: 0,
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
}

// Progress bar animation
export const progressBar: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: DURATIONS.slow,
      ease: EASINGS.easeOut,
    },
  }),
}

// Modal/Dialog animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: DURATIONS.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATIONS.fast,
    },
  },
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

// Micro-animations for UI interactions
export const buttonPress = {
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASINGS.easeOut,
    },
  },
}

export const gentleHover = {
  whileHover: {
    scale: 1.02,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
}

export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
}

// Form submission animations
export const formSubmitting: Variants = {
  initial: { opacity: 1 },
  submitting: {
    opacity: 0.7,
    scale: 0.98,
    transition: {
      duration: DURATIONS.fast,
    },
  },
  success: {
    opacity: 1,
    scale: 1,
    backgroundColor: 'hsl(var(--success))',
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  error: {
    opacity: 1,
    scale: 1,
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: EASINGS.easeOut,
    },
  },
}

// Loading states
export const loadingDots: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Success/Achievement animations
export const celebrationBounce: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
}

export const checkmarkDraw: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: EASINGS.easeOut },
      opacity: { duration: 0.1 },
    },
  },
}

// Page transitions
export const pageSlideLeft: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeIn,
    },
  },
}

export const pageSlideRight: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeIn,
    },
  },
}

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATIONS.fast,
    },
  },
}

// Notification animations
export const notificationSlideIn: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}

// Interactive element states
export const inputFocus = {
  whileFocus: {
    scale: 1.02,
    borderColor: 'hsl(var(--primary))',
    boxShadow: '0 0 0 2px hsl(var(--primary) / 0.2)',
    transition: {
      duration: DURATIONS.fast,
    },
  },
}

export const iconSpin = {
  whileHover: {
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
}

// Tooltip animations
export const tooltipVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.easeIn,
    },
  },
}