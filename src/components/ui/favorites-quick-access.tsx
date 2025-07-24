"use client";

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen, FileText, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteItem } from '@/components/ui/favorites-manager';
import { cn } from '@/lib/utils';

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
      return 'text-blue-600 dark:text-blue-400';
    case 'lesson':
      return 'text-green-600 dark:text-green-400';
    case 'assignment':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export interface FavoritesQuickAccessProps {
  maxItems?: number;
  showBadge?: boolean;
}

export function FavoritesQuickAccess({ 
  maxItems = 8,
  showBadge = true 
}: FavoritesQuickAccessProps) {
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Star className="h-5 w-5" />
      </Button>
    );
  }

  const recentFavorites = favorites
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, maxItems);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Star className="h-5 w-5" />
          {showBadge && favorites.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {favorites.length > 99 ? '99+' : favorites.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Favorites</span>
          {favorites.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {favorites.length}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {favorites.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No favorites yet</p>
            <p className="text-xs mt-1">Star items to add them here</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              {recentFavorites.map((favorite) => {
                const Icon = getIconForType(favorite.type);
                
                return (
                  <DropdownMenuItem key={favorite.id} asChild>
                    <Link
                      href={favorite.url}
                      className="flex items-start gap-3 p-2 cursor-pointer"
                    >
                      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", getColorForType(favorite.type))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {favorite.title}
                        </p>
                        {favorite.metadata?.courseName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {favorite.metadata.courseName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-xs">
                            {favorite.type}
                          </Badge>
                          {favorite.metadata?.dueDate && (
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              Due: {new Date(favorite.metadata.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </ScrollArea>
            
            {favorites.length > maxItems && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="text-center justify-center">
                    View All Favorites ({favorites.length})
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}