
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ExternalLink, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import Link from "next/link";

// --- Configuration: Replace with your actual Zoom link ---
const LIVE_CLASS_ZOOM_URL = "https://us02web.zoom.us/j/81505377396?pwd=b3BwS0cxbWhBM0VOUk1CRWp2RDRoQT09"; // IMPORTANT: Replace with your actual Zoom meeting URL
const LIVE_CLASS_NAME = "Weekly Ministry Class"; // Optional: Customize the class name displayed
const LIVE_CLASS_MEETING_ID = "815 0537 7396"; // Optional: Display Meeting ID
const LIVE_CLASS_PASSCODE = "163738"; // Optional: Display Passcode
// ------------------------------------------------------------

// Attempt to construct a more embed-friendly URL if possible, otherwise use the direct link.
// For standard meeting links, this usually still just shows the join page.
const EMBED_URL = LIVE_CLASS_ZOOM_URL.replace("/j/", "/wc/join/") + "&prefer=1&un=U3R1ZGVudA=="; // Base64 for "Student"

export default function StudentLiveClassPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <Video className="h-8 w-8 text-primary" />
        Join Live Class Session
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Connect to: {LIVE_CLASS_NAME}</CardTitle>
            <CardDescription>
              Your live class session is typically held every Wednesday. You can attempt to join via the embedded window below or use the direct link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border shadow-inner">
              <iframe
                src={EMBED_URL} // Using the modified embed URL
                title={`Live Class Session: ${LIVE_CLASS_NAME}`}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
              ></iframe>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Join Directly</CardTitle>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg" className="w-full">
                  <a href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Open in Zoom App
                  </a>
                </Button>
            </CardContent>
          </Card>
          
          {(LIVE_CLASS_MEETING_ID || LIVE_CLASS_PASSCODE) && (
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>For manual join</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                  {LIVE_CLASS_MEETING_ID && <p>Meeting ID: <span className="font-medium text-foreground block">{LIVE_CLASS_MEETING_ID}</span></p>}
                  {LIVE_CLASS_PASSCODE && <p>Passcode: <span className="font-medium text-foreground block">{LIVE_CLASS_PASSCODE}</span></p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>


      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Having Trouble?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            If you see a join page or encounter issues with the embedded window, please use the "Open in Zoom App" button for the best experience.
          </p>
          <p>If the button doesn't work, you can manually copy and paste the link into your browser: <Link href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{LIVE_CLASS_ZOOM_URL}</Link></p>
          <p>Make sure your internet connection is stable and that you have the Zoom application installed or are prepared to join via your web browser.</p>
          <p>If you continue to experience issues, please contact your instructor or an administrator.</p>
        </CardContent>
      </Card>
    </div>
  );
}
