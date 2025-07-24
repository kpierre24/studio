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
import { 
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  Share2,
  Star,
  StarOff,
  Eye,
  Search,
  Filter,
  Upload,
  Plus,
  Edit,
  Trash2,
  Copy,
  Move,
  Tag,
  Users,
  Clock,
  TrendingUp,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Folder,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Settings,
  Lock,
  Unlock,
  Globe,
  Building
} from 'lucide-react';

// Types
export interface ResourceFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  category: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  viewCount: number;
  isFavorite: boolean;
  isShared: boolean;
  permissions: ResourcePermission[];
  version: number;
  parentFolder?: string;
}

export interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdBy: string;
  createdAt: Date;
  isShared: boolean;
  permissions: ResourcePermission[];
  color?: string;
}

export interface ResourcePermission {
  userId: string;
  userName: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedBy: string;
  grantedAt: Date;
}

export interface ResourceCollection {
  id: string;
  name: string;
  description: string;
  resources: string[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface ResourceLibraryProps {
  resources: ResourceFile[];
  folders: ResourceFolder[];
  collections: ResourceCollection[];
  currentUserId: string;
  onResourceUpload: (file: File, metadata: Partial<ResourceFile>) => Promise<void>;
  onResourceUpdate: (id: string, updates: Partial<ResourceFile>) => void;
  onResourceDelete: (id: string) => void;
  onResourceDownload: (resource: ResourceFile) => void;
  onResourceShare: (resource: ResourceFile, permissions: ResourcePermission[]) => void;
  onFolderCreate: (folder: Omit<ResourceFolder, 'id' | 'createdAt'>) => void;
  onFolderUpdate: (id: string, updates: Partial<ResourceFolder>) => void;
  onFolderDelete: (id: string) => void;
  onCollectionCreate: (collection: Omit<ResourceCollection, 'id' | 'createdAt'>) => void;
  onCollectionUpdate: (id: string, updates: Partial<ResourceCollection>) => void;
  onCollectionDelete: (id: string) => void;
  className?: string;
}

export function ResourceLibrary({
  resources,
  folders,
  collections,
  currentUserId,
  onResourceUpload,
  onResourceUpdate,
  onResourceDelete,
  onResourceDownload,
  onResourceShare,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  className = ""
}: ResourceLibraryProps) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showSharedOnly, setShowSharedOnly] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter(resource => {
        const matchesFolder = resource.parentFolder === currentFolder;
        const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        const matchesType = selectedType === 'all' || resource.type === selectedType;
        const matchesFavorites = !showFavoritesOnly || resource.isFavorite;
        const matchesShared = !showSharedOnly || resource.isShared;
        
        return matchesFolder && matchesSearch && matchesCategory && matchesType && matchesFavorites && matchesShared;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'downloads':
            comparison = a.downloadCount - b.downloadCount;
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [resources, currentFolder, searchQuery, selectedCategory, selectedType, sortBy, sortOrder, showFavoritesOnly, showSharedOnly]);

  // Filter folders for current directory
  const currentFolders = folders.filter(folder => folder.parentId === currentFolder);

  // Get folder breadcrumb path
  const getBreadcrumbPath = useCallback(() => {
    const path: ResourceFolder[] = [];
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

  // Get file type icon
  const getFileIcon = (type: ResourceFile['type']) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'image':
        return FileImage;
      case 'video':
        return FileVideo;
      case 'audio':
        return FileAudio;
      default:
        return File;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Toggle resource selection
  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Toggle favorite
  const toggleFavorite = (resource: ResourceFile) => {
    onResourceUpdate(resource.id, { isFavorite: !resource.isFavorite });
  };

  // Handle resource download
  const handleDownload = (resource: ResourceFile) => {
    onResourceDownload(resource);
    onResourceUpdate(resource.id, { downloadCount: resource.downloadCount + 1 });
  };

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Library</h2>
          <p className="text-muted-foreground">
            Manage and share educational resources across courses
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateCollection(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Collection
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(true)}
          >
            <Folder className="w-4 h-4 mr-2" />
            Folder
          </Button>
          
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
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
            <FolderOpen className="w-4 h-4 mr-1" />
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
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
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
              
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className="w-4 h-4" />
              </Button>
              
              <Button
                variant={showSharedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSharedOnly(!showSharedOnly)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Grid/List */}
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

        {/* Resources */}
        {filteredResources.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">
              Resources ({filteredResources.length})
            </h3>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "space-y-2"
            }>
              {filteredResources.map(resource => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  viewMode={viewMode}
                  isSelected={selectedResources.includes(resource.id)}
                  onSelect={() => toggleResourceSelection(resource.id)}
                  onFavorite={() => toggleFavorite(resource)}
                  onDownload={() => handleDownload(resource)}
                  onEdit={(updates) => onResourceUpdate(resource.id, updates)}
                  onDelete={() => onResourceDelete(resource.id)}
                  onShare={(permissions) => onResourceShare(resource, permissions)}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentFolders.length === 0 && filteredResources.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Upload your first resource to get started'
                }
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resource
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Collections</CardTitle>
            <CardDescription>
              Curated collections of related resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map(collection => (
                <CollectionItem
                  key={collection.id}
                  collection={collection}
                  resourceCount={collection.resources.length}
                  onEdit={(updates) => onCollectionUpdate(collection.id, updates)}
                  onDelete={() => onCollectionDelete(collection.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedResources.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedResources.length} selected
            </span>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" size="sm">
                <Move className="w-4 h-4 mr-2" />
                Move
              </Button>
              
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedResources([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Folder Item Component
interface FolderItemProps {
  folder: ResourceFolder;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onEdit: (updates: Partial<ResourceFolder>) => void;
  onDelete: () => void;
}

function FolderItem({ folder, viewMode, onClick, onEdit, onDelete }: FolderItemProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
        <FolderOpen className="w-5 h-5 text-blue-500" />
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
        <FolderOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
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

// Resource Item Component
interface ResourceItemProps {
  resource: ResourceFile;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onFavorite: () => void;
  onDownload: () => void;
  onEdit: (updates: Partial<ResourceFile>) => void;
  onDelete: () => void;
  onShare: (permissions: ResourcePermission[]) => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (type: ResourceFile['type']) => React.ComponentType<{ className?: string }>;
}

function ResourceItem({
  resource,
  viewMode,
  isSelected,
  onSelect,
  onFavorite,
  onDownload,
  onEdit,
  onDelete,
  onShare,
  formatFileSize,
  getFileIcon
}: ResourceItemProps) {
  const FileIcon = getFileIcon(resource.type);

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
        
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          {resource.thumbnailUrl ? (
            <img
              src={resource.thumbnailUrl}
              alt={resource.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <FileIcon className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="font-medium">{resource.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatFileSize(resource.size)} • {new Date(resource.updatedAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {resource.downloadCount} downloads
          </Badge>
          
          {resource.isFavorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
          {resource.isShared && <Share2 className="w-4 h-4 text-muted-foreground" />}
          
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
          
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onFavorite}
          >
            {resource.isFavorite ? (
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="text-center mb-3">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
            {resource.thumbnailUrl ? (
              <img
                src={resource.thumbnailUrl}
                alt={resource.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <FileIcon className="w-8 h-8" />
            )}
          </div>
          
          <h4 className="font-medium text-sm truncate">{resource.name}</h4>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(resource.size)}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {resource.isShared && (
              <Badge variant="outline" className="text-xs">
                Shared
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="w-3 h-3" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Collection Item Component
interface CollectionItemProps {
  collection: ResourceCollection;
  resourceCount: number;
  onEdit: (updates: Partial<ResourceCollection>) => void;
  onDelete: () => void;
}

function CollectionItem({ collection, resourceCount, onEdit, onDelete }: CollectionItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium">{collection.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {collection.description}
            </p>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {resourceCount} resources
            </Badge>
            
            {collection.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {new Date(collection.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {collection.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {collection.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{collection.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}