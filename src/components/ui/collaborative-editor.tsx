"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  Share2, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Settings,
  UserPlus,
  Crown,
  Edit3,
  Save,
  History,
  GitBranch,
  Merge,
  Bell,
  BellOff
} from 'lucide-react';
import { RichTextEditor } from './rich-text-editor';

// Types
export interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  color: string;
  isActive: boolean;
  lastSeen: Date;
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  position: number;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface DocumentVersion {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  changes: string;
  isAutoSave: boolean;
}

export interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  currentUser: CollaborativeUser;
  collaborators: CollaborativeUser[];
  comments: Comment[];
  versions: DocumentVersion[];
  onContentChange: (content: string) => void;
  onUserJoin: (user: CollaborativeUser) => void;
  onUserLeave: (userId: string) => void;
  onCommentAdd: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  onCommentResolve: (commentId: string) => void;
  onCommentReply: (commentId: string, reply: Omit<CommentReply, 'id' | 'createdAt'>) => void;
  onVersionSave: (version: Omit<DocumentVersion, 'id' | 'createdAt'>) => void;
  onPermissionChange: (userId: string, role: CollaborativeUser['role']) => void;
  onInviteUser: (email: string, role: CollaborativeUser['role']) => void;
  className?: string;
}

export function CollaborativeEditor({
  documentId,
  initialContent,
  currentUser,
  collaborators,
  comments,
  versions,
  onContentChange,
  onUserJoin,
  onUserLeave,
  onCommentAdd,
  onCommentResolve,
  onCommentReply,
  onVersionSave,
  onPermissionChange,
  onInviteUser,
  className = ""
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [showComments, setShowComments] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaborativeUser['role']>('editor');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const editorRef = useRef<any>(null);
  const lastSaveRef = useRef<Date>(new Date());

  // Handle content changes with conflict resolution
  const handleContentChange = useCallback((newContent: string) => {
    if (isLocked && currentUser.role !== 'owner') {
      return; // Prevent editing when locked
    }

    setContent(newContent);
    onContentChange(newContent);

    // Auto-save every 30 seconds
    const now = new Date();
    if (now.getTime() - lastSaveRef.current.getTime() > 30000) {
      onVersionSave({
        content: newContent,
        createdBy: currentUser.id,
        changes: 'Auto-save',
        isAutoSave: true
      });
      lastSaveRef.current = now;
    }
  }, [isLocked, currentUser, onContentChange, onVersionSave]);

  // Handle manual save
  const handleSave = () => {
    onVersionSave({
      content,
      createdBy: currentUser.id,
      changes: 'Manual save',
      isAutoSave: false
    });
    lastSaveRef.current = new Date();
  };

  // Add comment at current cursor position
  const handleAddComment = () => {
    if (!newComment.trim() || commentPosition === null) return;

    onCommentAdd({
      userId: currentUser.id,
      content: newComment.trim(),
      position: commentPosition,
      resolved: false
    });

    setNewComment('');
    setCommentPosition(null);
  };

  // Handle user invitation
  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    onInviteUser(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  // Get active collaborators (online in last 5 minutes)
  const activeCollaborators = collaborators.filter(user => 
    user.isActive || (new Date().getTime() - user.lastSeen.getTime()) < 300000
  );

  // Get unresolved comments
  const unresolvedComments = comments.filter(comment => !comment.resolved);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {activeCollaborators.slice(0, 5).map(user => (
                <div key={user.id} className="relative">
                  <Avatar className="w-8 h-8 border-2" style={{ borderColor: user.color }}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback style={{ backgroundColor: user.color + '20' }}>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
              ))}
              {activeCollaborators.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  +{activeCollaborators.length - 5}
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLocked(!isLocked)}
              disabled={currentUser.role !== 'owner'}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlocked
                </>
              )}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Comments ({unresolvedComments.length})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
              <History className="w-4 h-4 mr-2" />
              Versions
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <RichTextEditor

            value={content}
            onChange={handleContentChange}
            enableCollaboration={true}
            readOnly={isLocked && currentUser.role !== 'owner'}
            height={600}
            showWordCount={true}
            showReadingTime={true}
            onSave={async (content: string) => {
              handleSave();
              return Promise.resolve();
            }}
          />
        </div>

        {/* Comment Input */}
        {commentPosition !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t bg-muted/50"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCommentPosition(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(showComments || showVersions || showCollaborators) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l bg-muted/30 overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Tabs */}
              <div className="flex border-b">
                {showComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none"
                    onClick={() => {
                      setShowVersions(false);
                      setShowCollaborators(false);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comments
                  </Button>
                )}
                {showVersions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none"
                    onClick={() => {
                      setShowComments(false);
                      setShowCollaborators(false);
                    }}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Versions
                  </Button>
                )}
                {showCollaborators && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none"
                    onClick={() => {
                      setShowComments(false);
                      setShowVersions(false);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 p-4">
                {/* Comments Panel */}
                {showComments && !showVersions && !showCollaborators && (
                  <CommentsPanel
                    comments={comments}
                    users={collaborators}
                    currentUser={currentUser}
                    onResolve={onCommentResolve}
                    onReply={onCommentReply}
                    selectedComment={selectedComment}
                    onSelectComment={setSelectedComment}
                  />
                )}

                {/* Versions Panel */}
                {showVersions && !showComments && !showCollaborators && (
                  <VersionsPanel
                    versions={versions}
                    users={collaborators}
                    currentContent={content}
                    onRestore={(version) => {
                      setContent(version.content);
                      onContentChange(version.content);
                    }}
                  />
                )}

                {/* Collaborators Panel */}
                {showCollaborators && !showComments && !showVersions && (
                  <CollaboratorsPanel
                    collaborators={collaborators}
                    currentUser={currentUser}
                    onPermissionChange={onPermissionChange}
                    onInviteUser={handleInviteUser}
                    inviteEmail={inviteEmail}
                    setInviteEmail={setInviteEmail}
                    inviteRole={inviteRole}
                    setInviteRole={setInviteRole}
                  />
                )}
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Comments Panel Component
interface CommentsPanelProps {
  comments: Comment[];
  users: CollaborativeUser[];
  currentUser: CollaborativeUser;
  onResolve: (commentId: string) => void;
  onReply: (commentId: string, reply: Omit<CommentReply, 'id' | 'createdAt'>) => void;
  selectedComment: string | null;
  onSelectComment: (commentId: string | null) => void;
}

function CommentsPanel({
  comments,
  users,
  currentUser,
  onResolve,
  onReply,
  selectedComment,
  onSelectComment
}: CommentsPanelProps) {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;

    onReply(commentId, {
      userId: currentUser.id,
      content: replyText.trim()
    });

    setReplyText('');
    setReplyingTo(null);
  };

  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Comments</h3>
        <Badge variant="secondary">{unresolvedComments.length} active</Badge>
      </div>

      {/* Unresolved Comments */}
      {unresolvedComments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Active</h4>
          {unresolvedComments.map(comment => {
            const user = getUserById(comment.userId);
            return (
              <Card
                key={comment.id}
                className={`cursor-pointer transition-colors ${
                  selectedComment === comment.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectComment(comment.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-8 space-y-2 border-l-2 border-muted pl-3">
                      {comment.replies.map(reply => {
                        const replyUser = getUserById(reply.userId);
                        return (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={replyUser?.avatar} />
                              <AvatarFallback className="text-xs">
                                {replyUser?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{replyUser?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs mt-1">{reply.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === comment.id ? (
                    <div className="mt-3 space-y-2">
                      <Input
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(comment.id)}>
                          Reply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolve(comment.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolved Comments */}
      {resolvedComments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Resolved</h4>
          {resolvedComments.map(comment => {
            const user = getUserById(comment.userId);
            return (
              <Card key={comment.id} className="opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </div>
                      <p className="text-sm mt-1 line-through">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
        </div>
      )}
    </div>
  );
}

// Versions Panel Component
interface VersionsPanelProps {
  versions: DocumentVersion[];
  users: CollaborativeUser[];
  currentContent: string;
  onRestore: (version: DocumentVersion) => void;
}

function VersionsPanel({ versions, users, currentContent, onRestore }: VersionsPanelProps) {
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Version History</h3>
        <Badge variant="secondary">{versions.length} versions</Badge>
      </div>

      <div className="space-y-3">
        {sortedVersions.map((version, index) => {
          const user = getUserById(version.createdBy);
          const isLatest = index === 0;
          
          return (
            <Card key={version.id} className={isLatest ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user?.name}</span>
                        {isLatest && <Badge variant="secondary" className="text-xs">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {version.isAutoSave ? (
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">Manual</Badge>
                  )}
                </div>
                
                <p className="text-sm mb-3">{version.changes}</p>
                
                {!isLatest && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRestore(version)}
                    className="w-full"
                  >
                    <GitBranch className="w-3 h-3 mr-1" />
                    Restore This Version
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {versions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No versions saved yet</p>
        </div>
      )}
    </div>
  );
}

// Collaborators Panel Component
interface CollaboratorsPanelProps {
  collaborators: CollaborativeUser[];
  currentUser: CollaborativeUser;
  onPermissionChange: (userId: string, role: CollaborativeUser['role']) => void;
  onInviteUser: () => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: CollaborativeUser['role'];
  setInviteRole: (role: CollaborativeUser['role']) => void;
}

function CollaboratorsPanel({
  collaborators,
  currentUser,
  onPermissionChange,
  onInviteUser,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole
}: CollaboratorsPanelProps) {
  const canManagePermissions = currentUser.role === 'owner';

  const getRoleColor = (role: CollaborativeUser['role']) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'editor': return 'bg-blue-500';
      case 'commenter': return 'bg-green-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: CollaborativeUser['role']) => {
    switch (role) {
      case 'owner': return Crown;
      case 'editor': return Edit3;
      case 'commenter': return MessageCircle;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Team Members</h3>
        <Badge variant="secondary">{collaborators.length} members</Badge>
      </div>

      {/* Invite Section */}
      {canManagePermissions && (
        <Card>
          <CardContent className="p-3">
            <h4 className="text-sm font-medium mb-3">Invite Collaborator</h4>
            <div className="space-y-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CollaborativeUser['role'])}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
              <Button
                size="sm"
                onClick={onInviteUser}
                disabled={!inviteEmail.trim()}
                className="w-full"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Send Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborators List */}
      <div className="space-y-2">
        {collaborators.map(user => {
          const RoleIcon = getRoleIcon(user.role);
          const isOnline = user.isActive || (new Date().getTime() - user.lastSeen.getTime()) < 300000;
          
          return (
            <Card key={user.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      {user.id === currentUser.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isOnline ? 'Online' : `Last seen ${new Date(user.lastSeen).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getRoleColor(user.role)}`}>
                      <RoleIcon className="w-3 h-3 text-white" />
                    </div>
                    
                    {canManagePermissions && user.id !== currentUser.id && (
                      <select
                        value={user.role}
                        onChange={(e) => onPermissionChange(user.id, e.target.value as CollaborativeUser['role'])}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                        {currentUser.role === 'owner' && (
                          <option value="owner">Owner</option>
                        )}
                      </select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {collaborators.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No collaborators yet</p>
        </div>
      )}
    </div>
  );
}