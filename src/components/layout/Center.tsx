"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const centerVariants = cva("flex items-center justify-center", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    minHeight: {
      none: "",
      screen: "min-h-screen",
      full: "min-h-full",
      "50vh": "min-h-[50vh]",
      "75vh": "min-h-[75vh]",
    },
    textAlign: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    direction: "column",
    minHeight: "none",
    textAlign: "center",
  },
})

export interface CenterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof centerVariants> {
  as?: keyof JSX.IntrinsicElements
  motionProps?: HTMLMotionProps<"div">
}

const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, direction, minHeight, textAlign, as = "div", motionProps, ...props }, ref) => {
    const Component = motion[as as keyof typeof motion] || motion.div

    return (
      <Component
        className={cn(centerVariants({ direction, minHeight, textAlign }), className)}
        ref={ref}
        {...motionProps}
        {...props}
      />
    )
  }
)
Center.displayName = "Center"

export { Center, centerVariants }