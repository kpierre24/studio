"use client";

import { BulkOperations } from '@/components/features/BulkOperations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BulkOperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Operations</h1>
        <p className="text-muted-foreground">
          Perform actions on multiple items at once to save time and increase efficiency
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Multiple Items</CardTitle>
          <CardDescription>
            Select multiple courses, assignments, or users and perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkOperations />
        </CardContent>
      </Card>
    </div>
  );
}