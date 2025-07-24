"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  fontSize: 'sm' | 'md' | 'lg'
  reducedMotion: boolean
  highContrast: boolean
}

interface ThemeContextValue {
  theme: ThemeConfig
  setTheme: (theme: Partial<ThemeConfig>) => void
  toggleMode: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  fontSize: 'md',
  reducedMotion: false,
  highContrast: false,
}

const STORAGE_KEY = 'classroomhq-theme-config'

export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme: setNextTheme, theme: nextTheme } = useNextTheme()
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedTheme = JSON.parse(stored)
        setThemeState({ ...DEFAULT_THEME, ...parsedTheme })
      } catch (error) {
        console.warn('Failed to parse stored theme config:', error)
      }
    }
    
    // Detect system motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setThemeState(prev => ({ ...prev, reducedMotion: true }))
    }
    
    setIsLoaded(true)
  }, [])

  // Sync with next-themes
  useEffect(() => {
    if (isLoaded && nextTheme !== theme.mode) {
      setThemeState(prev => ({ ...prev, mode: nextTheme as 'light' | 'dark' | 'system' }))
    }
  }, [nextTheme, isLoaded, theme.mode])

  // Apply theme changes to document
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg')
    switch (theme.fontSize) {
      case 'sm':
        root.classList.add('text-sm')
        break
      case 'lg':
        root.classList.add('text-lg')
        break
      default:
        root.classList.add('text-base')
    }

    // Apply reduced motion
    if (theme.reducedMotion) {
      root.style.setProperty('--motion-reduce', '1')
      root.classList.add('motion-reduce')
    } else {
      root.style.removeProperty('--motion-reduce')
      root.classList.remove('motion-reduce')
    }

    // Apply high contrast
    if (theme.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
  }, [theme, isLoaded])

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => {
      const updated = { ...prev, ...newTheme }
      
      // Sync mode with next-themes
      if (newTheme.mode && newTheme.mode !== prev.mode) {
        setNextTheme(newTheme.mode)
      }
      
      return updated
    })
  }

  const toggleMode = () => {
    const modes: ThemeConfig['mode'][] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.mode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setTheme({ mode: nextMode })
  }

  const increaseFontSize = () => {
    const sizes: ThemeConfig['fontSize'][] = ['sm', 'md', 'lg']
    const currentIndex = sizes.indexOf(theme.fontSize)
    if (currentIndex < sizes.length - 1) {
      setTheme({ fontSize: sizes[currentIndex + 1] })
    }
  }

  const decreaseFontSize = () => {
    const sizes: ThemeConfig['fontSize'][] = ['sm', 'md', 'lg']
    const currentIndex = sizes.indexOf(theme.fontSize)
    if (currentIndex > 0) {
      setTheme({ fontSize: sizes[currentIndex - 1] })
    }
  }

  const toggleReducedMotion = () => {
    setTheme({ reducedMotion: !theme.reducedMotion })
  }

  const toggleHighContrast = () => {
    setTheme({ highContrast: !theme.highContrast })
  }

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleMode,
    increaseFontSize,
    decreaseFontSize,
    toggleReducedMotion,
    toggleHighContrast,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}