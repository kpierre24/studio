"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorContrastChecker } from '@/components/ui/color-contrast-checker'
import { AccessibilityControls } from '@/components/ui/accessibility-controls'
import { MotionPreferences } from '@/components/ui/motion-preferences'
import { KeyboardNavigation } from '@/components/ui/keyboard-navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAccessibility } from '@/components/ui/accessibility-provider'
import { 
  Accessibility, 
  Keyboard, 
  Eye, 
  Palette, 
  Settings,
  CheckCircle
} from 'lucide-react'

export function AccessibilityDemo() {
  const { announceToScreenReader, isKeyboardNavigation } = useAccessibility()

  const handleTestAnnouncement = () => {
    announceToScreenReader('This is a test announcement for screen readers', 'assertive')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Accessibility className="h-8 w-8" />
          Accessibility Features Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive accessibility tools and controls for ClassroomHQ. 
          These features ensure the application is usable by everyone, regardless of their abilities.
        </p>
      </div>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Accessibility Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isKeyboardNavigation ? "default" : "secondary"}>
                <Keyboard className="h-3 w-3 mr-1" />
                Keyboard Navigation
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isKeyboardNavigation ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestAnnouncement}
              >
                Test Screen Reader
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                WCAG Compliant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Accessibility Controls */}
      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="contrast" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Contrast
          </TabsTrigger>
          <TabsTrigger value="motion" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Motion
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          <AccessibilityControls />
        </TabsContent>

        <TabsContent value="contrast" className="space-y-4">
          <ColorContrastChecker />
        </TabsContent>

        <TabsContent value="motion" className="space-y-4">
          <MotionPreferences />
        </TabsContent>

        <TabsContent value="keyboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Navigation Demo</CardTitle>
              <CardDescription>
                Test keyboard navigation with focus trapping and arrow key support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyboardNavigation
                trapFocus={true}
                onEscape={() => announceToScreenReader('Escaped from keyboard navigation demo')}
              >
                <div className="space-y-4" role="menu">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" role="menuitem">
                      Button 1
                    </Button>
                    <Button variant="outline" role="menuitem">
                      Button 2
                    </Button>
                    <Button variant="outline" role="menuitem">
                      Button 3
                    </Button>
                    <Button variant="outline" role="menuitem">
                      Button 4
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Keyboard Navigation Instructions:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> to navigate forward</li>
                      <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift + Tab</kbd> to navigate backward</li>
                      <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Arrow Keys</kbd> for menu navigation</li>
                      <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> to exit focus trap</li>
                      <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to activate buttons</li>
                    </ul>
                  </div>
                </div>
              </KeyboardNavigation>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accessibility Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Implemented Accessibility Features</CardTitle>
          <CardDescription>
            Complete list of accessibility enhancements available in ClassroomHQ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Visual Accessibility</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Color contrast checking (WCAG AA/AAA)</li>
                <li>✓ High contrast mode</li>
                <li>✓ Adjustable font sizes</li>
                <li>✓ Customizable text spacing</li>
                <li>✓ Page zoom controls</li>
                <li>✓ Focus indicators</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Motor & Cognitive</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Keyboard navigation support</li>
                <li>✓ Focus trapping for modals</li>
                <li>✓ Reduced motion preferences</li>
                <li>✓ Animation speed controls</li>
                <li>✓ Skip links for navigation</li>
                <li>✓ Large touch targets</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Screen Reader Support</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ ARIA labels and descriptions</li>
                <li>✓ Semantic HTML structure</li>
                <li>✓ Live region announcements</li>
                <li>✓ Proper heading hierarchy</li>
                <li>✓ Form label associations</li>
                <li>✓ Status announcements</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">System Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Respects system preferences</li>
                <li>✓ Persistent user settings</li>
                <li>✓ Cross-device synchronization</li>
                <li>✓ Progressive enhancement</li>
                <li>✓ Graceful degradation</li>
                <li>✓ Performance optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccessibilityDemo