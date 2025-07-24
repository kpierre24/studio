"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Eye, Palette } from 'lucide-react'

interface ContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'A' | 'FAIL'
  passes: {
    normalText: boolean
    largeText: boolean
    uiComponents: boolean
  }
}

interface ColorContrastCheckerProps {
  className?: string
  onContrastChange?: (result: ContrastResult) => void
}

export function ColorContrastChecker({ className, onContrastChange }: ColorContrastCheckerProps) {
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(null)

  // Calculate relative luminance of a color
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Calculate contrast ratio
  const getContrastRatio = (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Determine WCAG level
  const getWCAGLevel = (ratio: number): ContrastResult['level'] => {
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3) return 'A'
    return 'FAIL'
  }

  // Check if contrast passes for different use cases
  const checkContrastPasses = (ratio: number) => {
    return {
      normalText: ratio >= 4.5, // WCAG AA for normal text
      largeText: ratio >= 3, // WCAG AA for large text (18pt+ or 14pt+ bold)
      uiComponents: ratio >= 3 // WCAG AA for UI components
    }
  }

  // Calculate contrast when colors change
  useEffect(() => {
    const ratio = getContrastRatio(foregroundColor, backgroundColor)
    const level = getWCAGLevel(ratio)
    const passes = checkContrastPasses(ratio)
    
    const result: ContrastResult = {
      ratio,
      level,
      passes
    }
    
    setContrastResult(result)
    onContrastChange?.(result)
  }, [foregroundColor, backgroundColor, onContrastChange])

  // Get level color for badges
  const getLevelColor = (level: ContrastResult['level']) => {
    switch (level) {
      case 'AAA': return 'bg-green-500'
      case 'AA': return 'bg-blue-500'
      case 'A': return 'bg-yellow-500'
      case 'FAIL': return 'bg-red-500'
    }
  }

  // Get level description
  const getLevelDescription = (level: ContrastResult['level']) => {
    switch (level) {
      case 'AAA': return 'Enhanced contrast - exceeds all requirements'
      case 'AA': return 'Standard contrast - meets most requirements'
      case 'A': return 'Minimum contrast - limited use cases'
      case 'FAIL': return 'Insufficient contrast - does not meet standards'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Contrast Checker
        </CardTitle>
        <CardDescription>
          Check color combinations for WCAG accessibility compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foreground">Foreground Color (Text)</Label>
            <div className="flex gap-2">
              <Input
                id="foreground"
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Preview</h3>
          <div 
            className="p-6 rounded-lg border-2 border-dashed border-gray-300"
            style={{ 
              backgroundColor: backgroundColor,
              color: foregroundColor 
            }}
          >
            <div className="space-y-2">
              <p className="text-sm">Small text (14px) - Normal weight</p>
              <p className="text-base">Regular text (16px) - Normal weight</p>
              <p className="text-lg font-semibold">Large text (18px) - Bold weight</p>
              <Button 
                variant="outline" 
                style={{ 
                  borderColor: foregroundColor,
                  color: foregroundColor 
                }}
              >
                UI Component
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {contrastResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Contrast Analysis</h3>
              <Badge className={getLevelColor(contrastResult.level)}>
                {contrastResult.level}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Contrast Ratio</span>
                </div>
                <p className="text-2xl font-bold">
                  {contrastResult.ratio.toFixed(2)}:1
                </p>
                <p className="text-sm text-muted-foreground">
                  {getLevelDescription(contrastResult.level)}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {contrastResult.passes.normalText ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Normal text (4.5:1 required)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {contrastResult.passes.largeText ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Large text (3:1 required)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {contrastResult.passes.uiComponents ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">UI components (3:1 required)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setForegroundColor('#000000')
              setBackgroundColor('#ffffff')
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const temp = foregroundColor
              setForegroundColor(backgroundColor)
              setBackgroundColor(temp)
            }}
          >
            Swap Colors
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}