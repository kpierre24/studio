"use client";

import { ExportImport } from '@/components/features/ExportImport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExportImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export & Import</h1>
        <p className="text-muted-foreground">
          Import and export data in various formats for backup, migration, or analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your data to CSV, JSON, or Excel formats, or import data from external sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportImport />
        </CardContent>
      </Card>
    </div>
  );
}