'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, BellRing, CheckCircle } from 'lucide-react';

export enum NotificationType {
  COURSE_ANNOUNCEMENTS = 'course_announcements',
  ASSIGNMENT_DEADLINES = 'assignment_deadlines',
  GRADE_UPDATES = 'grade_updates',
  DISCUSSION_REPLIES = 'discussion_replies',
  NEW_MESSAGES = 'new_messages',
  SYSTEM_UPDATES = 'system_updates',
  ATTENDANCE_REMINDERS = 'attendance_reminders',
  PAYMENT_REMINDERS = 'payment_reminders',
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
  SMS = 'sms',
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

interface NotificationPreference {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  frequency: NotificationFrequency;
}

interface NotificationPreferencesState {
  [key: string]: {
    email: boolean;
    in_app: boolean;
    push: boolean;
    sms: boolean;
    frequency: NotificationFrequency;
  };
}

const notificationTypes: { type: NotificationType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: NotificationType.COURSE_ANNOUNCEMENTS,
    label: 'Course Announcements',
    description: 'Important updates from your instructors',
    icon: <Bell className="w-4 h-4" />,
  },
  {
    type: NotificationType.ASSIGNMENT_DEADLINES,
    label: 'Assignment Deadlines',
    description: 'Reminders for upcoming assignment due dates',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    type: NotificationType.GRADE_UPDATES,
    label: 'Grade Updates',
    description: 'Notifications when grades are posted',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    type: NotificationType.DISCUSSION_REPLIES,
    label: 'Discussion Replies',
    description: 'When someone replies to your discussion posts',
    icon: <BellRing className="w-4 h-4" />,
  },
  {
    type: NotificationType.NEW_MESSAGES,
    label: 'New Messages',
    description: 'Direct messages from other users',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    type: NotificationType.SYSTEM_UPDATES,
    label: 'System Updates',
    description: 'Platform updates and maintenance notifications',
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    type: NotificationType.ATTENDANCE_REMINDERS,
    label: 'Attendance Reminders',
    description: 'Reminders for upcoming classes and attendance tracking',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    type: NotificationType.PAYMENT_REMINDERS,
    label: 'Payment Reminders',
    description: 'Upcoming payment due dates and billing notifications',
    icon: <CheckCircle className="w-4 h-4" />,
  },
];

const channelIcons = {
  [NotificationChannel.EMAIL]: <Mail className="w-4 h-4" />,
  [NotificationChannel.IN_APP]: <Bell className="w-4 h-4" />,
  [NotificationChannel.PUSH]: <Smartphone className="w-4 h-4" />,
  [NotificationChannel.SMS]: <Smartphone className="w-4 h-4" />,
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferencesState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to load preferences
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const defaultPreferences: NotificationPreferencesState = {};
      notificationTypes.forEach(({ type }) => {
        defaultPreferences[type] = {
          email: true,
          in_app: true,
          push: false,
          sms: false,
          frequency: NotificationFrequency.IMMEDIATE,
        };
      });
      
      setPreferences(defaultPreferences);
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (
    type: NotificationType,
    channel: NotificationChannel,
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateFrequency = (type: NotificationType, frequency: NotificationFrequency) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        frequency,
      },
    }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    try {
      // Simulate API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically make an API call to save preferences
      console.log('Saving preferences:', preferences);
      
      toast.success('Notification preferences saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save notification preferences');
    }
  };

  const resetToDefaults = () => {
    const defaultPreferences: NotificationPreferencesState = {};
    notificationTypes.forEach(({ type }) => {
      defaultPreferences[type] = {
        email: true,
        in_app: true,
        push: false,
        sms: false,
        frequency: NotificationFrequency.IMMEDIATE,
      };
    });
    
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const enableAll = (channel: NotificationChannel) => {
    const updatedPreferences = { ...preferences };
    Object.keys(updatedPreferences).forEach(type => {
      updatedPreferences[type] = {
        ...updatedPreferences[type],
        [channel]: true,
      };
    });
    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const disableAll = (channel: NotificationChannel) => {
    const updatedPreferences = { ...preferences };
    Object.keys(updatedPreferences).forEach(type => {
      updatedPreferences[type] = {
        ...updatedPreferences[type],
        [channel]: false,
      };
    });
    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Customize how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {channelIcons[NotificationChannel.EMAIL]}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => enableAll(NotificationChannel.EMAIL)}>
                      Enable All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => disableAll(NotificationChannel.EMAIL)}>
                      Disable All
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {channelIcons[NotificationChannel.IN_APP]}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">In-App</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => enableAll(NotificationChannel.IN_APP)}>
                      Enable All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => disableAll(NotificationChannel.IN_APP)}>
                      Disable All
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {channelIcons[NotificationChannel.PUSH]}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Push</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => enableAll(NotificationChannel.PUSH)}>
                      Enable All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => disableAll(NotificationChannel.PUSH)}>
                      Disable All
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {channelIcons[NotificationChannel.SMS]}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">SMS</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => enableAll(NotificationChannel.SMS)}>
                      Enable All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => disableAll(NotificationChannel.SMS)}>
                      Disable All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notificationTypes.map(({ type, label, description, icon }) => (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
                <Select
                  value={preferences[type]?.frequency || NotificationFrequency.IMMEDIATE}
                  onValueChange={(value) => updateFrequency(type, value as NotificationFrequency)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NotificationFrequency.IMMEDIATE}>Immediate</SelectItem>
                    <SelectItem value={NotificationFrequency.DAILY}>Daily</SelectItem>
                    <SelectItem value={NotificationFrequency.WEEKLY}>Weekly</SelectItem>
                    <SelectItem value={NotificationFrequency.NEVER}>Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(NotificationChannel).map((channel) => (
                  <div key={channel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channelIcons[channel]}
                      <span className="text-sm capitalize">{channel.replace('_', ' ')}</span>
                    </div>
                    <Switch
                      checked={preferences[type]?.[channel] || false}
                      onCheckedChange={(checked) => updatePreference(type, channel, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Save Changes</CardTitle>
            <CardDescription>
              Your preferences will be applied immediately
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button 
              onClick={savePreferences} 
              disabled={!hasChanges}
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}