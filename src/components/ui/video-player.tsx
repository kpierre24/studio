"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Bookmark,
  MessageCircle,
  Clock,
  Download,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
  Users,
  FileText,
  Upload,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

// Types
export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
  thumbnail?: string;
}

export interface VideoComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
  content: string;
  createdAt: Date;
  replies: VideoCommentReply[];
}

export interface VideoCommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface VideoAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementPoints: { timestamp: number; interactions: number }[];
  viewerRetention: { timestamp: number; percentage: number }[];
}

export interface VideoPlayerProps {
  src: string;
  title: string;
  description?: string;
  chapters?: VideoChapter[];
  comments?: VideoComment[];
  analytics?: VideoAnalytics;
  enableChapters?: boolean;
  enableComments?: boolean;
  enableAnalytics?: boolean;
  enableDownload?: boolean;
  enableSharing?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onCommentAdd?: (comment: Omit<VideoComment, 'id' | 'createdAt' | 'replies'>) => void;
  onChapterAdd?: (chapter: Omit<VideoChapter, 'id'>) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  title,
  description,
  chapters = [],
  comments = [],
  analytics,
  enableChapters = true,
  enableComments = true,
  enableAnalytics = false,
  enableDownload = false,
  enableSharing = true,
  autoPlay = false,
  showControls = true,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onCommentAdd,
  onChapterAdd,
  className = ""
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');

