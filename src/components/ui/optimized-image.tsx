/**
 * Optimized Image Component with WebP support, lazy loading, and performance monitoring
 */

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useIntersectionObserver, PerformanceTracker } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
}

export const OptimizedImage = React.memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  onLoad,
  onError,
  lazy = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
        Loading...
      </text>
    </svg>`
  ).toString('base64')}`;

  const handleLoad = () => {
    PerformanceTracker.end(`image-load-${src}`);
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Start performance tracking when component mounts
  React.useEffect(() => {
    if (!lazy || isInView) {
      PerformanceTracker.start(`image-load-${src}`);
    }
  }, [src, lazy, isInView]);

  // Don't render image until it's in view (if lazy loading is enabled)
  const shouldRender = !lazy || isInView || priority;

  if (hasError) {
    return (
      <div
        ref={imageRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imageRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'animate-pulse bg-gray-200',
        className
      )}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    >
      {shouldRender && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          sizes={sizes || `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill && `object-${objectFit}`
          )}
          style={!fill ? { objectFit } : undefined}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && shouldRender && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Preset configurations for common use cases
export const AvatarImage = React.memo<Omit<OptimizedImageProps, 'width' | 'height' | 'objectFit'> & { size?: number }>(
  ({ size = 40, ...props }) => (
    <OptimizedImage
      width={size}
      height={size}
      objectFit="cover"
      className="rounded-full"
      {...props}
    />
  )
);

export const CardImage = React.memo<Omit<OptimizedImageProps, 'objectFit'>>(
  (props) => (
    <OptimizedImage
      objectFit="cover"
      className="rounded-lg"
      {...props}
    />
  )
);

export const HeroImage = React.memo<Omit<OptimizedImageProps, 'priority' | 'quality'>>(
  (props) => (
    <OptimizedImage
      priority={true}
      quality={85}
      {...props}
    />
  )
);