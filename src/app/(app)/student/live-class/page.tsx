
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
    <div className="space-y-8 max-w-3xl mx-auto"> {/* Increased max-width for iframe */}
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <Video className="h-8 w-8 text-primary" />
        Join Live Class Session
      </h1>
      
      <Card className="shadow-lg">
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

          <div className="p-3 my-4 text-sm bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>
              <strong>Note on Embedded View:</strong> Direct embedding of live Zoom meetings can be limited. If you see a join page or encounter issues with the embedded window, please use the "Join Directly via Zoom" button below for the best experience.
            </span>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                Join Directly via Zoom
              </a>
            </Button>
          </div>

          {(LIVE_CLASS_MEETING_ID || LIVE_CLASS_PASSCODE) && (
            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground mb-2">Session Details (for manual join):</h3>
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
          <p>If the embedded view or button doesn't work, you can manually copy and paste the link into your browser: <Link href={LIVE_CLASS_ZOOM_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{LIVE_CLASS_ZOOM_URL}</Link></p>
          <p>Make sure your internet connection is stable and that you have the Zoom application installed or are prepared to join via your web browser.</p>
          <p>If you continue to experience issues, please contact your instructor or an administrator.</p>
        </CardContent>
      </Card>
    </div>
  );
}
