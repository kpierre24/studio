"use client"

import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useAnimations'
import { motionConfig } from '@/lib/motion-config'
import { useEffect, useState } from 'react'

interface MotionProviderProps {
  children: React.ReactNode
}

interface MotionPreferences {
  enableAnimations: boolean
  animationSpeed: number
  enableHoverEffects: boolean
  enablePageTransitions: boolean
  enableMicroAnimations: boolean
  enableParallax: boolean
  respectSystemPreference: boolean
}

const DEFAULT_MOTION_PREFERENCES: MotionPreferences = {
  enableAnimations: true,
  animationSpeed: 1,
  enableHoverEffects: true,
  enablePageTransitions: true,
  enableMicroAnimations: true,
  enableParallax: false,
  respectSystemPreference: true,
}

export function MotionProvider({ children }: MotionProviderProps) {
  const shouldReduceMotion = useReducedMotion()
  const [motionPrefs, setMotionPrefs] = useState<MotionPreferences>(DEFAULT_MOTION_PREFERENCES)

  // Load motion preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('classroomhq-motion-preferences')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMotionPrefs({ ...DEFAULT_MOTION_PREFERENCES, ...parsed })
      } catch (error) {
        console.warn('Failed to parse motion preferences:', error)
      }
    }
  }, [])

  // Calculate effective motion state
  const effectiveReducedMotion = shouldReduceMotion || !motionPrefs.enableAnimations

  // Create dynamic transition config based on speed preference
  const dynamicTransition = {
    ...motionConfig.transition,
    duration: motionConfig.transition.duration / motionPrefs.animationSpeed,
  }

  return (
    <MotionConfig
      reducedMotion={effectiveReducedMotion ? 'always' : 'never'}
      transition={dynamicTransition}
      features={{
        ...motionConfig.features,
        hover: motionPrefs.enableHoverEffects,
      }}
    >
      {children}
    </MotionConfig>
  )
}