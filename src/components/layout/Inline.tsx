"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const inlineVariants = cva("flex flex-row flex-wrap", {
  variants: {
    spacing: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
      reverse: "flex-wrap-reverse",
    },
  },
  defaultVariants: {
    spacing: "md",
    align: "center",
    justify: "start",
    wrap: "wrap",
  },
})

export interface InlineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineVariants> {
  as?: keyof JSX.IntrinsicElements
  motionProps?: HTMLMotionProps<"div">
}

const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, spacing, align, justify, wrap, as = "div", motionProps, ...props }, ref) => {
    const Component = motion[as as keyof typeof motion] || motion.div

    return (
      <Component
        className={cn(inlineVariants({ spacing, align, justify, wrap }), className)}
        ref={ref}
        {...motionProps}
        {...props}
      />
    )
  }
)
Inline.displayName = "Inline"

export { Inline, inlineVariants }