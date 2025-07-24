/**
 * Performance optimization utilities and React.memo implementations
 */

import React from 'react';
import { shallowEqual } from './performance';

// Higher-order component for React.memo with custom comparison
export function withMemoization<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, areEqual || shallowEqual);
}

// Memoized components for expensive operations
export const MemoizedComponents = {
  // Memoized list item to prevent unnecessary re-renders
  ListItem: React.memo<{
    item: any;
    index: number;
    isSelected?: boolean;
    onClick?: (item: any, index: number) => void;
    children: React.ReactNode;
  }>(({ item, index, isSelected, onClick, children }) => {
    const handleClick = React.useCallback(() => {
      onClick?.(item, index);
    }, [item, index, onClick]);

    return (
      <div
        className={`cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={handleClick}
      >
        {children}
      </div>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onClick === nextProps.onClick
    );
  }),

  // Memoized card component
  Card: React.memo<{
    title: string;
    description?: string;
    image?: string;
    actions?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }>(({ title, description, image, actions, onClick, className }) => {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className || ''}`}
        onClick={onClick}
      >
        {image && (
          <div className="aspect-video bg-gray-100">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm mb-3">{description}</p>
          )}
          {actions && <div className="flex justify-end">{actions}</div>}
        </div>
      </div>
    );
  }),

  // Memoized data table row
  TableRow: React.memo<{
    data: Record<string, any>;
    columns: Array<{ key: string; render?: (value: any) => React.ReactNode }>;
    onRowClick?: (data: Record<string, any>) => void;
  }>(({ data, columns, onRowClick }) => {
    const handleClick = React.useCallback(() => {
      onRowClick?.(data);
    }, [data, onRowClick]);

    return (
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        {columns.map((column) => (
          <td key={column.key} className="px-4 py-2 border-b border-gray-200">
            {column.render ? column.render(data[column.key]) : data[column.key]}
          </td>
        ))}
      </tr>
    );
  }),
};

// Performance-optimized hooks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
}

export const useOptimizedMemo = function<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return React.useMemo(factory, deps);
};

// Debounced state hook
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [value, debouncedValue, setValue];
}

// Optimized event handlers
export function createOptimizedEventHandler<T extends Event>(
  handler: (event: T) => void,
  options?: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    throttle?: number;
    debounce?: number;
  }
) {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;

  return (event: T) => {
    if (options?.preventDefault) {
      event.preventDefault();
    }
    if (options?.stopPropagation) {
      event.stopPropagation();
    }

    if (options?.throttle) {
      const now = Date.now();
      if (now - lastCallTime < options.throttle) {
        return;
      }
      lastCallTime = now;
    }

    if (options?.debounce) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(event), options.debounce);
    } else {
      handler(event);
    }
  };
};

// Bundle splitting utilities
export function loadComponentAsync<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

// Performance monitoring for components
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const renderStartTime = React.useRef<number>();
    
    // Track render start
    renderStartTime.current = performance.now();

    React.useEffect(() => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎨 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
      }
    });

    return <Component {...props} />;
  });
}

// Optimized list rendering
export function useVirtualizedRendering<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
) {
  return React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + Math.ceil(containerHeight / itemHeight)
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, containerHeight, itemHeight, scrollTop]);
}

// Image loading optimization
export const useImagePreloader = (imageSources: string[]) => {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    // Preload images with a small delay to not block initial render
    const timeoutId = setTimeout(() => {
      imageSources.forEach(src => {
        if (!loadedImages.has(src)) {
          preloadImage(src).catch(console.error);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [imageSources, loadedImages]);

  return loadedImages;
};

// Memory leak prevention
export const useCleanupEffect = (cleanup: () => void, deps: React.DependencyList) => {
  React.useEffect(() => {
    return cleanup;
  }, deps);
};

// Optimized form handling
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: (values: T) => Record<string, string>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const setValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name]: undefined as any }));
    }
  }, [errors]);

  const setFieldTouched = React.useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = React.useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = validationSchema(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
};