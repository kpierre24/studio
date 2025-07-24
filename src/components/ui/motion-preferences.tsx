"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useEnhancedTheme } from '@/contexts/ThemeContext'
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Eye,
  MousePointer,
  ArrowUpDown
} from 'lucide-react'

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

const STORAGE_KEY = 'classroomhq-motion-preferences'

export function MotionPreferences() {
  const { theme, toggleReducedMotion } = useEnhancedTheme()
  const [motionPrefs, setMotionPrefs] = useState<MotionPreferences>(DEFAULT_MOTION_PREFERENCES)
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMotionPrefs({ ...DEFAULT_MOTION_PREFERENCES, ...parsed })
      } catch (error) {
        console.warn('Failed to parse motion preferences:', error)
      }
    }

    // Check system motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemPrefersReduced(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersReduced(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    setIsLoaded(true)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply motion preferences to document
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    
    // Set CSS custom properties for motion preferences
    root.style.setProperty('--motion-enabled', motionPrefs.enableAnimations ? '1' : '0')
    root.style.setProperty('--motion-speed', motionPrefs.animationSpeed.toString())
    root.style.setProperty('--hover-enabled', motionPrefs.enableHoverEffects ? '1' : '0')
    root.style.setProperty('--transitions-enabled', motionPrefs.enablePageTransitions ? '1' : '0')
    root.style.setProperty('--micro-animations-enabled', motionPrefs.enableMicroAnimations ? '1' : '0')
    root.style.setProperty('--parallax-enabled', motionPrefs.enableParallax ? '1' : '0')

    // Apply motion classes
    if (!motionPrefs.enableAnimations || theme.reducedMotion) {
      root.classList.add('motion-disabled')
    } else {
      root.classList.remove('motion-disabled')
    }

    if (!motionPrefs.enableHoverEffects) {
      root.classList.add('hover-disabled')
    } else {
      root.classList.remove('hover-disabled')
    }

    // Save preferences
    localStorage.setItem(STORAGE_KEY, JSON.stringify(motionPrefs))
  }, [motionPrefs, theme.reducedMotion, isLoaded])

  const updateMotionPref = (key: keyof MotionPreferences, value: boolean | number) => {
    setMotionPrefs(prev => ({ ...prev, [key]: value }))
  }

  const resetMotionPrefs = () => {
    setMotionPrefs(DEFAULT_MOTION_PREFERENCES)
  }

  const getEffectiveMotionState = () => {
    if (motionPrefs.respectSystemPreference && systemPrefersReduced) {
      return 'System preference: Reduced motion'
    }
    if (theme.reducedMotion) {
      return 'User preference: Reduced motion'
    }
    if (!motionPrefs.enableAnimations) {
      return 'Animations disabled'
    }
    return 'Animations enabled'
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Motion & Animation Preferences
        </CardTitle>
        <CardDescription>
          Control animations and motion effects throughout the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* System Status */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4" />
            <span className="font-medium">Current Status:</span>
            <span className={`${
              getEffectiveMotionState().includes('Reduced') || getEffectiveMotionState().includes('disabled')
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {getEffectiveMotionState()}
            </span>
          </div>
          {systemPrefersReduced && (
            <p className="text-xs text-muted-foreground mt-1">
              Your system is set to prefer reduced motion
            </p>
          )}
        </div>

        {/* Master Motion Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Play className="h-4 w-4" />
                Master Animation Control
              </Label>
              <p className="text-xs text-muted-foreground">
                Override all animations and motion effects
              </p>
            </div>
            <Switch
              checked={!theme.reducedMotion}
              onCheckedChange={() => toggleReducedMotion()}
              aria-label="Toggle all animations"
            />
          </div>
        </div>

        <Separator />

        {/* Granular Motion Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Detailed Motion Settings
          </Label>
          
          {/* System Preference Respect */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Respect System Preference</Label>
              <p className="text-xs text-muted-foreground">
                Follow your operating system's motion settings
              </p>
            </div>
            <Switch
              checked={motionPrefs.respectSystemPreference}
              onCheckedChange={(checked) => updateMotionPref('respectSystemPreference', checked)}
              aria-label="Respect system motion preference"
            />
          </div>

          {/* Enable Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Enable Animations</Label>
              <p className="text-xs text-muted-foreground">
                Allow animations throughout the interface
              </p>
            </div>
            <Switch
              checked={motionPrefs.enableAnimations}
              onCheckedChange={(checked) => updateMotionPref('enableAnimations', checked)}
              disabled={theme.reducedMotion || (motionPrefs.respectSystemPreference && systemPrefersReduced)}
              aria-label="Enable animations"
            />
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <Label className="text-sm">
              Animation Speed: {motionPrefs.animationSpeed}x
            </Label>
            <Slider
              value={[motionPrefs.animationSpeed]}
              onValueChange={([value]) => updateMotionPref('animationSpeed', value)}
              min={0.25}
              max={2}
              step={0.25}
              className="w-full"
              disabled={!motionPrefs.enableAnimations || theme.reducedMotion}
              aria-label="Animation speed multiplier"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (0.25x)</span>
              <span>Normal (1x)</span>
              <span>Fast (2x)</span>
            </div>
          </div>

          {/* Hover Effects */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Hover Effects
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable hover animations and effects
              </p>
            </div>
            <Switch
              checked={motionPrefs.enableHoverEffects}
              onCheckedChange={(checked) => updateMotionPref('enableHoverEffects', checked)}
              disabled={!motionPrefs.enableAnimations || theme.reducedMotion}
              aria-label="Enable hover effects"
            />
          </div>

          {/* Page Transitions */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm flex items-center gap-2">
                <ArrowUpDown className="h-3 w-3" />
                Page Transitions
              </Label>
              <p className="text-xs text-muted-foreground">
                Animate between page navigation
              </p>
            </div>
            <Switch
              checked={motionPrefs.enablePageTransitions}
              onCheckedChange={(checked) => updateMotionPref('enablePageTransitions', checked)}
              disabled={!motionPrefs.enableAnimations || theme.reducedMotion}
              aria-label="Enable page transitions"
            />
          </div>

          {/* Micro Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Micro Animations</Label>
              <p className="text-xs text-muted-foreground">
                Small animations for buttons, icons, and UI elements
              </p>
            </div>
            <Switch
              checked={motionPrefs.enableMicroAnimations}
              onCheckedChange={(checked) => updateMotionPref('enableMicroAnimations', checked)}
              disabled={!motionPrefs.enableAnimations || theme.reducedMotion}
              aria-label="Enable micro animations"
            />
          </div>

          {/* Parallax Effects */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Parallax Effects</Label>
              <p className="text-xs text-muted-foreground">
                Background parallax scrolling effects (may cause motion sensitivity)
              </p>
            </div>
            <Switch
              checked={motionPrefs.enableParallax}
              onCheckedChange={(checked) => updateMotionPref('enableParallax', checked)}
              disabled={!motionPrefs.enableAnimations || theme.reducedMotion}
              aria-label="Enable parallax effects"
            />
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={resetMotionPrefs}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Motion Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default MotionPreferences