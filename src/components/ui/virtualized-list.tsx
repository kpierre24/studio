'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { throttle } from '@/lib/performance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

function VirtualizedListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Throttled scroll handler for performance
  const handleScroll = useCallback(
    throttle((event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }, 16), // ~60fps
    [onScroll]
  );

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
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
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                position: 'relative',
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as <T>(
  props: VirtualizedListProps<T>
) => JSX.Element;

// Virtualized table component for data tables
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

function VirtualizedTableComponent<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 50,
  containerHeight,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const renderRow = useCallback(
    (item: T, index: number) => (
      <div
        className={`flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          onRowClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={String(column.key)}
            className="flex items-center px-4 py-2 text-sm"
            style={{
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.width || 100,
            }}
          >
            {column.render
              ? column.render(item[column.key], item, index)
              : String(item[column.key] || '')}
          </div>
        ))}
      </div>
    ),
    [columns, onRowClick]
  );

  return (
    <div className={className}>
      {/* Table header */}
      <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {columns.map((column) => (
          <div
            key={String(column.key)}
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
            style={{
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.width || 100,
            }}
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
        className="bg-white dark:bg-gray-900"
      />
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableComponent) as <T extends Record<string, any>>(
  props: VirtualizedTableProps<T>
) => JSX.Element;