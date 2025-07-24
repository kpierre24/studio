"use client"

import React, { useEffect, useRef } from 'react'
import { useAccessibility } from './accessibility-provider'

interface KeyboardNavigationProps {
  children: React.ReactNode
  onEscape?: () => void
  onEnter?: () => void
  trapFocus?: boolean
  autoFocus?: boolean
  restoreFocus?: boolean
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  trapFocus = false,
  autoFocus = false,
  restoreFocus = false,
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0]
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [autoFocus, restoreFocus])

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
          announceToScreenReader('Dialog closed')
        }
        break

      case 'Enter':
        if (onEnter && event.target === containerRef.current) {
          event.preventDefault()
          onEnter()
        }
        break

      case 'Tab':
        if (trapFocus && containerRef.current) {
          const focusableElements = getFocusableElements(containerRef.current)
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault()
              lastElement?.focus()
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault()
              firstElement?.focus()
            }
          }
        }
        break

      case 'ArrowDown':
      case 'ArrowUp':
        // Handle arrow key navigation for lists and menus
        if (containerRef.current?.getAttribute('role') === 'menu' || 
            containerRef.current?.getAttribute('role') === 'listbox') {
          event.preventDefault()
          navigateWithArrows(event.key === 'ArrowDown' ? 'next' : 'previous')
        }
        break

      case 'Home':
        if (containerRef.current?.getAttribute('role') === 'menu' || 
            containerRef.current?.getAttribute('role') === 'listbox') {
          event.preventDefault()
          const focusableElements = getFocusableElements(containerRef.current)
          focusableElements[0]?.focus()
        }
        break

      case 'End':
        if (containerRef.current?.getAttribute('role') === 'menu' || 
            containerRef.current?.getAttribute('role') === 'listbox') {
          event.preventDefault()
          const focusableElements = getFocusableElements(containerRef.current)
          focusableElements[focusableElements.length - 1]?.focus()
        }
        break
    }
  }

  const navigateWithArrows = (direction: 'next' | 'previous') => {
    if (!containerRef.current) return

    const focusableElements = getFocusableElements(containerRef.current)
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    let nextIndex: number
    if (direction === 'next') {
      nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1
    } else {
      nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1
    }

    focusableElements[nextIndex]?.focus()
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="keyboard-navigation-container"
    >
      {children}
    </div>
  )
}

// Hook for managing focus within a component
export function useFocusManagement() {
  const { announceToScreenReader } = useAccessibility()

  const moveFocus = (direction: 'next' | 'previous' | 'first' | 'last', container?: HTMLElement) => {
    const focusContainer = container || document.body
    const focusableElements = Array.from(
      focusContainer.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
      )
    ) as HTMLElement[]

    if (focusableElements.length === 0) return

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    let nextIndex: number

    switch (direction) {
      case 'next':
        nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1
        break
      case 'previous':
        nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1
        break
      case 'first':
        nextIndex = 0
        break
      case 'last':
        nextIndex = focusableElements.length - 1
        break
      default:
        return
    }

    focusableElements[nextIndex]?.focus()
    
    // Announce the focused element
    const focusedElement = focusableElements[nextIndex]
    const elementText = focusedElement.textContent || 
                       focusedElement.getAttribute('aria-label') || 
                       focusedElement.getAttribute('title') ||
                       'Interactive element'
    announceToScreenReader(`Focused on ${elementText}`)
  }

  const trapFocusWithin = (container: HTMLElement) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = Array.from(
          container.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
          )
        ) as HTMLElement[]

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  return { moveFocus, trapFocusWithin }
}

export default KeyboardNavigation