  // Video event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    seekTo(Math.min(currentTime + 10, duration));
  };

  const skipBackward = () => {
    seekTo(Math.max(currentTime - 10, 0));
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (newVolume: number[]) => {
    const vol = newVolume[0];
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Chapter navigation
  const getCurrentChapter = () => {
    return chapters.find(chapter => 
      currentTime >= chapter.startTime && currentTime <= chapter.endTime
    );
  };

  const jumpToChapter = (chapter: VideoChapter) => {
    seekTo(chapter.startTime);
  };

  // Comment functions
  const addComment = () => {
    if (!newComment.trim() || !onCommentAdd) return;

    onCommentAdd({
      userId: 'current-user',
      userName: 'Current User',
      timestamp: commentTimestamp || currentTime,
      content: newComment.trim()
    });

    setNewComment('');
    setCommentTimestamp(0);
  };

  const jumpToComment = (timestamp: number) => {
    seekTo(timestamp);
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current chapter
  const currentChapter = getCurrentChapter();

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full"
          autoPlay={autoPlay}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          {/* Chapter Indicator */}
          {currentChapter && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {currentChapter.title}
              </Badge>
            </div>
          )}

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={changeVolume}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(Number(e.target.value))}
                    className="bg-black/50 text-white text-sm rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Info and Controls */}
      <div className="bg-background p-4 space-y-4">
        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {enableChapters && chapters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChapters(!showChapters)}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Chapters
              </Button>
            )}

            {enableComments && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comments ({comments.length})
              </Button>
            )}

            {enableAnalytics && analytics && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            )}

            {enableSharing && (
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}

            {enableDownload && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Panels */}
        <AnimatePresence>
          {/* Chapters Panel */}
          {showChapters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ChaptersPanel
                chapters={chapters}
                currentTime={currentTime}
                onChapterClick={jumpToChapter}
                onChapterAdd={onChapterAdd}
              />
            </motion.div>
          )}

          {/* Comments Panel */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CommentsPanel
                comments={comments}
                currentTime={currentTime}
                newComment={newComment}
                setNewComment={setNewComment}
                commentTimestamp={commentTimestamp}
                setCommentTimestamp={setCommentTimestamp}
                onCommentAdd={addComment}
                onCommentClick={jumpToComment}
              />
            </motion.div>
          )}

          {/* Analytics Panel */}
          {showAnalytics && analytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AnalyticsPanel analytics={analytics} duration={duration} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Chapters Panel Component
interface ChaptersPanelProps {
  chapters: VideoChapter[];
  currentTime: number;
  onChapterClick: (chapter: VideoChapter) => void;
  onChapterAdd?: (chapter: Omit<VideoChapter, 'id'>) => void;
}

function ChaptersPanel({ chapters, currentTime, onChapterClick, onChapterAdd }: ChaptersPanelProps) {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    startTime: 0,
    endTime: 0,
    description: ''
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddChapter = () => {
    if (!newChapter.title.trim() || !onChapterAdd) return;

    onChapterAdd({
      ...newChapter,
      startTime: newChapter.startTime || currentTime
    });

    setNewChapter({ title: '', startTime: 0, endTime: 0, description: '' });
    setIsAddingChapter(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chapters</CardTitle>
          {onChapterAdd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingChapter(!isAddingChapter)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Chapter Form */}
        {isAddingChapter && (
          <div className="space-y-3 p-3 border rounded-lg mb-4">
            <Input
              placeholder="Chapter title"
              value={newChapter.title}
              onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Start time (seconds)"
                value={newChapter.startTime}
                onChange={(e) => setNewChapter(prev => ({ ...prev, startTime: Number(e.target.value) }))}
              />
              <Input
                type="number"
                placeholder="End time (seconds)"
                value={newChapter.endTime}
                onChange={(e) => setNewChapter(prev => ({ ...prev, endTime: Number(e.target.value) }))}
              />
            </div>
            <Input
              placeholder="Description (optional)"
              value={newChapter.description}
              onChange={(e) => setNewChapter(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddChapter} disabled={!newChapter.title.trim()}>
                Add Chapter
              </Button>
              <Button variant="outline" onClick={() => setIsAddingChapter(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Chapters List */}
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {chapters.map((chapter, index) => {
              const isActive = currentTime >= chapter.startTime && currentTime <= chapter.endTime;
              
              return (
                <div
                  key={chapter.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => onChapterClick(chapter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {chapter.title}
                        </span>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Playing
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                      </div>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {chapters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chapters available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Comments Panel Component
interface CommentsPanelProps {
  comments: VideoComment[];
  currentTime: number;
  newComment: string;
  setNewComment: (comment: string) => void;
  commentTimestamp: number;
  setCommentTimestamp: (timestamp: number) => void;
  onCommentAdd: () => void;
  onCommentClick: (timestamp: number) => void;
}

function CommentsPanel({
  comments,
  currentTime,
  newComment,
  setNewComment,
  commentTimestamp,
  setCommentTimestamp,
  onCommentAdd,
  onCommentClick
}: CommentsPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Comment */}
        <div className="space-y-3 p-3 border rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Timestamp"
              value={commentTimestamp || Math.floor(currentTime)}
              onChange={(e) => setCommentTimestamp(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              {formatTime(commentTimestamp || currentTime)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentTimestamp(Math.floor(currentTime))}
            >
              <Clock className="w-3 h-3 mr-1" />
              Current
            </Button>
          </div>
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onCommentAdd()}
          />
          <Button onClick={onCommentAdd} disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {sortedComments.map(comment => (
              <div
                key={comment.id}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => onCommentClick(comment.timestamp)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {comment.userName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(comment.timestamp)}
                      </Badge>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Panel Component
interface AnalyticsPanelProps {
  analytics: VideoAnalytics;
  duration: number;
}

function AnalyticsPanel({ analytics, duration }: AnalyticsPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Video Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{analytics.totalViews}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{analytics.uniqueViewers}</div>
            <div className="text-sm text-muted-foreground">Unique Viewers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatTime(analytics.averageWatchTime)}
            </div>
            <div className="text-sm text-muted-foreground">Avg. Watch Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(analytics.completionRate * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </div>

        {/* Viewer Retention Chart */}
        <div className="space-y-2">
          <h4 className="font-medium">Viewer Retention</h4>
          <div className="h-32 bg-muted rounded-lg p-4 flex items-end gap-1">
            {analytics.viewerRetention.map((point, index) => (
              <div
                key={index}
                className="bg-primary flex-1 rounded-t"
                style={{ height: `${point.percentage}%` }}
                title={`${formatTime(point.timestamp)}: ${Math.round(point.percentage)}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Engagement Points */}
        <div className="space-y-2 mt-6">
          <h4 className="font-medium">Engagement Hotspots</h4>
          <div className="space-y-1">
            {analytics.engagementPoints
              .sort((a, b) => b.interactions - a.interactions)
              .slice(0, 5)
              .map((point, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{formatTime(point.timestamp)}</span>
                  <Badge variant="outline">{point.interactions} interactions</Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}