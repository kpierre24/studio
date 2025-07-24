"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, Filter, Upload as UploadIcon } from 'lucide-react';
import { DragDropUpload } from './drag-drop-upload';
import { FilePreview, type FilePreviewItem } from './file-preview';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { fileUploadService } from '@/lib/file-upload';
import toast from 'react-hot-toast';

interface FileManagerProps {
  files: FilePreviewItem[];
  onFilesChange: (files: FilePreviewItem[]) => void;
  onFileUpload?: (file: File) => Promise<string>;
  uploadPath?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  showUpload?: boolean;
  className?: string;
}

export function FileManager({
  files,
  onFilesChange,
  onFileUpload,
  uploadPath = 'uploads',
  acceptedTypes,
  maxFiles = 50,
  maxSize = 10 * 1024 * 1024, // 10MB
  showUpload = true,
  className
}: FileManagerProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Filter files based on search and type filter
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || 
      fileUploadService.getFileCategory(file.type) === filterType;
    return matchesSearch && matchesType;
  });

  // Get unique file types for filter dropdown
  const fileTypes = Array.from(new Set(files.map(file => fileUploadService.getFileCategory(file.type))));

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (!onFileUpload) {
      // If no upload handler provided, just add files to the list
      const fileItems: FilePreviewItem[] = newFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      }));
      onFilesChange([...files, ...fileItems]);
      return;
    }

    setIsUploading(true);
    const uploadedFiles: FilePreviewItem[] = [];

    try {
      for (const file of newFiles) {
        try {
          const url = await onFileUpload(file);
          const fileItem: FilePreviewItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            thumbnail: file.type.startsWith('image/') ? url : undefined,
          };
          uploadedFiles.push(fileItem);
          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesChange([...files, ...uploadedFiles]);
      }
    } finally {
      setIsUploading(false);
    }
  }, [files, onFilesChange, onFileUpload]);

  const handleFileDelete = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
    toast.success('File deleted');
  }, [files, onFilesChange]);

  const handleFileView = useCallback((file: FilePreviewItem) => {
    window.open(file.url, '_blank');
  }, []);

  const handleFileDownload = useCallback((file: FilePreviewItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const getFileTypeStats = () => {
    const stats = files.reduce((acc, file) => {
      const category = fileUploadService.getFileCategory(file.type);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getFileTypeStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Section */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DragDropUpload
            onFilesSelected={handleFilesSelected}
            acceptedTypes={acceptedTypes}
            maxFiles={maxFiles}
            maxSize={maxSize}
            disabled={isUploading}
          />
        </motion.div>
      )}

      {/* Stats and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* File Stats */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </div>
          {Object.entries(stats).map(([type, count]) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}: {count}
            </Badge>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>

          {/* Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Layout Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={layout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${layout}-${searchQuery}-${filterType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <FilePreview
            files={filteredFiles}
            layout={layout}
            onDelete={handleFileDelete}
            onView={handleFileView}
            onDownload={handleFileDownload}
          />
        </motion.div>
      </AnimatePresence>

      {/* Empty State for Filtered Results */}
      {filteredFiles.length === 0 && files.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No files match your search criteria</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Uploading files...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}