"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ValidationItem {
  id: string;
  label: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message?: string;
}

export interface ValidationSection {
  id: string;
  title: string;
  items: ValidationItem[];
}

interface ContentValidationCheckerProps {
  sections: ValidationSection[];
  overallProgress: number;
  onItemClick?: (sectionId: string, itemId: string) => void;
}

export function ContentValidationChecker({
  sections,
  overallProgress,
  onItemClick
}: ContentValidationCheckerProps) {
  // Calculate statistics
  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const successItems = sections.reduce(
    (sum, section) => sum + section.items.filter(item => item.status === 'success').length,
    0
  );
  const errorItems = sections.reduce(
    (sum, section) => sum + section.items.filter(item => item.status === 'error').length,
    0
  );
  const warningItems = sections.reduce(
    (sum, section) => sum + section.items.filter(item => item.status === 'warning').length,
    0
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Content Validation</span>
          <div className="flex items-center gap-2">
            {errorItems > 0 && (
              <Badge variant="destructive">
                {errorItems} {errorItems === 1 ? 'Error' : 'Errors'}
              </Badge>
            )}
            {warningItems > 0 && (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                {warningItems} {warningItems === 1 ? 'Warning' : 'Warnings'}
              </Badge>
            )}
            {errorItems === 0 && warningItems === 0 && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                All Checks Passed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span>Completion Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {successItems} of {totalItems} items completed
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h4 className="font-medium text-sm">{section.title}</h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                      item.status === 'error' 
                        ? 'bg-red-50 dark:bg-red-950/20' 
                        : item.status === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/20'
                        : item.status === 'success'
                        ? 'bg-green-50 dark:bg-green-950/20'
                        : 'bg-blue-50 dark:bg-blue-950/20'
                    } ${onItemClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => onItemClick && onItemClick(section.id, item.id)}
                  >
                    {getStatusIcon(item.status)}
                    <span className="flex-1">{item.label}</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}