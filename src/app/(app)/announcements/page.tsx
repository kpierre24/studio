
"use client";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types";
import { Megaphone } from "lucide-react";
// import ReactMarkdown from 'react-markdown'; // This would require markdown parser setup
// import remarkGfm from 'remark-gfm';

export default function AnnouncementsPage() {
  const { state } = useAppContext();
  const { currentUser, announcements, isLoading } = state; 

  if (isLoading && !currentUser) return <p className="text-muted-foreground text-center py-10">Loading announcements...</p>;
  if (!currentUser) return <p className="text-muted-foreground text-center py-10">Please log in to view announcements.</p>;

  const relevantAnnouncements = (announcements || []).filter(ann => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (ann.userId && ann.userId !== currentUser.id) return false; 
    if (ann.courseId) { 
      const isEnrolled = state.enrollments.some(e => e.studentId === currentUser.id && e.courseId === ann.courseId);
      const isTeacher = state.courses.some(c => c.id === ann.courseId && c.teacherId === currentUser.id);
      return isEnrolled || isTeacher;
    }
    if (ann.type === 'announcement' && !ann.userId && !ann.courseId) return true; 
    return false; 
  }).sort((a, b) => b.timestamp - a.timestamp);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Announcements</h1>
        {currentUser.role === UserRole.SUPER_ADMIN && (
          // TODO: Implement Create Announcement functionality
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md opacity-50 cursor-not-allowed" title="Create Announcement feature coming soon">Create Site Announcement</button>
        )}
      </div>

      {isLoading && relevantAnnouncements.length === 0 && <p className="text-muted-foreground text-center py-10">Loading announcements...</p>}
      {!isLoading && relevantAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Announcements Yet</p>
            <p className="text-muted-foreground">There are no announcements available for you at this time. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {relevantAnnouncements.map(ann => (
            <Card key={ann.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{ann.message.split('\n')[0]}</CardTitle>
                <CardDescription>
                  Posted on {new Date(ann.timestamp).toLocaleDateString()}
                  {ann.courseId && ` for course ${state.courses.find(c => c.id === ann.courseId)?.name || 'Unknown Course'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-body">{ann.message}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
