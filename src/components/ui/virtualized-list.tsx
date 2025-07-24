/**
 * Virtualized List Component for handling large datasets efficiently
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useThrottle, PerformanceTracker } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent,
  keyExtractor = (_, index) => index,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    PerformanceTracker.start('virtualized-list-slice');
    const result = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    PerformanceTracker.end('virtualized-list-slice');
    return result;
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Throttled scroll handler
  const handleScroll = useThrottle(
    useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }, [onScroll]),
    16 // ~60fps
  );

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height: containerHeight }}>
        {loadingComponent || (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={keyExtractor(item, actualIndex)}
                style={{ height: itemHeight }}
                className="flex-shrink-0"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Specialized virtualized components
interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number;
    render?: (value: any, item: T, index: number) => React.ReactNode;
  }>;
  rowHeight?: number;
  containerHeight: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 50,
  containerHeight,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const renderRow = useCallback((item: T, index: number) => (
    <div
      className={cn(
        'flex items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer',
        className
      )}
      onClick={() => onRowClick?.(item, index)}
    >
      {columns.map((column, colIndex) => (
        <div
          key={String(column.key)}
          className="px-4 py-2 flex-shrink-0"
          style={{ width: column.width || `${100 / columns.length}%` }}
        >
          {column.render
            ? column.render(item[column.key], item, index)
            : String(item[column.key] || '')
          }
        </div>
      ))}
    </div>
  ), [columns, className, onRowClick]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {columns.map((column) => (
          <div
            key={String(column.key)}
            className="px-4 py-3 font-medium text-gray-900 flex-shrink-0"
            style={{ width: column.width || `${100 / columns.length}%` }}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Virtualized rows */}
      <VirtualizedList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight - 50} // Subtract header height
        renderItem={renderRow}
        keyExtractor={(item, index) => `row-${index}`}
      />
    </div>
  );
}

// Grid virtualization for card layouts
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 16,
  renderItem,
  className,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate grid dimensions
  const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemHeight + gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + 1
    );

    return { startRow, endRow };
  }, [scrollTop, rowHeight, containerHeight, totalRows]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.startRow * itemsPerRow;
    const endIndex = Math.min(items.length - 1, (visibleRange.endRow + 1) * itemsPerRow - 1);
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, visibleRange.startRow, visibleRange.endRow, itemsPerRow]);

  const handleScroll = useThrottle(
    useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []),
    16
  );

  const totalHeight = totalRows * rowHeight;
  const offsetY = visibleRange.startRow * rowHeight;

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow}, ${itemWidth}px)`,
              gap: `${gap}px`,
              justifyContent: 'start',
            }}
          >
            {visibleItems.map(({ item, index }) => (
              <div key={index} style={{ width: itemWidth, height: itemHeight }}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}