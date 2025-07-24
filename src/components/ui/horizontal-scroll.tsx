"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showIndicators?: boolean;
  showScrollButtons?: boolean;
  scrollAmount?: number;
}

export function HorizontalScroll({
  children,
  className,
  showIndicators = true,
  showScrollButtons = true,
  scrollAmount = 200
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollability = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    setScrollProgress(scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0);
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left Scroll Button */}
      <AnimatePresence>
        {showScrollButtons && canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Scroll Button */}
      <AnimatePresence>
        {showScrollButtons && canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        onScroll={checkScrollability}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-4 min-w-max">
          {children}
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      {showIndicators && (canScrollLeft || canScrollRight) && (
        <div className="mt-2 flex justify-center">
          <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}