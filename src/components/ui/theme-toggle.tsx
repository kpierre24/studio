"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette, Type, Eye, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEnhancedTheme } from "@/contexts/ThemeContext"

export function ThemeToggle() {
  const { theme, toggleMode } = useEnhancedTheme()

  const getThemeIcon = () => {
    switch (theme.mode) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMode}
      className="relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.mode}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          {getThemeIcon()}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function ThemeSettings() {
  const {
    theme,
    setTheme,
    increaseFontSize,
    decreaseFontSize,
    toggleReducedMotion,
    toggleHighContrast,
  } = useEnhancedTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Theme settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme({ mode: 'light' })}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme.mode === 'light' && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme({ mode: 'dark' })}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme.mode === 'dark' && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme({ mode: 'system' })}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme.mode === 'system' && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Font Size</DropdownMenuLabel>
        <div className="flex items-center justify-between px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={decreaseFontSize}
            disabled={theme.fontSize === 'sm'}
          >
            <Type className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium capitalize">{theme.fontSize}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={increaseFontSize}
            disabled={theme.fontSize === 'lg'}
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleReducedMotion}>
          <Zap className="mr-2 h-4 w-4" />
          <span>Reduced Motion</span>
          {theme.reducedMotion && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleHighContrast}>
          <Eye className="mr-2 h-4 w-4" />
          <span>High Contrast</span>
          {theme.highContrast && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}