"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronRight, Search, Filter, SortAsc, SortDesc, 
  MoreVertical, Eye, Edit, Trash2, Download, Share2, ArrowLeft, ArrowRight,
  X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader } from "./card";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./dropdown-menu";

// Types
interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  priority?: 'high' | 'medium' | 'low'; // For responsive hiding
}

interface MobileTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive';
  }>;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  cardView?: boolean; // Force card view even on desktop
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function MobileTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  filterable = false,
  selectable = false,
  actions = [],
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className,
  cardView = false
}: MobileTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllRows = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map((_, index) => index)));
    }
  };

  // Get priority columns for mobile view
  const highPriorityColumns = columns.filter(col => col.priority === 'high' || !col.priority);
  const lowPriorityColumns = columns.filter(col => col.priority === 'low' || col.priority === 'medium');

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="flex gap-2">
            <div className="h-10 bg-muted animate-pulse rounded-md flex-1" />
            {filterable && <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />}
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      {(searchable || filterable) && (
        <div className="flex gap-2">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={cn("hidden lg:block overflow-x-auto", cardView && "lg:hidden")}>
        <div className="min-w-full">
          <div className="bg-muted/50 rounded-t-lg p-4">
            <div className="flex items-center gap-4">
              {selectable && (
                <Checkbox
                  checked={selectedRows.size === processedData.length && processedData.length > 0}
                  onCheckedChange={selectAllRows}
                />
              )}
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    "flex items-center gap-2 font-medium text-sm",
                    column.width || "flex-1",
                    column.sortable && "cursor-pointer hover:text-foreground"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && (
                    <div className="flex flex-col">
                      <SortAsc className={cn(
                        "h-3 w-3",
                        sortConfig?.key === column.key && sortConfig.direction === 'asc'
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )} />
                      <SortDesc className={cn(
                        "h-3 w-3 -mt-1",
                        sortConfig?.key === column.key && sortConfig.direction === 'desc'
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )} />
                    </div>
                  )}
                </div>
              ))}
              {actions.length > 0 && (
                <div className="w-12 text-center text-sm font-medium">Actions</div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <AnimatePresence>
              {processedData.map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-background border rounded-lg hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer",
                    selectedRows.has(index) && "bg-muted"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <Checkbox
                      checked={selectedRows.has(index)}
                      onCheckedChange={() => toggleRowSelection(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={cn("text-sm", column.width || "flex-1")}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </div>
                  ))}
                  {actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={cn(
                              action.variant === 'destructive' && "text-destructive focus:text-destructive"
                            )}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className={cn("lg:hidden space-y-3", cardView && "lg:block")}>
        <AnimatePresence>
          {processedData.map((row, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className={cn(
                "transition-all duration-200",
                onRowClick && "cursor-pointer hover:shadow-md",
                selectedRows.has(index) && "ring-2 ring-primary"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectable && (
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onCheckedChange={() => toggleRowSelection(index)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1">
                        {highPriorityColumns.slice(0, 2).map((column) => (
                          <div key={column.key} className="text-sm">
                            <span className="font-medium">
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lowPriorityColumns.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(index);
                          }}
                        >
                          {expandedRows.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {actions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  action.variant === 'destructive' && "text-destructive focus:text-destructive"
                                )}
                              >
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {expandedRows.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0 space-y-2">
                        {lowPriorityColumns.map((column) => (
                          <div key={column.key} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{column.label}:</span>
                            <span>
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>

                {onRowClick && (
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onRowClick(row)}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {processedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">{emptyMessage}</div>
        </div>
      )}

      {/* Selection Summary */}
      {selectable && selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedRows.size} of {processedData.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRows(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}