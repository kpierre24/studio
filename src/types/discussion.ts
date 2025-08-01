// Discussion Forum Types

export enum DiscussionCategory {
  GENERAL = 'general',
  ASSIGNMENTS = 'assignments',
  TECHNICAL = 'technical',
  ANNOUNCEMENTS = 'announcements',
  SOCIAL = 'social',
}

export enum DiscussionStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
  PINNED = 'pinned',
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: DiscussionCategory;
  status: DiscussionStatus;
  replyCount: number;
  viewCount: number;
  lastReplyAt?: Date;
  lastReplyBy?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentReplyId?: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

export interface DiscussionFilters {
  category?: DiscussionCategory;
  authorId?: string;
  tags?: string[];
  searchTerm?: string;
  sortBy?: 'newest' | 'oldest' | 'mostReplies' | 'mostViews' | 'lastReply';
}

export interface CreatePostRequest {
  courseId: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  tags: string[];
}

export interface CreateReplyRequest {
  postId: string;
  content: string;
  parentReplyId?: string;
}