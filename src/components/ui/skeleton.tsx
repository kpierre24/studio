import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { pulseVariants } from "@/lib/animations"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
}

function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  const Component = animate ? motion.div : 'div'
  
  return (
    <Component
      className={cn("rounded-md bg-muted", className)}
      variants={animate ? pulseVariants : undefined}
      animate={animate ? "animate" : undefined}
      {...(props as any)}
    />
  )
}

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'table' | 'dashboard' | 'course' | 'assignment' | 'custom'
  count?: number
  customTemplate?: React.ReactNode
  animate?: boolean
  className?: string
}

function SkeletonLoader({
  variant,
  count = 1,
  customTemplate,
  animate = true,
  className
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" animate={animate} />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" animate={animate} />
                <Skeleton className="h-3 w-1/2" animate={animate} />
              </div>
            </div>
            <Skeleton className="h-32 w-full" animate={animate} />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" animate={animate} />
              <Skeleton className="h-3 w-4/5" animate={animate} />
              <Skeleton className="h-3 w-3/5" animate={animate} />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="h-8 w-8 rounded-full" animate={animate} />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" animate={animate} />
                  <Skeleton className="h-3 w-1/2" animate={animate} />
                </div>
                <Skeleton className="h-6 w-16" animate={animate} />
              </div>
            ))}
          </div>
        )
      
      case 'table':
        return (
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 p-3 border-b">
              <Skeleton className="h-4 w-full" animate={animate} />
              <Skeleton className="h-4 w-full" animate={animate} />
              <Skeleton className="h-4 w-full" animate={animate} />
              <Skeleton className="h-4 w-full" animate={animate} />
            </div>
            {/* Table rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-3">
                <Skeleton className="h-4 w-full" animate={animate} />
                <Skeleton className="h-4 w-3/4" animate={animate} />
                <Skeleton className="h-4 w-1/2" animate={animate} />
                <Skeleton className="h-6 w-16" animate={animate} />
              </div>
            ))}
          </div>
        )
      
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count || 6}).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" animate={animate} />
                  <Skeleton className="h-8 w-8 rounded" animate={animate} />
                </div>
                <Skeleton className="h-12 w-20" animate={animate} />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" animate={animate} />
                  <Skeleton className="h-3 w-2/3" animate={animate} />
                </div>
                <Skeleton className="h-24 w-full" animate={animate} />
              </div>
            ))}
          </div>
        )
      
      case 'course':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" animate={animate} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" animate={animate} />
                    <Skeleton className="h-4 w-1/2" animate={animate} />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-3 w-16" animate={animate} />
                      <Skeleton className="h-3 w-20" animate={animate} />
                      <Skeleton className="h-3 w-12" animate={animate} />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" animate={animate} />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" animate={animate} />
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-3 w-16" animate={animate} />
                    <Skeleton className="h-3 w-12" animate={animate} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'assignment':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded" animate={animate} />
                    <Skeleton className="h-5 w-48" animate={animate} />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" animate={animate} />
                </div>
                <Skeleton className="h-4 w-full" animate={animate} />
                <Skeleton className="h-4 w-2/3" animate={animate} />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-20" animate={animate} />
                    <Skeleton className="h-4 w-16" animate={animate} />
                  </div>
                  <Skeleton className="h-8 w-24" animate={animate} />
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'custom':
        return customTemplate
      
      default:
        return <Skeleton className="h-4 w-full" animate={animate} />
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {renderSkeleton()}
    </div>
  )
}

// Progressive loading wrapper component
interface ProgressiveSkeletonProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  delay?: number
}

function ProgressiveSkeleton({
  isLoading,
  children,
  skeleton,
  delay = 0
}: ProgressiveSkeletonProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading)

  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
    } else {
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isLoading, delay])

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showSkeleton ? skeleton : children}
    </motion.div>
  )
}

export { Skeleton, SkeletonLoader, ProgressiveSkeleton }
