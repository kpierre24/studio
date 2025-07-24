"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Video, 
  FileVideo, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Play,
  Pause,
  Settings,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  Clock,
  HardDrive,
  Wifi,
  Zap,
  Globe,
  Lock,
  Users
} from 'lucide-react';

// Types
export interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadedUrl?: string;
  processedUrls?: {
    quality: string;
    url: string;
    size: number;
  }[];
  error?: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  allowDownload: boolean;
  allowComments: boolean;
  category: string;
  language: string;
  captions?: {
    language: string;
    file: File;
  }[];
}

export interface VideoUploadManagerProps {
  onVideoUpload: (video: VideoFile, metadata: VideoMetadata) => Promise<void>;
  onVideoDelete: (videoId: string) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  enableMultipleQuality?: boolean;
  enableCaptions?: boolean;
  enableAnalytics?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mov',
  'video/wmv'
];

const VIDEO_QUALITIES = [
  { label: '4K (2160p)', value: '2160p', bitrate: '15000k' },
  { label: 'Full HD (1080p)', value: '1080p', bitrate: '8000k' },
  { label: 'HD (720p)', value: '720p', bitrate: '5000k' },
  { label: 'SD (480p)', value: '480p', bitrate: '2500k' },
  { label: 'Low (360p)', value: '360p', bitrate: '1000k' }
];

