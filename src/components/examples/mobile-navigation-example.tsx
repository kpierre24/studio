"use client";

import React, { useState } from 'react';
import { MobileLayout, MobilePageLayout, MobileContentLayout } from '@/components/layout/MobileLayout';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { TouchFriendlyInterface, TouchFriendlyButton, TouchFriendlyCard } from '@/components/ui/touch-friendly-interface';
import { SwipeGesture, SwipeableCard, SwipeableList, PullToRefresh } from '@/components/ui/swipe-gestures';
import { MobileStack, MobileGrid, MobileCollapsible, MobileModal, MobileBottomSheet, MobileTabs } from '@/components/ui/mobile-layouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Heart, 
  Share, 
  Trash2, 
  Archive, 
  Star, 
  MessageCircle, 
  Settings,
  User,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Download
} from 'lucide-react';

export function MobileNavigationExample() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Sample data for demonstrations
  const sampleCards = [
    {
      id: '1',
      title: 'Course Assignment',
      description: 'Complete the React fundamentals assignment',
      dueDate: '2024-01-15',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Team Meeting',
      description: 'Weekly standup with the development team',
      dueDate: '2024-01-12',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review pull request for mobile navigation',
      dueDate: '2024-01-10',
      priority: 'low',
    },
  ];

  const swipeableItems = sampleCards.map(card => ({
    id: card.id,
    content: (
      <div>
        <h3 className="font-medium">{card.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">Due: {card.dueDate}</span>
          <Badge variant={card.priority === 'high' ? 'destructive' : card.priority === 'medium' ? 'default' : 'secondary'}>
            {card.priority}
          </Badge>
        </div>
      </div>
    ),
    leftAction: {
      icon: Archive,
      label: 'Archive',
      color: 'secondary' as const,
      onAction: () => console.log('Archive', card.id),
    },
    rightAction: {
      icon: Trash2,
      label: 'Delete',
      color: 'destructive' as const,
      onAction: () => console.log('Delete', card.id),
    },
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'assignments', label: 'Assignments', icon: Edit, badge: 3 },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: 12 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
  };

  if (!isMobile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Mobile Navigation Demo</h2>
          <p className="text-muted-foreground mb-6">
            This demo is optimized for mobile devices. Please view on a mobile device or resize your browser window to see the mobile navigation features.
          </p>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Features demonstrated:</h3>
            <ul className="text-left space-y-2 text-sm">
              <li>• Bottom tab navigation with touch-friendly targets</li>
              <li>• Swipe gestures for card interactions</li>
              <li>• Pull-to-refresh functionality</li>
              <li>• Touch-optimized interface elements</li>
              <li>• Mobile-specific layouts and modals</li>
              <li>• Collapsible sections and bottom sheets</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout
      enablePullToRefresh={true}
      onRefresh={handleRefresh}
      showBottomNavigation={true}
      navigationVariant="bottom-tabs"
    >
      <MobilePageLayout
        title="Mobile Navigation Demo"
        subtitle="Explore touch-friendly mobile interface patterns"
        headerActions={
          <div className="flex gap-2">
            <TouchFriendlyButton onClick={() => setShowModal(true)}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </TouchFriendlyButton>
            <TouchFriendlyButton onClick={() => setShowBottomSheet(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </TouchFriendlyButton>
          </div>
        }
      >
        <MobileStack spacing="lg">
          {/* Pull to refresh indicator */}
          {refreshCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Refreshed {refreshCount} time{refreshCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mobile Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Tabs</CardTitle>
              <CardDescription>
                Horizontally scrollable tabs with touch-friendly targets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MobileTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
              />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Active tab: <span className="font-medium">{activeTab}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Touch-Friendly Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Touch-Friendly Elements</CardTitle>
              <CardDescription>
                Cards and buttons optimized for touch interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MobileGrid columns={{ mobile: 2, tablet: 3, desktop: 4 }} gap="sm">
                <TouchFriendlyCard interactive elevated>
                  <div className="text-center p-2">
                    <Plus className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Add New</p>
                  </div>
                </TouchFriendlyCard>
                
                <TouchFriendlyCard interactive elevated>
                  <div className="text-center p-2">
                    <Download className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Download</p>
                  </div>
                </TouchFriendlyCard>
                
                <TouchFriendlyCard interactive elevated>
                  <div className="text-center p-2">
                    <Share className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Share</p>
                  </div>
                </TouchFriendlyCard>
                
                <TouchFriendlyCard interactive elevated>
                  <div className="text-center p-2">
                    <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Favorite</p>
                  </div>
                </TouchFriendlyCard>
              </MobileGrid>
            </CardContent>
          </Card>

          {/* Swipeable Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Swipeable Cards</CardTitle>
              <CardDescription>
                Swipe left to archive, swipe right to delete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwipeableList items={swipeableItems} />
            </CardContent>
          </Card>

          {/* Collapsible Sections */}
          <MobileCollapsible
            title="Course Materials"
            icon={Archive}
            defaultOpen={false}
          >
            <MobileStack spacing="sm">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Lecture Notes.pdf</span>
                <TouchFriendlyButton>
                  <Download className="h-4 w-4" />
                </TouchFriendlyButton>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Assignment Guidelines.docx</span>
                <TouchFriendlyButton>
                  <Download className="h-4 w-4" />
                </TouchFriendlyButton>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Sample Code.zip</span>
                <TouchFriendlyButton>
                  <Download className="h-4 w-4" />
                </TouchFriendlyButton>
              </div>
            </MobileStack>
          </MobileCollapsible>

          {/* Swipe Gesture Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Swipe Gestures</CardTitle>
              <CardDescription>
                Try swiping in different directions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwipeGesture
                onSwipeLeft={() => console.log('Swiped left')}
                onSwipeRight={() => console.log('Swiped right')}
                enabledDirections={['left', 'right']}
                swipeIndicatorText={{
                  left: 'Previous',
                  right: 'Next',
                }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
                  <h3 className="font-semibold mb-2">Swipe Me!</h3>
                  <p className="text-sm opacity-90">
                    Swipe left or right to see the gesture indicators
                  </p>
                </div>
              </SwipeGesture>
            </CardContent>
          </Card>
        </MobileStack>
      </MobilePageLayout>

      {/* Mobile Modal */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Search"
        showCloseButton={true}
      >
        <MobileStack>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search courses, assignments..."
              className="w-full p-3 border rounded-lg text-base"
            />
            <div className="space-y-2">
              <h3 className="font-medium">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React Hooks</Badge>
                <Badge variant="secondary">JavaScript</Badge>
                <Badge variant="secondary">CSS Grid</Badge>
              </div>
            </div>
          </div>
        </MobileStack>
      </MobileModal>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Filter Options"
        snapPoints={[40, 70]}
      >
        <MobileStack>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Priority</h3>
              <div className="flex gap-2">
                <Badge variant="outline">High</Badge>
                <Badge variant="outline">Medium</Badge>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <div className="flex gap-2">
                <Badge variant="outline">Pending</Badge>
                <Badge variant="outline">In Progress</Badge>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Due Date</h3>
              <div className="flex gap-2">
                <Badge variant="outline">Today</Badge>
                <Badge variant="outline">This Week</Badge>
                <Badge variant="outline">This Month</Badge>
              </div>
            </div>
          </div>
        </MobileStack>
      </MobileBottomSheet>
    </MobileLayout>
  );
}