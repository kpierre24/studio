"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, File, Image, Video, FileText, AlertCircle, CheckCircle, 
  Camera, Folder, Plus, RotateCcw, Crop, Download, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import { Card } from './card';
import { Badge } from './badge';
import toast from 'react-hot-toast';

export interface MobileUploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
  thumbnail?: string;
}

interface MobileFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileUpload?: (file: File) => Promise<string>;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  showPreview?: boolean;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  enableCamera?: boolean;
  enableGallery?: boolean;
  enableCrop?: boolean;
  compressionQuality?: number;
  touchOptimized?: boolean;
  mobileLayout?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf', 'text/plain', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const DEFAULT_ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES
];

export function MobileFileUpload({
  onFilesSelected,
  onFileUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  showPreview = true,
  multiple = true,
  className,
  disabled = false,
  enableCamera = true,
  enableGallery = true,
  enableCrop = false,
  compressionQuality = 0.8,
  touchOptimized = true,
  mobileLayout = true
}: MobileFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MobileUploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MobileUploadFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    return null;
  }, [acceptedTypes, maxSize]);

  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        resolve(file);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        resolve(file);
        return;
      }

      const img = new (window as any).Image();
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for mobile)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new (window as any).File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          compressionQuality
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }, [compressionQuality]);

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

    const validFiles: MobileUploadFile[] = [];
    
    for (const originalFile of fileArray) {
      const error = validateFile(originalFile);
      if (error) {
        toast.error(`${originalFile.name}: ${error}`);
        continue;
      }

      // Compress image if needed
      const file = await compressImage(originalFile);
      const preview = showPreview ? await createFilePreview(file) : undefined;
      
      const uploadFile: MobileUploadFile = Object.assign(file, {
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
  }, [uploadedFiles.length, maxFiles, multiple, validateFile, createFilePreview, showPreview, onFilesSelected, onFileUpload, compressImage]);

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
    // Reset input value
    if (e.target) {
      e.target.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const getFileIcon = (file: MobileUploadFile) => {
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

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
    setShowUploadOptions(false);
  };

  const handleGallerySelect = () => {
    galleryInputRef.current?.click();
    setShowUploadOptions(false);
  };

  const handleFilesBrowse = () => {
    fileInputRef.current?.click();
    setShowUploadOptions(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {enableCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      )}
      
      {enableGallery && (
        <input
          ref={galleryInputRef}
          type="file"
          multiple={multiple}
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      )}

      {/* Hidden canvas for image compression */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mobile upload interface */}
      {mobileLayout ? (
        <div className="space-y-4">
          {/* Upload options */}
          <div className="grid grid-cols-2 gap-3">
            {enableCamera && (
              <Button
                variant="outline"
                className={cn(
                  "h-20 flex-col gap-2",
                  touchOptimized && "touch-manipulation"
                )}
                onClick={handleCameraCapture}
                disabled={disabled}
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Camera</span>
              </Button>
            )}
            
            {enableGallery && (
              <Button
                variant="outline"
                className={cn(
                  "h-20 flex-col gap-2",
                  touchOptimized && "touch-manipulation"
                )}
                onClick={handleGallerySelect}
                disabled={disabled}
              >
                <Image className="w-6 h-6" />
                <span className="text-sm">Gallery</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              className={cn(
                "h-20 flex-col gap-2",
                touchOptimized && "touch-manipulation",
                !enableCamera && !enableGallery && "col-span-2"
              )}
              onClick={handleFilesBrowse}
              disabled={disabled}
            >
              <Folder className="w-6 h-6" />
              <span className="text-sm">Files</span>
            </Button>
            
            {(enableCamera || enableGallery) && (
              <Button
                variant="outline"
                className={cn(
                  "h-20 flex-col gap-2",
                  touchOptimized && "touch-manipulation"
                )}
                onClick={() => setShowUploadOptions(true)}
                disabled={disabled}
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm">More</span>
              </Button>
            )}
          </div>

          {/* Drag and drop area (smaller on mobile) */}
          <motion.div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Or drag and drop files here
            </p>
          </motion.div>
        </div>
      ) : (
        // Desktop layout
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
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={handleFilesBrowse}
                  disabled={disabled}
                >
                  browse files
                </Button>
                {enableCamera && (
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={handleCameraCapture}
                    disabled={disabled}
                  >
                    take photo
                  </Button>
                )}
                {enableGallery && (
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={handleGallerySelect}
                    disabled={disabled}
                  >
                    choose from gallery
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File info */}
      <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
        <p>
          Supported: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
        </p>
        <p>
          Max size: {Math.round(maxSize / 1024 / 1024)}MB
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
      </div>

      {/* File Preview */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              {uploadedFiles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <div className={cn(
              "space-y-3",
              mobileLayout && "grid grid-cols-1 gap-3"
            )}>
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                >
                  <Card className="p-3">
                    <div className="flex items-center gap-3">
                      {/* File Preview */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <div className="relative">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            {file.status === 'success' && (
                              <div className="absolute -top-1 -right-1">
                                <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          <Badge variant={
                            file.status === 'success' ? 'default' :
                            file.status === 'error' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {file.status === 'uploading' ? 'Uploading' :
                             file.status === 'success' ? 'Uploaded' : 'Error'}
                          </Badge>
                        </div>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={file.progress || 0} className="h-1" />
                          </div>
                        )}
                        
                        {/* Error Message */}
                        {file.status === 'error' && file.error && (
                          <p className="text-xs text-destructive mt-1">{file.error}</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {file.status === 'success' && file.preview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Image className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="w-8 h-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload options modal */}
      <AnimatePresence>
        {showUploadOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setShowUploadOptions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-background rounded-t-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-center">Upload Options</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {enableCamera && (
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Camera</span>
                  </Button>
                )}
                
                {enableGallery && (
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={handleGallerySelect}
                  >
                    <Image className="w-6 h-6" />
                    <span className="text-sm">Gallery</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={handleFilesBrowse}
                >
                  <Folder className="w-6 h-6" />
                  <span className="text-sm">Files</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowUploadOptions(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File preview modal */}
      <AnimatePresence>
        {selectedFile && selectedFile.preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedFile.preview}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                <p className="text-white/70 text-xs">{formatFileSize(selectedFile.size)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}