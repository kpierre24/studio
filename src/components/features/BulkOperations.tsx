'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Download, Upload, Trash2, Send, CheckCircle, AlertCircle, Users, FileText, Calendar } from 'lucide-react';

export enum BulkOperationType {
  ASSIGNMENTS = 'assignments',
  USERS = 'users',
  COURSES = 'courses',
  SUBMISSIONS = 'submissions',
}

export enum BulkAction {
  DELETE = 'delete',
  EXPORT = 'export',
  EMAIL = 'email',
  ASSIGN = 'assign',
  ENROLL = 'enroll',
  GRADE = 'grade',
  ARCHIVE = 'archive',
}

interface BulkOperationItem {
  id: string;
  title: string;
  type: BulkOperationType;
  status: string;
  metadata: Record<string, any>;
  selected: boolean;
}

interface BulkOperationsProps {
  type: BulkOperationType;
  items: BulkOperationItem[];
  onOperationComplete?: (action: BulkAction, items: BulkOperationItem[]) => void;
}

export function BulkOperations({ type, items: initialItems, onOperationComplete }: BulkOperationsProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<BulkOperationItem[]>(initialItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});

  const isAllSelected = selectedItems.length === items.length && items.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [items]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  }, []);

  const getAvailableActions = () => {
    switch (type) {
      case BulkOperationType.ASSIGNMENTS:
        return [
          { value: BulkAction.DELETE, label: 'Delete', icon: Trash2 },
          { value: BulkAction.EXPORT, label: 'Export', icon: Download },
          { value: BulkAction.EMAIL, label: 'Send Reminder', icon: Send },
        ];
      case BulkOperationType.USERS:
        return [
          { value: BulkAction.EMAIL, label: 'Send Email', icon: Send },
          { value: BulkAction.ENROLL, label: 'Enroll in Course', icon: CheckCircle },
          { value: BulkAction.DELETE, label: 'Remove', icon: Trash2 },
        ];
      case BulkOperationType.COURSES:
        return [
          { value: BulkAction.EXPORT, label: 'Export Data', icon: Download },
          { value: BulkAction.ARCHIVE, label: 'Archive', icon: Calendar },
          { value: BulkAction.DELETE, label: 'Delete', icon: Trash2 },
        ];
      case BulkOperationType.SUBMISSIONS:
        return [
          { value: BulkAction.GRADE, label: 'Bulk Grade', icon: CheckCircle },
          { value: BulkAction.EXPORT, label: 'Export', icon: Download },
        ];
      default:
        return [];
    }
  };

  const executeBulkOperation = async () => {
    if (!selectedAction || selectedItems.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setShowConfirmation(false);

    const itemsToProcess = items.filter(item => selectedItems.includes(item.id));
    
    try {
      // Simulate bulk operation processing
      const totalItems = itemsToProcess.length;
      let processed = 0;

      for (const item of itemsToProcess) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        processed++;
        setProcessingProgress((processed / totalItems) * 100);

        // Handle different actions
        switch (selectedAction) {
          case BulkAction.DELETE:
            setItems(prev => prev.filter(i => i.id !== item.id));
            break;
          case BulkAction.EXPORT:
            // Generate export data
            break;
          case BulkAction.EMAIL:
            // Send email logic
            break;
          case BulkAction.GRADE:
            // Bulk grading logic
            break;
          default:
            break;
        }
      }

      toast.success(`${selectedItems.length} items processed successfully`);
      onOperationComplete?.(selectedAction, itemsToProcess);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Bulk operation failed');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case BulkAction.DELETE:
        return `Delete ${selectedItems.length} ${type}${selectedItems.length > 1 ? 's' : ''}? This action cannot be undone.`;
      case BulkAction.EXPORT:
        return `Export ${selectedItems.length} ${type}${selectedItems.length > 1 ? 's' : ''} as CSV?`;
      case BulkAction.EMAIL:
        return `Send email to ${selectedItems.length} ${type}${selectedItems.length > 1 ? 's' : ''}?`;
      case BulkAction.GRADE:
        return `Grade ${selectedItems.length} submission${selectedItems.length > 1 ? 's' : ''}?`;
      default:
        return `Process ${selectedItems.length} ${type}${selectedItems.length > 1 ? 's' : ''}?`;
    }
  };

  const renderActionConfig = () => {
    switch (selectedAction) {
      case BulkAction.GRADE:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Grade</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={actionConfig.grade || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="Enter grade"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={actionConfig.feedback || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Enter feedback"
              />
            </div>
          </div>
        );
      case BulkAction.EMAIL:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={actionConfig.subject || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={actionConfig.message || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Email message"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {type === BulkOperationType.ASSIGNMENTS && <FileText className="w-5 h-5" />}
              {type === BulkOperationType.USERS && <Users className="w-5 h-5" />}
              {type === BulkOperationType.COURSES && <BookOpen className="w-5 h-5" />}
              {type === BulkOperationType.SUBMISSIONS && <CheckCircle className="w-5 h-5" />}
              Bulk Operations
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <>
                  <Select onValueChange={(value) => setSelectedAction(value as BulkAction)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableActions().map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            <action.icon className="w-4 h-4" />
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowConfirmation(true)}
                    disabled={!selectedAction || isProcessing}
                    variant="destructive"
                  >
                    Apply to {selectedItems.length} items
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isProcessing && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-gray-600">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="text-sm text-gray-600">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Operation</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          {renderActionConfig()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={executeBulkOperation}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}