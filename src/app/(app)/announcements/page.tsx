
"use client";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types";
// import ReactMarkdown from 'react-markdown'; // This would require markdown parser setup
// import remarkGfm from 'remark-gfm';

export default function AnnouncementsPage() {
  const { state } = useAppContext();
  const { currentUser, announcements } = state; // announcements should now be initialized

  if (!currentUser) return <p>Loading...</p>;

  // Filter announcements based on user role and context
  // Ensure announcements is an array before filtering
  const relevantAnnouncements = (announcements || []).filter(ann => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (ann.userId && ann.userId !== currentUser.id) return false; // Targeted specific user
    if (ann.courseId) { // Course specific
      const isEnrolled = state.enrollments.some(e => e.studentId === currentUser.id && e.courseId === ann.courseId);
      const isTeacher = state.courses.some(c => c.id === ann.courseId && c.teacherId === currentUser.id);
      return isEnrolled || isTeacher;
    }
    // General announcements
    if (ann.type === 'announcement' && !ann.userId && !ann.courseId) return true; 
    return false; // Default to not showing if no criteria match
  }).sort((a, b) => b.timestamp - a.timestamp);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Announcements</h1>
        {currentUser.role === UserRole.SUPER_ADMIN && (
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Create Site Announcement</button>
        )}
      </div>

      {relevantAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No announcements available for you at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {relevantAnnouncements.map(ann => (
            <Card key={ann.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">{ann.message.split('\n')[0]}</CardTitle> {/* Use first line as title */}
                <CardDescription>
                  Posted on {new Date(ann.timestamp).toLocaleDateString()}
                  {ann.courseId && ` for course ${state.courses.find(c => c.id === ann.courseId)?.name || 'Unknown Course'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* For proper Markdown rendering, ReactMarkdown would be used here */}
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
