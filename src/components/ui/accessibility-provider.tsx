"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextValue {
  isKeyboardNavigation: boolean
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  focusElement: (selector: string) => void
  skipToContent: () => void
  colorContrastLevel: 'AA' | 'AAA'
  setColorContrastLevel: (level: 'AA' | 'AAA') => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)
  const [colorContrastLevel, setColorContrastLevel] = useState<'AA' | 'AAA'>('AA')
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Create screen reader announcer element
    const announcerElement = document.createElement('div')
    announcerElement.setAttribute('aria-live', 'polite')
    announcerElement.setAttribute('aria-atomic', 'true')
    announcerElement.setAttribute('aria-relevant', 'text')
    announcerElement.style.position = 'absolute'
    announcerElement.style.left = '-10000px'
    announcerElement.style.width = '1px'
    announcerElement.style.height = '1px'
    announcerElement.style.overflow = 'hidden'
    document.body.appendChild(announcerElement)
    setAnnouncer(announcerElement)

    // Detect keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true)
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false)
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Add skip links
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      skipToContent()
    })
    document.body.insertBefore(skipLink, document.body.firstChild)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement)
      }
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [])

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
      
      // Clear the message after a short delay to allow for re-announcements
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      // Announce focus change for screen readers
      const elementText = element.textContent || element.getAttribute('aria-label') || 'Element'
      announceToScreenReader(`Focused on ${elementText}`)
    }
  }

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content') || 
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]')
    
    if (mainContent) {
      (mainContent as HTMLElement).focus()
      announceToScreenReader('Skipped to main content')
    }
  }

  const value: AccessibilityContextValue = {
    isKeyboardNavigation,
    announceToScreenReader,
    focusElement,
    skipToContent,
    colorContrastLevel,
    setColorContrastLevel,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Higher-order component to add accessibility features to any component
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    role?: string
    ariaLabel?: string
    focusable?: boolean
  }
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    const { announceToScreenReader } = useAccessibility()

    const enhancedProps = {
      ...props,
      ref,
      role: options?.role,
      'aria-label': options?.ariaLabel,
      tabIndex: options?.focusable ? 0 : undefined,
      onFocus: (e: React.FocusEvent) => {
        if (options?.ariaLabel) {
          announceToScreenReader(`Focused on ${options.ariaLabel}`)
        }
        // Call original onFocus if it exists
        if ('onFocus' in props && typeof props.onFocus === 'function') {
          props.onFocus(e)
        }
      },
    }

    return <Component {...enhancedProps} />
  })
}