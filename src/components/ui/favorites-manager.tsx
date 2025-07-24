"use client";

import React from 'react';
import Link from 'next/link';
import { Star, StarOff, BookOpen, FileText, GraduationCap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface FavoriteItem {
  id: string;
  type: 'course' | 'assignment' | 'lesson';
  title: string;
  url: string;
  addedAt: Date;
  metadata?: {
    courseName?: string;
    dueDate?: string;
    description?: string;
  };
}

export interface FavoritesManagerProps {
  favorites: FavoriteItem[];
  onAdd: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  onRemove: (id: string) => void;
  maxDisplay?: number;
  className?: string;
  showAddButton?: boolean;
}

const getIconForType = (type: FavoriteItem['type']) => {
  switch (type) {
    case 'course':
      return BookOpen;
    case 'lesson':
      return FileText;
    case 'assignment':
      return GraduationCap;
    default:
      return Star;
  }
};

const getColorForType = (type: FavoriteItem['type']) => {
  switch (type) {
    case 'course':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'lesson':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'assignment':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function FavoritesManager({
  favorites,
  onAdd,
  onRemove,
  maxDisplay = 10,
  className,
  showAddButton = false,
}: FavoritesManagerProps) {
  const displayedFavorites = favorites.slice(0, maxDisplay);
  const sortedFavorites = displayedFavorites.sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  if (favorites.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No favorites yet</p>
            <p className="text-xs mt-1">Star items to add them to your favorites</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Favorites
            <Badge variant="secondary" className="ml-2">
              {favorites.length}
            </Badge>
          </div>
          {showAddButton && (
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Add Favorite
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {sortedFavorites.map((favorite) => {
              const Icon = getIconForType(favorite.type);
              
              return (
                <div
                  key={favorite.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className={cn(
                    "p-2 rounded-md flex-shrink-0",
                    getColorForType(favorite.type)
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      href={favorite.url}
                      className="block hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                    >
                      <h4 className="font-medium text-sm truncate">
                        {favorite.title}
                      </h4>
                      {favorite.metadata?.courseName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {favorite.metadata.courseName}
                        </p>
                      )}
                      {favorite.metadata?.dueDate && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Due: {new Date(favorite.metadata.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {favorite.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(favorite.addedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(favorite.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Remove from favorites
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {favorites.length > maxDisplay && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Favorites ({favorites.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Favorite button component for adding/removing favorites
export interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'addedAt'>;
  isFavorited: boolean;
  onToggle: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function FavoriteButton({
  item,
  isFavorited,
  onToggle,
  size = 'md',
  variant = 'ghost',
  showLabel = false,
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={showLabel ? 'sm' : 'icon'}
            onClick={() => onToggle(item)}
            className={cn(
              !showLabel && sizeClasses[size],
              isFavorited && "text-yellow-500 hover:text-yellow-600"
            )}
          >
            {isFavorited ? (
              <Star className={cn(iconSizes[size], "fill-current")} />
            ) : (
              <StarOff className={iconSizes[size]} />
            )}
            {showLabel && (
              <span className="ml-2">
                {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}