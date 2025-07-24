"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useEnhancedTheme } from '@/contexts/ThemeContext'
import { Loader2 } from 'lucide-react'

interface NavigationLoaderProps {
  showProgressBar?: boolean
  showSpinner?: boolean
}

export function NavigationLoader({ 
  showProgressBar = true, 
  showSpinner = false 
}: NavigationLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const { theme } = useEnhancedTheme()

  useEffect(() => {
    let progressTimer: NodeJS.Timeout
    let loadingTimer: NodeJS.Timeout

    const startLoading = () => {
      setIsLoading(true)
      setProgress(0)
      
      // Simulate loading progress
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 100)
    }

    const stopLoading = () => {
      setProgress(100)
      loadingTimer = setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }

    // Start loading on pathname change
    startLoading()
    
    // Stop loading after a short delay (simulating page load)
    const stopTimer = setTimeout(stopLoading, 300)

    return () => {
      clearInterval(progressTimer)
      clearTimeout(loadingTimer)
      clearTimeout(stopTimer)
    }
  }, [pathname])

  if (theme.reducedMotion) {
    return (
      <AnimatePresence>
        {isLoading && showProgressBar && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/30">
            <div 
              className="h-full bg-primary transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {showProgressBar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-50"
            >
              <div className="h-1 bg-primary/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
          
          {showSpinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for programmatic navigation with loading states
export function useNavigationWithLoading() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateTo = async (href: string, options?: { replace?: boolean }) => {
    setIsNavigating(true)
    
    try {
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
      
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      setIsNavigating(false)
    }
  }

  const goBack = () => {
    setIsNavigating(true)
    router.back()
    setTimeout(() => setIsNavigating(false), 300)
  }

  const goForward = () => {
    setIsNavigating(true)
    router.forward()
    setTimeout(() => setIsNavigating(false), 300)
  }

  return {
    navigateTo,
    goBack,
    goForward,
    isNavigating
  }
}