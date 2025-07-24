"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'card' | 'minimal';
  disabled?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  icon,
  badge,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
  disabled = false,
  onToggle
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (disabled) return;
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const content = (
    <>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between cursor-pointer select-none",
          variant === 'card' ? "p-4" : "py-3",
          disabled && "cursor-not-allowed opacity-50",
          headerClassName
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <div className="flex-shrink-0 text-muted-foreground">
              {icon}
            </div>
          )}
          <h3 className={cn(
            "font-medium",
            variant === 'minimal' ? "text-sm" : "text-base"
          )}>
            {title}
          </h3>
          {badge && (
            <div className="flex-shrink-0">
              {badge}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={cn(
              variant === 'card' ? "px-4 pb-4" : "pb-3",
              variant === 'minimal' && "pt-2",
              contentClassName
            )}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        {content}
      </Card>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("border-b border-border last:border-b-0", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "border border-border rounded-lg overflow-hidden bg-background",
      className
    )}>
      {content}
    </div>
  );
}

// Multi-section container
interface CollapsibleSectionsProps {
  sections: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    defaultExpanded?: boolean;
    disabled?: boolean;
  }>;
  allowMultiple?: boolean;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export function CollapsibleSections({
  sections,
  allowMultiple = true,
  variant = 'default',
  className
}: CollapsibleSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded).map(s => s.id))
  );

  const handleToggle = (sectionId: string, expanded: boolean) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      
      if (expanded) {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(sectionId);
      } else {
        newSet.delete(sectionId);
      }
      
      return newSet;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {sections.map((section) => (
        <CollapsibleSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          badge={section.badge}
          variant={variant}
          disabled={section.disabled}
          defaultExpanded={expandedSections.has(section.id)}
          onToggle={(expanded) => handleToggle(section.id, expanded)}
        >
          {section.content}
        </CollapsibleSection>
      ))}
    </div>
  );
}