"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, Video, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import toast from 'react-hot-toast';

export interface UploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileUpload?: (file: File) => Promise<string>;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  showPreview?: boolean;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const DEFAULT_ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES
];

export function DragDropUpload({
  onFilesSelected,
  onFileUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  showPreview = true,
  multiple = true,
  className,
  disabled = false
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    return null;
  }, [acceptedTypes, maxSize]);

  const createFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast.error('Only one file is allowed');
      return;
    }

    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: UploadFile[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const preview = showPreview ? await createFilePreview(file) : undefined;
      const uploadFile: UploadFile = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        preview,
        progress: 0,
        status: 'uploading' as const
      });
      
      validFiles.push(uploadFile);
    }

    if (validFiles.length === 0) return;

    setUploadedFiles(prev => [...prev, ...validFiles]);
    onFilesSelected(validFiles);

    // Handle file upload if onFileUpload is provided
    if (onFileUpload) {
      setIsUploading(true);
      
      for (const file of validFiles) {
        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === file.id 
                  ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                  : f
              )
            );
          }, 200);

          const url = await onFileUpload(file);
          
          clearInterval(progressInterval);
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, progress: 100, status: 'success' as const }
                : f
            )
          );
          
          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    status: 'error' as const, 
                    error: error instanceof Error ? error.message : 'Upload failed' 
                  }
                : f
            )
          );
          
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      setIsUploading(false);
    }
  }, [uploadedFiles.length, maxFiles, multiple, validateFile, createFilePreview, showPreview, onFilesSelected, onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const getFileIcon = (file: UploadFile) => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return <Image className="w-4 h-4" />;
    } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return <Video className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Drop Zone */}
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <Upload className="w-6 h-6" />
          </motion.div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                browse files
              </Button>
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
            </p>
            <p>
              Max file size: {Math.round(maxSize / 1024 / 1024)}MB
              {multiple && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* File Preview */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            <h4 className="text-sm font-medium">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-1">
                        <Progress value={file.progress || 0} className="h-1" />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}