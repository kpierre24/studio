"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FolderTree,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Copy,
  Move,
  Archive,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Eye,
  EyeOff,
  Star,
  Tag,
  Workflow,
  GitBranch,
  History,
  Settings,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  Send,
  ArrowRight,
  X
} from 'lucide-react';

// Types
export interface ContentItem {
  id: string;
  title: string;
  type: 'lesson' | 'assignment' | 'quiz' | 'discussion' | 'resource' | 'announcement';
  content: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledFor?: Date;
  dueDate?: Date;
  parentFolder?: string;
  dependencies: string[];
  collaborators: ContentCollaborator[];
  version: number;
  isTemplate: boolean;
  metadata: Record<string, any>;
}

export interface ContentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  createdBy: string;
  createdAt: Date;
  isShared: boolean;
  permissions: FolderPermission[];
}

export interface ContentCollaborator {
  userId: string;
  userName: string;
  role: 'viewer' | 'editor' | 'reviewer' | 'admin';
  addedAt: Date;
}

export interface FolderPermission {
  userId: string;
  userName: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedAt: Date;
}

export interface ContentWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'publish' | 'notify';
  assignedTo: string[];
  requiredApprovals: number;
  autoAdvance: boolean;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface ContentLibraryProps {
  content: ContentItem[];
  folders: ContentFolder[];
  workflows: ContentWorkflow[];
  currentUserId: string;
  onContentCreate: (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  onContentUpdate: (id: string, updates: Partial<ContentItem>) => void;
  onContentDelete: (id: string) => void;
  onContentDuplicate: (content: ContentItem) => void;
  onContentMove: (contentIds: string[], targetFolder: string | null) => void;
  onContentSchedule: (id: string, scheduledFor: Date) => void;
  onContentPublish: (id: string) => void;
  onContentArchive: (id: string) => void;
  onFolderCreate: (folder: Omit<ContentFolder, 'id' | 'createdAt'>) => void;
  onFolderUpdate: (id: string, updates: Partial<ContentFolder>) => void;
  onFolderDelete: (id: string) => void;
  onWorkflowCreate: (workflow: Omit<ContentWorkflow, 'id' | 'createdAt'>) => void;
  onWorkflowUpdate: (id: string, updates: Partial<ContentWorkflow>) => void;
  onWorkflowDelete: (id: string) => void;
  className?: string;
}

export function ContentLibrary({
  content,
  folders,
  workflows,
  currentUserId,
  onContentCreate,
  onContentUpdate,
  onContentDelete,
  onContentDuplicate,
  onContentMove,
  onContentSchedule,
  onContentPublish,
  onContentArchive,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowDelete,
  className = ""
}: ContentLibraryProps) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'status' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter and sort content
  const filteredContent = useMemo(() => {
    return content
      .filter(item => {
        const matchesFolder = item.parentFolder === currentFolder;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = selectedType === 'all' || item.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        
        return matchesFolder && matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'date':
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [content, currentFolder, searchQuery, selectedType, selectedStatus, sortBy, sortOrder]);

  // Get current folders
  const currentFolders = folders.filter(folder => folder.parentId === currentFolder);

  // Get breadcrumb path
  const getBreadcrumbPath = useCallback(() => {
    const path: ContentFolder[] = [];
    let folderId = currentFolder;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        path.unshift(folder);
        folderId = folder.parentId || null;
      } else {
        break;
      }
    }
    
    return path;
  }, [currentFolder, folders]);

  // Toggle content selection
  const toggleContentSelection = (contentId: string) => {
    setSelectedContent(prev => 
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  // Bulk operations
  const handleBulkMove = (targetFolder: string | null) => {
    onContentMove(selectedContent, targetFolder);
    setSelectedContent([]);
    setShowBulkActions(false);
  };

  const handleBulkPublish = () => {
    selectedContent.forEach(id => onContentPublish(id));
    setSelectedContent([]);
    setShowBulkActions(false);
  };

  const handleBulkArchive = () => {
    selectedContent.forEach(id => onContentArchive(id));
    setSelectedContent([]);
    setShowBulkActions(false);
  };

  // Get status color
  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type icon
  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'lesson':
        return FileText;
      case 'assignment':
        return Edit;
      case 'quiz':
        return CheckCircle;
      case 'discussion':
        return Users;
      case 'resource':
        return Archive;
      case 'announcement':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Library</h2>
          <p className="text-muted-foreground">
            Organize, manage, and publish your educational content
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowWorkflowManager(true)}
          >
            <Workflow className="w-4 h-4 mr-2" />
            Workflows
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowScheduler(true)}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          
          <Button onClick={() => onContentCreate({
            title: 'New Content',
            type: 'lesson',
            content: '',
            status: 'draft',
            category: 'general',
            tags: [],
            createdBy: currentUserId,
            parentFolder: currentFolder || undefined,
            dependencies: [],
            collaborators: [],
            isTemplate: false,
            metadata: {}
          })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder(null)}
          >
            <FolderTree className="w-4 h-4 mr-1" />
            Library
          </Button>
          
          {breadcrumbPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder(folder.id)}
                className={index === breadcrumbPath.length - 1 ? 'font-medium' : ''}
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                  <SelectItem value="discussion">Discussions</SelectItem>
                  <SelectItem value="resource">Resources</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid/List */}
      <div className="space-y-4">
        {/* Folders */}
        {currentFolders.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Folders</h3>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
              : "space-y-2"
            }>
              {currentFolders.map(folder => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  viewMode={viewMode}
                  onClick={() => setCurrentFolder(folder.id)}
                  onEdit={(updates) => onFolderUpdate(folder.id, updates)}
                  onDelete={() => onFolderDelete(folder.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Items */}
        {filteredContent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">
                Content ({filteredContent.length})
              </h3>
              
              {selectedContent.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(true)}
                >
                  {selectedContent.length} selected
                </Button>
              )}
            </div>
            
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-2"
            }>
              {filteredContent.map(item => (
                <ContentItem
                  key={item.id}
                  content={item}
                  viewMode={viewMode}
                  isSelected={selectedContent.includes(item.id)}
                  onSelect={() => toggleContentSelection(item.id)}
                  onEdit={(updates) => onContentUpdate(item.id, updates)}
                  onDelete={() => onContentDelete(item.id)}
                  onDuplicate={() => onContentDuplicate(item)}
                  onPublish={() => onContentPublish(item.id)}
                  onArchive={() => onContentArchive(item.id)}
                  getStatusColor={getStatusColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentFolders.length === 0 && filteredContent.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first content item to get started'
                }
              </p>
              <Button onClick={() => onContentCreate({
                title: 'New Content',
                type: 'lesson',
                content: '',
                status: 'draft',
                category: 'general',
                tags: [],
                createdBy: currentUserId,
                parentFolder: currentFolder || undefined,
                dependencies: [],
                collaborators: [],
                isTemplate: false,
                metadata: {}
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions Modal */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">
                Bulk Actions ({selectedContent.length} items)
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleBulkPublish}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Selected
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleBulkArchive}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBulkMove(null)}
                >
                  <Move className="w-4 h-4 mr-2" />
                  Move to Root
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Selected
                </Button>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Folder Item Component
interface FolderItemProps {
  folder: ContentFolder;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onEdit: (updates: Partial<ContentFolder>) => void;
  onDelete: () => void;
}

function FolderItem({ folder, viewMode, onClick, onEdit, onDelete }: FolderItemProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
        <FolderTree className="w-5 h-5 text-blue-500" />
        <div className="flex-1" onClick={onClick}>
          <div className="font-medium">{folder.name}</div>
          {folder.description && (
            <div className="text-sm text-muted-foreground">{folder.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {folder.isShared && <Share2 className="w-4 h-4 text-muted-foreground" />}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 text-center">
        <FolderTree className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <h4 className="font-medium text-sm truncate">{folder.name}</h4>
        {folder.isShared && (
          <Badge variant="outline" className="mt-1 text-xs">
            Shared
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Content Item Component
interface ContentItemProps {
  content: ContentItem;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (updates: Partial<ContentItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onArchive: () => void;
  getStatusColor: (status: ContentItem['status']) => string;
  getTypeIcon: (type: ContentItem['type']) => React.ComponentType<{ className?: string }>;
}

function ContentItem({
  content,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onArchive,
  getStatusColor,
  getTypeIcon
}: ContentItemProps) {
  const TypeIcon = getTypeIcon(content.type);

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 ${
        isSelected ? 'bg-primary/5 border-primary' : ''
      }`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded"
        />
        
        <TypeIcon className="w-5 h-5" />
        
        <div className="flex-1">
          <div className="font-medium">{content.title}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(content.updatedAt).toLocaleDateString()} • v{content.version}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${getStatusColor(content.status)}`}>
            {content.status}
          </Badge>
          
          <Badge variant="outline" className="text-xs capitalize">
            {content.type}
          </Badge>
          
          {content.scheduledFor && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
          )}
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded"
          />
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center mb-3">
          <TypeIcon className="w-8 h-8 mx-auto mb-2" />
          <h4 className="font-medium text-sm truncate">{content.title}</h4>
          <p className="text-xs text-muted-foreground">
            {new Date(content.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${getStatusColor(content.status)}`}>
              {content.status}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {content.type}
            </Badge>
          </div>
          
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {content.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{content.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {content.scheduledFor && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Scheduled for {new Date(content.scheduledFor).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}