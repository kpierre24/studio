"use client";

import React, { useState } from 'react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { FileManager } from '@/components/ui/file-manager';
import { FilePreviewItem } from '@/components/ui/file-preview';
import { fileUploadService } from '@/lib/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

export function FileUploadExample() {
  const [files, setFiles] = useState<FilePreviewItem[]>([]);

  // Mock upload function for demonstration
  const handleFileUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate random upload failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Upload failed - network error');
    }
    
    // Return a mock URL
    return `https://example.com/uploads/${file.name}`;
  };

  const handleFilesSelected = (newFiles: File[]) => {
    console.log('Files selected:', newFiles);
    toast.success(`${newFiles.length} file(s) selected for upload`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">File Upload Interface Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the drag-and-drop file upload interface with preview and management
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Only</TabsTrigger>
          <TabsTrigger value="manager">File Manager</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Drag & Drop Upload</CardTitle>
              <CardDescription>
                Simple file upload with validation and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropUpload
                onFilesSelected={handleFilesSelected}
                onFileUpload={handleFileUpload}
                maxFiles={5}
                maxSize={5 * 1024 * 1024} // 5MB
                acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete File Manager</CardTitle>
              <CardDescription>
                Full file management interface with search, filtering, and organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileManager
                files={files}
                onFilesChange={setFiles}
                onFileUpload={handleFileUpload}
                maxFiles={20}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Drag & Drop Interface</h4>
                  <p className="text-sm text-muted-foreground">
                    Intuitive drag-and-drop with visual feedback and hover states
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ File Type Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurable file type restrictions with clear error messages
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Size Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    File size validation with customizable limits
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Upload Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time progress indicators with status tracking
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">✅ File Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Thumbnail previews for images and file type icons
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Search & Filter</h4>
                  <p className="text-sm text-muted-foreground">
                    Search by filename and filter by file type
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Multiple Layouts</h4>
                  <p className="text-sm text-muted-foreground">
                    Grid and list view options for different use cases
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Error Handling</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive error handling with user-friendly messages
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Components Created:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• DragDropUpload - Main upload interface</li>
                    <li>• FileManager - Complete file management</li>
                    <li>• FilePreview - File display and actions</li>
                    <li>• FileUploadService - Upload utilities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Features Implemented:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• File type and size validation</li>
                    <li>• Progress tracking and status</li>
                    <li>• Error handling and recovery</li>
                    <li>• Responsive design</li>
                    <li>• Accessibility support</li>
                    <li>• Animation and transitions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}