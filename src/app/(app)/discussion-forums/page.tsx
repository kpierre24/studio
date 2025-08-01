"use client";

import { useState } from 'react';
import { DiscussionForum } from '@/components/features/DiscussionForum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function DiscussionForumsPage() {
  const { state } = useAppContext();
  const { currentUser } = state;
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussion Forums</h1>
          <p className="text-muted-foreground">
            Collaborate with your peers and instructors in course discussions
          </p>
        </div>
        {currentUser && (
          <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Discussion
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Discussions</CardTitle>
          <CardDescription>
            Join ongoing conversations or start a new discussion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscussionForum 
            courseId="all" 
            showCreateForm={showNewPostForm}
            onPostCreated={() => setShowNewPostForm(false)}
          />
        </CardContent>
      </Card>
    </div>
  );
}