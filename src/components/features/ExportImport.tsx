'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export enum ExportType {
  STUDENTS = 'students',
  COURSES = 'courses',
  ASSIGNMENTS = 'assignments',
  GRADES = 'grades',
  ATTENDANCE = 'attendance',
  DISCUSSIONS = 'discussions',
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
}

interface ExportImportProps {
  courseId?: string;
  onExportComplete?: (data: any) => void;
  onImportComplete?: (data: any) => void;
}

export function ExportImport({ courseId, onExportComplete, onImportComplete }: ExportImportProps) {
  const { user } = useAuth();
  const [exportType, setExportType] = useState<ExportType>(ExportType.STUDENTS);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    details: string[];
  } | null>(null);

  // Mock data for demonstration
  const generateMockData = (type: ExportType) => {
    switch (type) {
      case ExportType.STUDENTS:
        return [
          { id: '1', name: 'John Doe', email: 'john@example.com', enrolled: '2024-01-15', status: 'active' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', enrolled: '2024-01-16', status: 'active' },
          { id: '3', name: 'Bob Johnson', email: 'bob@example.com', enrolled: '2024-01-17', status: 'inactive' },
        ];
      case ExportType.COURSES:
        return [
          { id: '1', title: 'Web Development', instructor: 'Dr. Smith', duration: '8 weeks', students: 45 },
          { id: '2', title: 'Data Science', instructor: 'Dr. Johnson', duration: '10 weeks', students: 32 },
          { id: '3', title: 'Mobile Development', instructor: 'Dr. Williams', duration: '6 weeks', students: 28 },
        ];
      case ExportType.ASSIGNMENTS:
        return [
          { id: '1', title: 'HTML Basics', course: 'Web Development', dueDate: '2024-02-01', points: 100 },
          { id: '2', title: 'CSS Layout', course: 'Web Development', dueDate: '2024-02-08', points: 150 },
          { id: '3', title: 'JavaScript Functions', course: 'Web Development', dueDate: '2024-02-15', points: 200 },
        ];
      case ExportType.GRADES:
        return [
          { studentId: '1', studentName: 'John Doe', assignment: 'HTML Basics', grade: 95, feedback: 'Excellent work!' },
          { studentId: '2', studentName: 'Jane Smith', assignment: 'HTML Basics', grade: 88, feedback: 'Good job!' },
          { studentId: '3', studentName: 'Bob Johnson', assignment: 'HTML Basics', grade: 76, feedback: 'Needs improvement' },
        ];
      case ExportType.ATTENDANCE:
        return [
          { studentId: '1', studentName: 'John Doe', date: '2024-01-20', status: 'present' },
          { studentId: '2', studentName: 'Jane Smith', date: '2024-01-20', status: 'present' },
          { studentId: '3', studentName: 'Bob Johnson', date: '2024-01-20', status: 'absent' },
        ];
      case ExportType.DISCUSSIONS:
        return [
          { id: '1', title: 'Welcome Discussion', author: 'Dr. Smith', replies: 12, views: 156, created: '2024-01-15' },
          { id: '2', title: 'Week 1 Questions', author: 'John Doe', replies: 8, views: 89, created: '2024-01-18' },
          { id: '3', title: 'Assignment Help', author: 'Jane Smith', replies: 15, views: 234, created: '2024-01-20' },
        ];
      default:
        return [];
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const data = generateMockData(exportType);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${exportType}_${timestamp}.${exportFormat}`;

      switch (exportFormat) {
        case ExportFormat.CSV:
          const csvContent = convertToCSV(data);
          downloadFile(csvContent, filename, 'text/csv');
          break;
        case ExportFormat.JSON:
          const jsonContent = JSON.stringify(data, null, 2);
          downloadFile(jsonContent, filename, 'application/json');
          break;
        case ExportFormat.EXCEL:
          // For Excel, we'll use CSV as a simple alternative
          const excelContent = convertToCSV(data);
          downloadFile(excelContent, filename.replace('.excel', '.csv'), 'text/csv');
          break;
      }

      toast.success(`Successfully exported ${data.length} records`);
      onExportComplete?.(data);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const fileContent = await importFile.text();
      let data: any[] = [];

      // Parse file based on format
      if (importFile.name.endsWith('.csv')) {
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });
      } else if (importFile.name.endsWith('.json')) {
        data = JSON.parse(fileContent);
      }

      // Simulate import process
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mock import results
      const results = {
        success: Math.floor(data.length * 0.8),
        errors: Math.floor(data.length * 0.2),
        details: [
          `${Math.floor(data.length * 0.8)} records imported successfully`,
          `${Math.floor(data.length * 0.2)} records had validation errors`,
          'Duplicate records were skipped',
        ],
      };

      setImportResults(results);
      toast.success(`Imported ${results.success} records`);
      onImportComplete?.(data);
    } catch (error) {
      toast.error('Import failed');
      setImportResults({
        success: 0,
        errors: 1,
        details: ['Invalid file format or corrupted data'],
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportFile(null);
    }
  };

  const getTemplateUrl = (type: ExportType) => {
    const templateData = generateMockData(type).slice(0, 1);
    const csvContent = convertToCSV(templateData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data Type</label>
                  <Select value={exportType} onValueChange={(value) => setExportType(value as ExportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExportType.STUDENTS}>Students</SelectItem>
                      <SelectItem value={ExportType.COURSES}>Courses</SelectItem>
                      <SelectItem value={ExportType.ASSIGNMENTS}>Assignments</SelectItem>
                      <SelectItem value={ExportType.GRADES}>Grades</SelectItem>
                      <SelectItem value={ExportType.ATTENDANCE}>Attendance</SelectItem>
                      <SelectItem value={ExportType.DISCUSSIONS}>Discussions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
                      <SelectItem value={ExportFormat.JSON}>JSON</SelectItem>
                      <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your file here, or click to select
                </p>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">Supported formats: CSV, JSON</p>
                <p>
                  Download template: 
                  <a 
                    href={getTemplateUrl(exportType)} 
                    download={`${exportType}_template.csv`}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {exportType}_template.csv
                  </a>
                </p>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {importResults && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>Successfully imported: {importResults.success}</p>
                      <p>Errors: {importResults.errors}</p>
                      {importResults.details.map((detail, index) => (
                        <p key={index} className="text-sm">{detail}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!importFile || isImporting}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}