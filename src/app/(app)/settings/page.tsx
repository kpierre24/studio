"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                        Select the color theme for the application. Your preference will be saved.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant={theme === 'light' ? 'default' : 'outline'} 
                        onClick={() => setTheme("light")}
                        size="sm"
                    >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </Button>
                    <Button 
                        variant={theme === 'dark' ? 'default' : 'outline'} 
                        onClick={() => setTheme("dark")}
                        size="sm"
                    >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </Button>
                     <Button 
                        variant={theme === 'system' ? 'default' : 'outline'} 
                        onClick={() => setTheme("system")}
                        size="sm"
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </Button>
                </div>
            </CardContent>
        </Card>
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
