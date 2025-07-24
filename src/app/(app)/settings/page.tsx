"use client"

import { Moon, Sun, Monitor, Type, Eye, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEnhancedTheme } from "@/contexts/ThemeContext"
import AccessibilityControls from "@/components/ui/accessibility-controls"
import MotionPreferences from "@/components/ui/motion-preferences"

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    increaseFontSize,
    decreaseFontSize,
    toggleReducedMotion,
    toggleHighContrast,
  } = useEnhancedTheme()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">Theme</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Select the color theme for the application. Your preference will be saved.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant={theme.mode === 'light' ? 'default' : 'outline'} 
                            onClick={() => setTheme({ mode: "light" })}
                            size="sm"
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </Button>
                        <Button 
                            variant={theme.mode === 'dark' ? 'default' : 'outline'} 
                            onClick={() => setTheme({ mode: "dark" })}
                            size="sm"
                        >
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </Button>
                         <Button 
                            variant={theme.mode === 'system' ? 'default' : 'outline'} 
                            onClick={() => setTheme({ mode: "system" })}
                            size="sm"
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            System
                        </Button>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-2">Font Size</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Adjust the text size for better readability.
                    </p>
                    <div className="flex items-center justify-between max-w-xs">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={decreaseFontSize}
                            disabled={theme.fontSize === 'sm'}
                        >
                            <Type className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium capitalize px-4">
                            {theme.fontSize === 'sm' ? 'Small' : theme.fontSize === 'md' ? 'Medium' : 'Large'}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={increaseFontSize}
                            disabled={theme.fontSize === 'lg'}
                        >
                            <Type className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
        
        {/* Comprehensive Accessibility Controls */}
        <AccessibilityControls />
        
        {/* Motion and Animation Preferences */}
        <MotionPreferences />
        
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                   Account management features like changing your password or email will be available here in a future update. For now, please visit your <a href="/profile" className="text-primary hover:underline">Profile</a> page to update your personal information.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
