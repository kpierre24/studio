'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscussionForum } from '@/components/features/DiscussionForum';
import { AdvancedSearch } from '@/components/features/AdvancedSearch';
import { BulkOperations } from '@/components/features/BulkOperations';
import { ExportImport } from '@/components/features/ExportImport';
import { NotificationPreferences } from '@/components/features/NotificationPreferences';
import { BulkOperationType } from '@/components/features/BulkOperations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Users, Download, Bell, MessageSquare } from 'lucide-react';

// Mock data for bulk operations
const mockBulkItems = [
  {
    id: '1',
    title: 'Introduction to React',
    type: BulkOperationType.ASSIGNMENTS,
    status: 'active',
    metadata: { dueDate: '2024-02-15', points: 100, submissions: 45 },
    selected: false,
  },
  {
    id: '2',
    title: 'CSS Fundamentals Quiz',
    type: BulkOperationType.ASSIGNMENTS,
    status: 'active',
    metadata: { dueDate: '2024-02-10', points: 50, submissions: 42 },
    selected: false,
  },
  {
    id: '3',
    title: 'JavaScript Project',
    type: BulkOperationType.ASSIGNMENTS,
    status: 'draft',
    metadata: { dueDate: '2024-02-20', points: 200, submissions: 0 },
    selected: false,
  },
];

export default function QuickWinsDemoPage() {
  const [activeTab, setActiveTab] = useState('discussion');
  const [showFeatureInfo, setShowFeatureInfo] = useState(true);

  const features = [
    {
      id: 'discussion',
      label: 'Discussion Forums',
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Engage in course discussions with threaded conversations',
      component: <DiscussionForum courseId="demo-course-123" />,
    },
    {
      id: 'search',
      label: 'Advanced Search',
      icon: <Search className="w-4 h-4" />,
      description: 'Search across courses, assignments, discussions, and users',
      component: <AdvancedSearch />,
    },
    {
      id: 'bulk',
      label: 'Bulk Operations',
      icon: <Users className="w-4 h-4" />,
      description: 'Perform bulk actions on assignments, users, and courses',
      component: <BulkOperations type={BulkOperationType.ASSIGNMENTS} items={mockBulkItems} />,
    },
    {
      id: 'export',
      label: 'Export/Import',
      icon: <Download className="w-4 h-4" />,
      description: 'Export and import data in various formats',
      component: <ExportImport />,
    },
    {
      id: 'notifications',
      label: 'Notification Preferences',
      icon: <Bell className="w-4 h-4" />,
      description: 'Customize your notification settings',
      component: <NotificationPreferences />,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Quick Wins Features Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore the new quick wins features we've added to enhance your learning management experience.
          These features are designed to improve collaboration, efficiency, and user experience.
        </p>
        
        {showFeatureInfo && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>🚀 New Features Overview</CardTitle>
              <CardDescription>
                We've implemented 5 powerful new features based on your feedback:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="text-center space-y-2">
                    <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-sm">{feature.label}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFeatureInfo(false)}
                className="mt-4"
              >
                Hide Overview
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          {features.map((feature) => (
            <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
              {feature.icon}
              <span className="hidden sm:inline">{feature.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {features.map((feature) => (
          <TabsContent key={feature.id} value={feature.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {feature.icon}
                      {feature.label}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                  <Badge variant="outline">New Feature</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {feature.component}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to integrate these features into your existing workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">For Instructors</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use <strong>Bulk Operations</strong> to manage multiple assignments efficiently</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span><strong>Export/Import</strong> student data for external analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Monitor <strong>Discussion Forums</strong> for student engagement</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Students</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Customize <strong>Notification Preferences</strong> for optimal alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use <strong>Advanced Search</strong> to find relevant content quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Participate in <strong>Discussion Forums</strong> for peer learning</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}