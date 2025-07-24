"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"
import { useHoverAnimation } from "@/hooks/useAnimations"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-md hover:shadow-lg",
        outlined: "border-2 border-primary/20",
        filled: "bg-muted/50 border-muted",
        interactive: "cursor-pointer hover:shadow-md hover:border-primary/30",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
      animation: {
        none: "",
        hover: "transition-all",
        lift: "transition-all",
        scale: "transition-transform",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "hover",
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  motionProps?: HTMLMotionProps<"div">
  interactive?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, animation, interactive, motionProps, ...props }, ref) => {
    const { hoverLift, hoverScale } = useHoverAnimation()

    const getAnimationProps = () => {
      if (animation === "none" || !interactive) return {}
      
      switch (animation) {
        case "lift":
          return hoverLift
        case "scale":
          return hoverScale
        case "hover":
          return {
            whileHover: { y: -2, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)" },
            transition: { duration: 0.2 },
          }
        default:
          return {}
      }
    }

    return (
      <motion.div
        className={cn(
          cardVariants({ variant, size, animation }),
          interactive && "cursor-pointer",
          className
        )}
        ref={ref}
        {...getAnimationProps()}
        {...motionProps}
        {...props}
      />
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  cardVariants,
}