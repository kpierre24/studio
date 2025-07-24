"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { useEnhancedTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: 'default' | 'info' | 'warning' | 'error' | 'success'
  showArrow?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant = 'default', showArrow = true, sideOffset = 4, children, ...props }, ref) => {
  const { theme } = useEnhancedTheme()
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-600 text-white",
    error: "bg-red-600 text-white",
    success: "bg-green-600 text-white"
  }

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "shadow-md border",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <TooltipPrimitive.Arrow 
          className={cn("fill-current", variantClasses[variant])} 
        />
      )}
    </TooltipPrimitive.Content>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced Tooltip with motion support
interface EnhancedTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'info' | 'warning' | 'error' | 'success'
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  showArrow?: boolean
  disabled?: boolean
}

export function EnhancedTooltip({
  content,
  children,
  variant = 'default',
  side = 'top',
  align = 'center',
  delayDuration = 400,
  showArrow = true,
  disabled = false
}: EnhancedTooltipProps) {
  const { theme } = useEnhancedTheme()
  
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          variant={variant}
          showArrow={showArrow}
        >
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

// Tooltip with keyboard shortcut display
interface KeyboardTooltipProps extends Omit<EnhancedTooltipProps, 'content'> {
  description: string
  shortcut?: string | string[]
}

export function KeyboardTooltip({
  description,
  shortcut,
  children,
  ...props
}: KeyboardTooltipProps) {
  const content = (
    <div className="flex flex-col gap-1">
      <span>{description}</span>
      {shortcut && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          {Array.isArray(shortcut) ? (
            shortcut.map((key, index) => (
              <React.Fragment key={key}>
                {index > 0 && <span>+</span>}
                <kbd className="px-1 py-0.5 bg-black/20 rounded text-xs">
                  {key}
                </kbd>
              </React.Fragment>
            ))
          ) : (
            <kbd className="px-1 py-0.5 bg-black/20 rounded text-xs">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  )

  return (
    <EnhancedTooltip content={content} {...props}>
      {children}
    </EnhancedTooltip>
  )
}

// Rich tooltip with custom content
interface RichTooltipProps extends Omit<EnhancedTooltipProps, 'content'> {
  title?: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function RichTooltip({
  title,
  description,
  icon,
  action,
  children,
  ...props
}: RichTooltipProps) {
  const content = (
    <div className="max-w-xs space-y-2">
      {(title || icon) && (
        <div className="flex items-center gap-2">
          {icon}
          {title && <span className="font-medium">{title}</span>}
        </div>
      )}
      <p className="text-sm leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs underline hover:no-underline opacity-75 hover:opacity-100 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  )

  return (
    <EnhancedTooltip content={content} {...props}>
      {children}
    </EnhancedTooltip>
  )
}

// Status tooltip for showing loading, success, error states
interface StatusTooltipProps extends Omit<EnhancedTooltipProps, 'content' | 'variant'> {
  status: 'loading' | 'success' | 'error' | 'idle'
  messages: {
    loading?: string
    success?: string
    error?: string
    idle?: string
  }
}

export function StatusTooltip({
  status,
  messages,
  children,
  ...props
}: StatusTooltipProps) {
  const getVariant = () => {
    switch (status) {
      case 'success': return 'success'
      case 'error': return 'error'
      case 'loading': return 'info'
      default: return 'default'
    }
  }

  const content = messages[status] || ''

  return (
    <EnhancedTooltip
      content={content}
      variant={getVariant()}
      disabled={!content}
      {...props}
    >
      {children}
    </EnhancedTooltip>
  )
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }