"use client";

import { AdvancedSearch } from '@/components/features/AdvancedSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Search</h1>
        <p className="text-muted-foreground">
          Find courses, assignments, discussions, and more across the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Everything</CardTitle>
          <CardDescription>
            Use filters and search queries to find exactly what you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedSearch />
        </CardContent>
      </Card>
    </div>
  );
}