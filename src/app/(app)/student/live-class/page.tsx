
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ExternalLink } from "lucide-react";
import Link from "next/link";

// --- Configuration: Replace with your actual Zoom link ---
const LIVE_CLASS_ZOOM_URL = "https://zoom.us/j/1234567890"; // IMPORTANT: Replace with your actual Zoom meeting URL
const LIVE_CLASS_NAME = "Weekly Ministry Class"; // Optional: Customize the class name displayed
const LIVE_CLASS_MEETING_ID = "123 456 7890"; // Optional: Display Meeting ID
const LIVE_CLASS_PASSCODE = "ministry123"; // Optional: Display Passcode
// ------------------------------------------------------------

export default function StudentLiveClassPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <Video className="h-8 w-8 text-primary" />
        Join Live Class Session
      </h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Connect to: {LIVE_CLASS_NAME}</CardTitle>
          <CardDescription>
            Your live class session is typically held every Wednesday. Click the button below to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Ensure you have the Zoom application installed or are prepared to join via your web browser.
          </p>
          
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-5 w-5" />
              Join Live Zoom Session Now
            </a>
          </Button>

          {(LIVE_CLASS_MEETING_ID || LIVE_CLASS_PASSCODE) && (
            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground mb-2">Session Details:</h3>
              {LIVE_CLASS_MEETING_ID && <p>Meeting ID: <span className="font-medium text-foreground">{LIVE_CLASS_MEETING_ID}</span></p>}
              {LIVE_CLASS_PASSCODE && <p>Passcode: <span className="font-medium text-foreground">{LIVE_CLASS_PASSCODE}</span></p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Having Trouble?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>If the button doesn't work, you can manually copy and paste the link into your browser: <Link href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{LIVE_CLASS_ZOOM_URL}</Link></p>
          <p>Make sure your internet connection is stable.</p>
          <p>If you continue to experience issues, please contact your instructor or an administrator.</p>
        </CardContent>
      </Card>
    </div>
  );
}
