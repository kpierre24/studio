"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, AlertCircle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card } from "./card";

export interface MobileFormProps<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  submitText?: string;
  isLoading?: boolean;
  showProgress?: boolean;
  stickySubmit?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onAutoSave?: (data: T) => void;
  touchOptimized?: boolean;
  keyboardOptimization?: {
    submitOnEnter?: boolean;
    preventZoom?: boolean;
    adjustViewport?: boolean;
  };
}

export function MobileForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  className,
  title,
  description,
  submitText = "Submit",
  isLoading = false,
  showProgress = false,
  stickySubmit = true,
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave,
  touchOptimized = true,
  keyboardOptimization = {
    submitOnEnter: false,
    preventZoom: true,
    adjustViewport: true
  }
}: MobileFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const formRef = React.useRef<HTMLFormElement>(null);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();
  const initialViewportHeight = React.useRef<number>();

  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange'
  });

  const { handleSubmit, watch, formState: { errors, isValid, dirtyFields } } = methods;

  // Calculate form progress
  React.useEffect(() => {
    if (showProgress) {
      const totalFields = Object.keys(methods.getValues()).length;
      const filledFields = Object.keys(dirtyFields).length;
      setProgress(totalFields > 0 ? (filledFields / totalFields) * 100 : 0);
    }
  }, [dirtyFields, showProgress, methods]);

  // Auto-save functionality
  React.useEffect(() => {
    if (autoSave && onAutoSave) {
      const subscription = watch((data) => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        setAutoSaveStatus('idle');
        
        autoSaveTimeoutRef.current = setTimeout(async () => {
          try {
            setAutoSaveStatus('saving');
            await onAutoSave(data as T);
            setAutoSaveStatus('saved');
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } catch (error) {
            setAutoSaveStatus('error');
            setTimeout(() => setAutoSaveStatus('idle'), 3000);
          }
        }, autoSaveDelay);
      });

      return () => {
        subscription.unsubscribe();
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }
  }, [autoSave, onAutoSave, autoSaveDelay, watch]);

  // Keyboard visibility detection
  React.useEffect(() => {
    if (typeof window === 'undefined' || !keyboardOptimization.adjustViewport) return;

    initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight.current! - currentHeight;
      
      // Keyboard is likely visible if viewport height decreased significantly
      setIsKeyboardVisible(heightDifference > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  }, [keyboardOptimization.adjustViewport]);

  // Prevent zoom on input focus (iOS)
  React.useEffect(() => {
    if (!keyboardOptimization.preventZoom) return;

    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.getAttribute('content');

    const preventZoom = () => {
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
    };

    const restoreZoom = () => {
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
    };

    const inputs = formRef.current?.querySelectorAll('input, textarea, select');
    inputs?.forEach(input => {
      input.addEventListener('focus', preventZoom);
      input.addEventListener('blur', restoreZoom);
    });

    return () => {
      inputs?.forEach(input => {
        input.removeEventListener('focus', preventZoom);
        input.removeEventListener('blur', restoreZoom);
      });
      restoreZoom();
    };
  }, [keyboardOptimization.preventZoom]);

  const handleFormSubmit = async (data: T) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit(data);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (keyboardOptimization.submitOnEnter && e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  const scrollToError = () => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = formRef.current?.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToError();
    }
  }, [errors]);

  return (
    <FormProvider {...methods}>
      <div className={cn("w-full", className)}>
        {/* Header */}
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Auto-save status */}
        {autoSave && (
          <AnimatePresence>
            {autoSaveStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className={cn(
                  "flex items-center gap-2 text-sm px-3 py-2 rounded-md",
                  autoSaveStatus === 'saving' && "text-blue-600 bg-blue-50",
                  autoSaveStatus === 'saved' && "text-green-600 bg-green-50",
                  autoSaveStatus === 'error' && "text-red-600 bg-red-50"
                )}>
                  {autoSaveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {autoSaveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                  {autoSaveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                  
                  {autoSaveStatus === 'saving' && "Saving..."}
                  {autoSaveStatus === 'saved' && "Saved"}
                  {autoSaveStatus === 'error' && "Save failed"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit(handleFormSubmit)}
          onKeyDown={handleKeyDown}
          className={cn(
            "space-y-6",
            touchOptimized && "touch-manipulation",
            stickySubmit && isKeyboardVisible && "pb-20"
          )}
        >
          {children}

          {/* Error summary */}
          <AnimatePresence>
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border-destructive bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium text-destructive mb-2">
                        Please fix the following errors:
                      </h4>
                      <ul className="text-sm text-destructive space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>
                            • {error?.message as string}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border-destructive bg-destructive/5 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit success */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border-green-500 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-600">Form submitted successfully!</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <div className={cn(
            stickySubmit && isKeyboardVisible && "fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50"
          )}>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !isValid}
              className={cn(
                "w-full",
                touchOptimized && "h-12 text-base"
              )}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {submitText}
                  {keyboardOptimization.submitOnEnter && (
                    <span className="ml-2 text-xs opacity-70">⌘↵</span>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Scroll to top button (mobile) */}
        <AnimatePresence>
          {isKeyboardVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-20 right-4 z-40"
            >
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full w-10 h-10 p-0 shadow-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FormProvider>
  );
}

// Form field components that work with MobileForm
export { MobileInput } from "./mobile-input";
export { MobileTextarea } from "./mobile-textarea";