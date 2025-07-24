'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { OptimizedImageProps, getOptimizedImageSrc, createIntersectionObserver } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface OptimizedImageComponentProps extends OptimizedImageProps {
  lazy?: boolean;
  placeholder?: string;
  blurDataURL?: string;
}

const OptimizedImageComponent: React.FC<OptimizedImageComponentProps> = memo(({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  lazy = true,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!lazy || priority || isInView) {
      // Load the optimized image
      const optimizedSrc = getOptimizedImageSrc(src);
      setImageSrc(optimizedSrc);
      return;
    }

    // Set up intersection observer for lazy loading
    observerRef.current = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current && observerRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    // Fallback to original image if WebP fails
    if (imageSrc.includes('.webp')) {
      setImageSrc(src);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  const imageStyle: React.CSSProperties = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  if (blurDataURL && !isLoaded) {
    imageStyle.backgroundImage = `url(${blurDataURL})`;
    imageStyle.backgroundSize = 'cover';
    imageStyle.backgroundPosition = 'center';
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? imageSrc : placeholder}
        alt={alt}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

OptimizedImageComponent.displayName = 'OptimizedImage';

export { OptimizedImageComponent as OptimizedImage };