export function VideoUploadManager({
  onVideoUpload,
  onVideoDelete,
  maxFileSize = 500, // 500MB default
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  enableMultipleQuality = true,
  enableCaptions = true,
  enableAnalytics = false,
  className = ""
}: VideoUploadManagerProps) {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    tags: [],
    visibility: 'private',
    allowDownload: false,
    allowComments: true,
    category: 'education',
    language: 'en',
    captions: []
  });
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newVideos: VideoFile[] = [];
    
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      
      if (error) {
        // Show error notification
        console.error(error);
        return;
      }

      const videoFile: VideoFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0
      };

      newVideos.push(videoFile);
    });

    setVideos(prev => [...prev, ...newVideos]);
    
    // Generate thumbnails for new videos
    newVideos.forEach(generateThumbnail);
  }, [maxFileSize, acceptedFormats]);

  // Generate video thumbnail
  const generateThumbnail = async (video: VideoFile) => {
    const videoElement = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    videoElement.src = URL.createObjectURL(video.file);
    
    videoElement.addEventListener('loadedmetadata', () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      videoElement.currentTime = Math.min(5, videoElement.duration / 2); // Thumbnail at 5s or middle
    });
    
    videoElement.addEventListener('seeked', () => {
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        
        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { ...v, thumbnail, duration: videoElement.duration }
            : v
        ));
      }
      
      URL.revokeObjectURL(videoElement.src);
    });
  };

  // Simulate video upload and processing
  const uploadVideo = async (video: VideoFile) => {
    setVideos(prev => prev.map(v => 
      v.id === video.id ? { ...v, status: 'uploading', progress: 0 } : v
    ));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, progress } : v
      ));
    }

    // Simulate processing
    setVideos(prev => prev.map(v => 
      v.id === video.id ? { ...v, status: 'processing', progress: 0 } : v
    ));

    // Simulate processing progress
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, progress } : v
      ));
    }

    // Complete processing
    const processedUrls = enableMultipleQuality 
      ? VIDEO_QUALITIES.map(quality => ({
          quality: quality.value,
          url: `https://example.com/video/${video.id}_${quality.value}.mp4`,
          size: Math.floor(video.size * (quality.value === '1080p' ? 1 : quality.value === '720p' ? 0.7 : 0.5))
        }))
      : [{
          quality: '1080p',
          url: `https://example.com/video/${video.id}.mp4`,
          size: video.size
        }];

    setVideos(prev => prev.map(v => 
      v.id === video.id 
        ? { 
            ...v, 
            status: 'completed', 
            progress: 100,
            uploadedUrl: processedUrls[0].url,
            processedUrls
          } 
        : v
    ));

    // Call the upload callback
    try {
      await onVideoUpload(video, metadata);
    } catch (error) {
      setVideos(prev => prev.map(v => 
        v.id === video.id 
          ? { ...v, status: 'error', error: 'Upload failed' } 
          : v
      ));
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remove video
  const removeVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    onVideoDelete(videoId);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Upload Manager
          </CardTitle>
          <CardDescription>
            Upload and manage your educational videos with automatic processing and multiple quality options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {isDragging ? 'Drop videos here' : 'Upload Videos'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop video files or click to browse
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Supported formats: {acceptedFormats.map(f => f.split('/')[1]).join(', ')}</p>
              <p>Maximum file size: {maxFileSize}MB</p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Videos ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {videos.map(video => (
                  <VideoUploadItem
                    key={video.id}
                    video={video}
                    onUpload={() => uploadVideo(video)}
                    onRemove={() => removeVideo(video.id)}
                    onSelect={() => setSelectedVideo(video.id)}
                    isSelected={selectedVideo === video.id}
                    formatFileSize={formatFileSize}
                    formatDuration={formatDuration}
                    enableMultipleQuality={enableMultipleQuality}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Metadata Form */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <CardTitle>Video Settings</CardTitle>
            <CardDescription>
              Configure metadata and settings for your video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoMetadataForm
              metadata={metadata}
              onChange={setMetadata}
              enableCaptions={enableCaptions}
            />
          </CardContent>
        </Card>
      )}

      {/* Processing Queue Status */}
      {videos.some(v => v.status === 'uploading' || v.status === 'processing') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videos
                .filter(v => v.status === 'uploading' || v.status === 'processing')
                .map(video => (
                  <div key={video.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{video.name}</span>
                      <Badge variant={video.status === 'uploading' ? 'default' : 'secondary'}>
                        {video.status === 'uploading' ? 'Uploading' : 'Processing'}
                      </Badge>
                    </div>
                    <Progress value={video.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {video.progress}% complete
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Video Upload Item Component
interface VideoUploadItemProps {
  video: VideoFile;
  onUpload: () => void;
  onRemove: () => void;
  onSelect: () => void;
  isSelected: boolean;
  formatFileSize: (bytes: number) => string;
  formatDuration: (seconds: number) => string;
  enableMultipleQuality: boolean;
}

function VideoUploadItem({
  video,
  onUpload,
  onRemove,
  onSelect,
  isSelected,
  formatFileSize,
  formatDuration,
  enableMultipleQuality
}: VideoUploadItemProps) {
  const getStatusIcon = () => {
    switch (video.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <FileVideo className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (video.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'uploading':
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      default:
        return isSelected ? 'border-primary bg-primary/5' : 'border-border';
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${getStatusColor()}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileVideo className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{video.name}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(video.size)}
                </span>
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status and Progress */}
          {video.status === 'pending' && (
            <Button onClick={onUpload} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          )}

          {(video.status === 'uploading' || video.status === 'processing') && (
            <div className="space-y-1">
              <Progress value={video.progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {video.status === 'uploading' ? 'Uploading' : 'Processing'} - {video.progress}%
              </div>
            </div>
          )}

          {video.status === 'completed' && video.processedUrls && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Ready
                </Badge>
                {enableMultipleQuality && (
                  <Badge variant="outline" className="text-xs">
                    {video.processedUrls.length} qualities
                  </Badge>
                )}
              </div>
              
              {enableMultipleQuality && (
                <div className="flex flex-wrap gap-1">
                  {video.processedUrls.map(url => (
                    <Badge key={url.quality} variant="outline" className="text-xs">
                      {url.quality}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {video.status === 'error' && (
            <div className="text-sm text-red-600">
              Error: {video.error || 'Upload failed'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Video Metadata Form Component
interface VideoMetadataFormProps {
  metadata: VideoMetadata;
  onChange: (metadata: VideoMetadata) => void;
  enableCaptions: boolean;
}

function VideoMetadataForm({ metadata, onChange, enableCaptions }: VideoMetadataFormProps) {
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    onChange({ ...metadata, tags });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => onChange({ ...metadata, title: e.target.value })}
            placeholder="Enter video title"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={metadata.category}
            onChange={(e) => onChange({ ...metadata, category: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="education">Education</option>
            <option value="tutorial">Tutorial</option>
            <option value="lecture">Lecture</option>
            <option value="demonstration">Demonstration</option>
            <option value="discussion">Discussion</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={metadata.description}
          onChange={(e) => onChange({ ...metadata, description: e.target.value })}
          placeholder="Describe your video content"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={metadata.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="education, tutorial, science"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            value={metadata.visibility}
            onChange={(e) => onChange({ ...metadata, visibility: e.target.value as VideoMetadata['visibility'] })}
            className="w-full p-2 border rounded-md"
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={metadata.language}
            onChange={(e) => onChange({ ...metadata, language: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowDownload"
            checked={metadata.allowDownload}
            onChange={(e) => onChange({ ...metadata, allowDownload: e.target.checked })}
          />
          <Label htmlFor="allowDownload">Allow video download</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowComments"
            checked={metadata.allowComments}
            onChange={(e) => onChange({ ...metadata, allowComments: e.target.checked })}
          />
          <Label htmlFor="allowComments">Allow comments</Label>
        </div>
      </div>

      {enableCaptions && (
        <div>
          <Label>Captions/Subtitles</Label>
          <div className="mt-2 p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Upload caption files to make your videos more accessible
            </p>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Add Captions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}