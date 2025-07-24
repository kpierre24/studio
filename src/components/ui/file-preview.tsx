"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  File, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { fileUploadService } from '@/lib/file-upload';

export interface FilePreviewItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  thumbnail?: string;
}

interface FilePreviewProps {
  files: FilePreviewItem[];
  onDelete?: (fileId: string) => void;
  onView?: (file: FilePreviewItem) => void;
  onDownload?: (file: FilePreviewItem) => void;
  layout?: 'grid' | 'list';
  showActions?: boolean;
  className?: string;
}

export function FilePreview({
  files,
  onDelete,
  onView,
  onDownload,
  layout = 'grid',
  showActions = true,
  className
}: FilePreviewProps) {
  const getFileIcon = (type: string) => {
    const category = fileUploadService.getFileCategory(type);
    switch (category) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    const category = fileUploadService.getFileCategory(type);
    switch (category) {
      case 'image':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'video':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDownload = (file: FilePreviewItem) => {
    if (onDownload) {
      onDownload(file);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (files.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={cn("space-y-2", className)}>
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            {/* File Icon/Thumbnail */}
            <div className="flex-shrink-0">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{file.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-xs", getFileTypeColor(file.type))}>
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {fileUploadService.formatFileSize(file.size)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {file.uploadedAt.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(file)}
                    className="w-8 h-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  className="w-8 h-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(file.id)}
                    className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid layout
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-200"
        >
          {/* File Preview */}
          <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {getFileIcon(file.type)}
                <Badge variant="secondary" className={cn("text-xs", getFileTypeColor(file.type))}>
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
            )}

            {/* Overlay Actions */}
            {showActions && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(file)}
                    className="w-8 h-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  className="w-8 h-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-3">
            <h4 className="font-medium text-sm truncate mb-1">{file.name}</h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{fileUploadService.formatFileSize(file.size)}</span>
              <span>{file.uploadedAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Delete Button */}
          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(file.id)}
              className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </motion.div>
      ))}
    </div>
  );
}