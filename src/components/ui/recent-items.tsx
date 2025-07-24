"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, FileText, GraduationCap, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecentItem, useRecentItems } from '@/hooks/useRecentItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentItemsProps {
  maxItems?: number;
  showHeader?: boolean;
  showClearAll?: boolean;
  showRemoveButtons?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

const typeIcons = {
  course: BookOpen,
  assignment: FileText,
  lesson: GraduationCap,
  user: User,
};

const typeColors = {
  course: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  assignment: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  lesson: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  user: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

function RecentItemCard({ 
  item, 
  onRemove, 
  showRemoveButton = false, 
  variant = 'default' 
}: { 
  item: RecentItem; 
  onRemove?: (id: string) => void; 
  showRemoveButton?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}) {
  const Icon = typeIcons[item.type];
  
  const content = (
    <div className={cn(
      "group relative flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
      variant === 'compact' && "p-2",
      variant === 'minimal' && "p-1"
    )}>
      <div className={cn(
        "flex-shrink-0 p-2 rounded-md",
        typeColors[item.type],
        variant === 'compact' && "p-1.5",
        variant === 'minimal' && "p-1"
      )}>
        <Icon className={cn(
          "h-4 w-4",
          variant === 'compact' && "h-3 w-3",
          variant === 'minimal' && "h-3 w-3"
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-medium text-sm truncate",
            variant === 'compact' && "text-xs",
            variant === 'minimal' && "text-xs"
          )}>
            {item.title}
          </h4>
          <Badge variant="secondary" className={cn(
            "text-xs capitalize",
            variant === 'compact' && "text-[10px] px-1 py-0",
            variant === 'minimal' && "hidden"
          )}>
            {item.type}
          </Badge>
        </div>
        
        {variant !== 'minimal' && (
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-xs text-muted-foreground",
              variant === 'compact' && "text-[10px]"
            )}>
              {formatTimeAgo(item.accessedAt)}
            </span>
            {item.metadata?.courseName && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className={cn(
                  "text-xs text-muted-foreground truncate",
                  variant === 'compact' && "text-[10px]"
                )}>
                  {item.metadata.courseName}
                </span>
              </>
            )}
          </div>
        )}
        
        {variant === 'default' && item.metadata?.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {item.metadata.description}
          </p>
        )}
      </div>
      
      {showRemoveButton && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={item.url} className="block">
        {content}
      </Link>
    </motion.div>
  );
}

export function RecentItems({
  maxItems = 10,
  showHeader = true,
  showClearAll = true,
  showRemoveButtons = false,
  className,
  variant = 'default',
}: RecentItemsProps) {
  const { recentItems, isLoading, removeRecentItem, clearAllRecentItems } = useRecentItems();
  
  const displayItems = maxItems ? recentItems.slice(0, maxItems) : recentItems;
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-md animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (displayItems.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {showHeader && (
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Recent Items</h3>
            </div>
          )}
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent items yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Items you visit will appear here for quick access
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardContent className={cn(
        "p-4",
        variant === 'compact' && "p-3",
        variant === 'minimal' && "p-2"
      )}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Recent Items</h3>
              <Badge variant="secondary" className="text-xs">
                {displayItems.length}
              </Badge>
            </div>
            {showClearAll && displayItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllRecentItems}
                className="text-xs h-6"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
        
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => (
              <RecentItemCard
                key={item.id}
                item={item}
                onRemove={showRemoveButtons ? removeRecentItem : undefined}
                showRemoveButton={showRemoveButtons}
                variant={variant}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {recentItems.length > maxItems && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Showing {maxItems} of {recentItems.length} recent items
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick access menu component for navigation bars
export function RecentItemsQuickAccess({ 
  maxItems = 5,
  className 
}: { 
  maxItems?: number;
  className?: string;
}) {
  const { recentItems, isLoading } = useRecentItems();
  
  if (isLoading || recentItems.length === 0) {
    return null;
  }
  
  const displayItems = recentItems.slice(0, maxItems);
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="px-2 py-1.5">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Recent</span>
        </div>
      </div>
      {displayItems.map((item) => {
        const Icon = typeIcons[item.type];
        return (
          <Link
            key={item.id}
            href={item.url}
            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted/50 transition-colors"
          >
            <div className={cn("p-1 rounded-sm", typeColors[item.type])}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="truncate flex-1">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(item.accessedAt)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default RecentItems;