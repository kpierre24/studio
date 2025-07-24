"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useEnhancedTheme } from '@/contexts/ThemeContext'
import { 
  Type, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Contrast,
  AlignLeft,
  Settings
} from 'lucide-react'

interface DisplayPreferences {
  textSpacing: number
  lineHeight: number
  letterSpacing: number
  wordSpacing: number
  zoom: number
}

const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  textSpacing: 0,
  lineHeight: 1.5,
  letterSpacing: 0,
  wordSpacing: 0,
  zoom: 100,
}

const STORAGE_KEY = 'classroomhq-display-preferences'

export function AccessibilityControls() {
  const { 
    theme, 
    increaseFontSize, 
    decreaseFontSize, 
    toggleHighContrast,
    toggleReducedMotion 
  } = useEnhancedTheme()
  
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setDisplayPrefs({ ...DEFAULT_DISPLAY_PREFERENCES, ...parsed })
      } catch (error) {
        console.warn('Failed to parse display preferences:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Apply display preferences to document
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    
    // Apply text spacing
    root.style.setProperty('--text-spacing', `${displayPrefs.textSpacing}px`)
    root.style.setProperty('--line-height', displayPrefs.lineHeight.toString())
    root.style.setProperty('--letter-spacing', `${displayPrefs.letterSpacing}px`)
    root.style.setProperty('--word-spacing', `${displayPrefs.wordSpacing}px`)
    
    // Apply zoom (using transform scale on body)
    const zoomScale = displayPrefs.zoom / 100
    document.body.style.transform = zoomScale !== 1 ? `scale(${zoomScale})` : ''
    document.body.style.transformOrigin = 'top left'
    
    // Adjust viewport to account for zoom
    if (zoomScale !== 1) {
      document.body.style.width = `${100 / zoomScale}%`
      document.body.style.height = `${100 / zoomScale}%`
    } else {
      document.body.style.width = ''
      document.body.style.height = ''
    }

    // Save preferences
    localStorage.setItem(STORAGE_KEY, JSON.stringify(displayPrefs))
  }, [displayPrefs, isLoaded])

  const updateDisplayPref = (key: keyof DisplayPreferences, value: number) => {
    setDisplayPrefs(prev => ({ ...prev, [key]: value }))
  }

  const resetDisplayPrefs = () => {
    setDisplayPrefs(DEFAULT_DISPLAY_PREFERENCES)
  }

  const getFontSizeLabel = () => {
    switch (theme.fontSize) {
      case 'sm': return 'Small'
      case 'lg': return 'Large'
      default: return 'Medium'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility & Display Controls
        </CardTitle>
        <CardDescription>
          Customize the display settings to improve readability and accessibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Font Size Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Size
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={theme.fontSize === 'sm'}
              aria-label="Decrease font size"
            >
              <Type className="h-3 w-3" />
            </Button>
            <span className="min-w-[80px] text-center text-sm">
              {getFontSizeLabel()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={theme.fontSize === 'lg'}
              aria-label="Increase font size"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Zoom Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            Page Zoom: {displayPrefs.zoom}%
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateDisplayPref('zoom', Math.max(50, displayPrefs.zoom - 10))}
              disabled={displayPrefs.zoom <= 50}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Slider
              value={[displayPrefs.zoom]}
              onValueChange={([value]) => updateDisplayPref('zoom', value)}
              min={50}
              max={200}
              step={10}
              className="flex-1"
              aria-label="Page zoom level"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateDisplayPref('zoom', Math.min(200, displayPrefs.zoom + 10))}
              disabled={displayPrefs.zoom >= 200}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Text Spacing Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            Text Spacing
          </Label>
          
          {/* Line Height */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Line Height: {displayPrefs.lineHeight}
            </Label>
            <Slider
              value={[displayPrefs.lineHeight]}
              onValueChange={([value]) => updateDisplayPref('lineHeight', value)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
              aria-label="Line height"
            />
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Letter Spacing: {displayPrefs.letterSpacing}px
            </Label>
            <Slider
              value={[displayPrefs.letterSpacing]}
              onValueChange={([value]) => updateDisplayPref('letterSpacing', value)}
              min={-2}
              max={5}
              step={0.5}
              className="w-full"
              aria-label="Letter spacing"
            />
          </div>

          {/* Word Spacing */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Word Spacing: {displayPrefs.wordSpacing}px
            </Label>
            <Slider
              value={[displayPrefs.wordSpacing]}
              onValueChange={([value]) => updateDisplayPref('wordSpacing', value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
              aria-label="Word spacing"
            />
          </div>
        </div>

        <Separator />

        {/* Visual Accessibility Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Accessibility
          </Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={theme.highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={theme.reducedMotion}
              onCheckedChange={toggleReducedMotion}
              aria-label="Toggle reduced motion"
            />
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={resetDisplayPrefs}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Display Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccessibilityControls