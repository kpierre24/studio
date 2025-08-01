'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, X, Calendar, User, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export enum SearchType {
  ALL = 'all',
  COURSES = 'courses',
  ASSIGNMENTS = 'assignments',
  DISCUSSIONS = 'discussions',
  USERS = 'users',
}

export enum SearchFilter {
  TITLE = 'title',
  CONTENT = 'content',
  AUTHOR = 'author',
  TAGS = 'tags',
  DATE_RANGE = 'dateRange',
}

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  tags: string[];
  metadata: Record<string, any>;
  relevance: number;
}

interface AdvancedSearchProps {
  courseId?: string;
  onResultClick?: (result: SearchResult) => void;
}

export function AdvancedSearch({ courseId, onResultClick }: AdvancedSearchProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(SearchType.ALL);
  const [filters, setFilters] = useState<Record<SearchFilter, any>>({
    [SearchFilter.TITLE]: true,
    [SearchFilter.CONTENT]: true,
    [SearchFilter.AUTHOR]: false,
    [SearchFilter.TAGS]: true,
    [SearchFilter.DATE_RANGE]: null,
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock search function - in real app, this would call search APIs
  const performSearch = async (query: string, type: SearchType, activeFilters: Record<SearchFilter, any>) => {
    if (!query.trim()) return [];

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock search results based on type
      const mockResults: SearchResult[] = [];

      if (type === SearchType.ALL || type === SearchType.COURSES) {
        mockResults.push({
          id: 'course-1',
          type: SearchType.COURSES,
          title: 'Introduction to Web Development',
          content: 'Learn HTML, CSS, and JavaScript fundamentals with hands-on projects and exercises.',
          author: 'Dr. Sarah Johnson',
          createdAt: new Date('2024-01-15'),
          tags: ['web', 'javascript', 'html', 'css'],
          metadata: { students: 45, duration: '8 weeks' },
          relevance: 0.95,
        });
      }

      if (type === SearchType.ALL || type === SearchType.ASSIGNMENTS) {
        mockResults.push({
          id: 'assignment-1',
          type: SearchType.ASSIGNMENTS,
          title: 'Build a Responsive Landing Page',
          content: 'Create a fully responsive landing page using HTML, CSS, and JavaScript.',
          author: 'Dr. Sarah Johnson',
          createdAt: new Date('2024-01-20'),
          tags: ['assignment', 'responsive', 'html', 'css'],
          metadata: { dueDate: '2024-02-01', points: 100 },
          relevance: 0.88,
        });
      }

      if (type === SearchType.ALL || type === SearchType.DISCUSSIONS) {
        mockResults.push({
          id: 'discussion-1',
          type: SearchType.DISCUSSIONS,
          title: 'Best practices for responsive design',
          content: 'Let\'s discuss the best practices for creating responsive web designs...',
          author: 'Alex Chen',
          createdAt: new Date('2024-01-18'),
          tags: ['responsive', 'design', 'mobile-first'],
          metadata: { replies: 12, views: 156 },
          relevance: 0.82,
        });
      }

      if (type === SearchType.ALL || type === SearchType.USERS) {
        mockResults.push({
          id: 'user-1',
          type: SearchType.USERS,
          title: 'Alex Chen',
          content: 'Full-stack developer with 5 years of experience in React and Node.js',
          author: 'System',
          createdAt: new Date('2023-01-01'),
          tags: ['react', 'nodejs', 'full-stack'],
          metadata: { role: 'Student', courses: 8 },
          relevance: 0.75,
        });
      }

      // Filter results based on query
      const filtered = mockResults.filter(result => {
        const searchLower = query.toLowerCase();
        
        if (activeFilters[SearchFilter.TITLE] && result.title.toLowerCase().includes(searchLower)) return true;
        if (activeFilters[SearchFilter.CONTENT] && result.content.toLowerCase().includes(searchLower)) return true;
        if (activeFilters[SearchFilter.AUTHOR] && result.author.toLowerCase().includes(searchLower)) return true;
        if (activeFilters[SearchFilter.TAGS] && result.tags.some(tag => tag.toLowerCase().includes(searchLower))) return true;
        
        return false;
      });

      // Sort by relevance
      return filtered.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      toast.error('Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, searchType, filters).then(setResults);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType, filters]);

  const getIcon = (type: SearchType) => {
    switch (type) {
      case SearchType.COURSES: return <BookOpen className="w-4 h-4" />;
      case SearchType.ASSIGNMENTS: return <FileText className="w-4 h-4" />;
      case SearchType.DISCUSSIONS: return <MessageSquare className="w-4 h-4" />;
      case SearchType.USERS: return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchType) => {
    switch (type) {
      case SearchType.COURSES: return 'bg-blue-100 text-blue-800';
      case SearchType.ASSIGNMENTS: return 'bg-purple-100 text-purple-800';
      case SearchType.DISCUSSIONS: return 'bg-green-100 text-green-800';
      case SearchType.USERS: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedResults = useMemo(() => {
    const groups: Record<SearchType, SearchResult[]> = {
      [SearchType.COURSES]: [],
      [SearchType.ASSIGNMENTS]: [],
      [SearchType.DISCUSSIONS]: [],
      [SearchType.USERS]: [],
      [SearchType.ALL]: [],
    };

    results.forEach(result => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Search</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses, assignments, discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Select value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SearchType.ALL}>All</SelectItem>
                <SelectItem value={SearchType.COURSES}>Courses</SelectItem>
                <SelectItem value={SearchType.ASSIGNMENTS}>Assignments</SelectItem>
                <SelectItem value={SearchType.DISCUSSIONS}>Discussions</SelectItem>
                <SelectItem value={SearchType.USERS}>Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search in:</label>
                <div className="space-y-1">
                  {Object.entries({
                    [SearchFilter.TITLE]: 'Title',
                    [SearchFilter.CONTENT]: 'Content',
                    [SearchFilter.AUTHOR]: 'Author',
                    [SearchFilter.TAGS]: 'Tags',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters[key as SearchFilter]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && !loading && (
        <Tabs value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value={SearchType.ALL}>All ({results.length})</TabsTrigger>
            <TabsTrigger value={SearchType.COURSES}>Courses ({groupedResults[SearchType.COURSES].length})</TabsTrigger>
            <TabsTrigger value={SearchType.ASSIGNMENTS}>Assignments ({groupedResults[SearchType.ASSIGNMENTS].length})</TabsTrigger>
            <TabsTrigger value={SearchType.DISCUSSIONS}>Discussions ({groupedResults[SearchType.DISCUSSIONS].length})</TabsTrigger>
            <TabsTrigger value={SearchType.USERS}>Users ({groupedResults[SearchType.USERS].length})</TabsTrigger>
          </TabsList>

          <TabsContent value={searchType}>
            {results.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No results found for "{searchQuery}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card 
                    key={result.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onResultClick?.(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(result.type)}`}>
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{result.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {result.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {result.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}