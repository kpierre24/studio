"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useHoverAnimation } from "@/hooks/useAnimations"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        scale: "transition-transform",
        lift: "transition-all",
        pulse: "transition-all",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  motionProps?: HTMLMotionProps<"button">
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      motionProps,
      ...props
    },
    ref
  ) => {
    const { hoverScale } = useHoverAnimation()
    const Comp = asChild ? Slot : motion.button

    const isDisabled = disabled || loading

    const getAnimationProps = () => {
      if (animation === "none" || isDisabled) return {}
      
      switch (animation) {
        case "scale":
          return hoverScale
        case "lift":
          return {
            whileHover: { y: -1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" },
            whileTap: { y: 0, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" },
          }
        case "pulse":
          return {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
          }
        default:
          return hoverScale
      }
    }

    const content = (
      <>
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </>
    )

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          fullWidth && "w-full"
        )}
        ref={ref}
        disabled={isDisabled}
        {...getAnimationProps()}
        {...motionProps}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }