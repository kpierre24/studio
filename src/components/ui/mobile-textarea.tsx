"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Mic, MicOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface MobileTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "floating" | "outlined";
  enableVoiceInput?: boolean;
  enableAutoResize?: boolean;
  enableFullscreen?: boolean;
  onVoiceInput?: (transcript: string) => void;
  touchOptimized?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

const MobileTextarea = React.forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({
    className,
    label,
    error,
    success,
    hint,
    size = "md",
    variant = "default",
    enableVoiceInput = false,
    enableAutoResize = true,
    enableFullscreen = false,
    onVoiceInput,
    touchOptimized = true,
    maxLength,
    showCharCount = false,
    disabled,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const recognitionRef = React.useRef<any>(null);

    const inputId = React.useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Handle voice input
    React.useEffect(() => {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript && onVoiceInput) {
            onVoiceInput(finalTranscript);
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }, [onVoiceInput]);

    // Auto-resize functionality
    React.useEffect(() => {
      if (enableAutoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };
        
        textarea.addEventListener('input', adjustHeight);
        adjustHeight(); // Initial adjustment
        
        return () => textarea.removeEventListener('input', adjustHeight);
      }
    }, [enableAutoResize]);

    // Handle fullscreen mode
    React.useEffect(() => {
      if (isFullscreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isFullscreen]);

    const handleVoiceInput = () => {
      if (recognitionRef.current && !isListening) {
        setIsListening(true);
        recognitionRef.current.start();
      } else if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setHasValue(value.length > 0);
      setCharCount(value.length);
      props.onChange?.(e);
    };

    const sizeClasses = {
      sm: touchOptimized ? "min-h-[80px] px-3 py-3 text-sm" : "min-h-[60px] px-3 py-2 text-sm",
      md: touchOptimized ? "min-h-[100px] px-4 py-4 text-base" : "min-h-[80px] px-3 py-2 text-sm",
      lg: touchOptimized ? "min-h-[120px] px-4 py-4 text-lg" : "min-h-[100px] px-4 py-3 text-base"
    };

    const variantClasses = {
      default: "border border-input-border bg-input",
      floating: "border-b-2 border-input-border bg-transparent rounded-none",
      outlined: "border-2 border-input-border bg-transparent"
    };

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const isOverLimit = maxLength ? charCount > maxLength : false;

    return (
      <>
        <div className="w-full space-y-2">
          <div className="relative">
            {/* Floating label */}
            {label && variant === "floating" && (
              <motion.label
                htmlFor={inputId}
                className={cn(
                  "absolute left-4 transition-all duration-200 pointer-events-none z-10",
                  isFocused || hasValue
                    ? "top-2 text-xs text-primary"
                    : "top-4 text-base text-muted-foreground"
                )}
                animate={{
                  y: isFocused || hasValue ? -10 : 0,
                  scale: isFocused || hasValue ? 0.85 : 1,
                }}
              >
                {label}
              </motion.label>
            )}

            {/* Regular label */}
            {label && variant !== "floating" && (
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={inputId}
                  className="block text-sm font-medium text-foreground"
                >
                  {label}
                </label>
                
                {/* Character count */}
                {(showCharCount || maxLength) && (
                  <span className={cn(
                    "text-xs",
                    isOverLimit ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {charCount}{maxLength && `/${maxLength}`}
                  </span>
                )}
              </div>
            )}

            <div className="relative">
              {/* Textarea */}
              <motion.textarea
                ref={textareaRef}
                id={inputId}
                className={cn(
                  "flex w-full rounded-md ring-offset-background transition-all duration-200 resize-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  sizeClasses[size],
                  variantClasses[variant],
                  hasError && "border-destructive focus-visible:ring-destructive",
                  hasSuccess && "border-green-500 focus-visible:ring-green-500",
                  isOverLimit && "border-destructive focus-visible:ring-destructive",
                  touchOptimized && "touch-manipulation",
                  enableAutoResize ? "overflow-hidden" : "overflow-auto",
                  className
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleTextareaChange}
                disabled={disabled}
                maxLength={maxLength}
                aria-describedby={cn(
                  error && errorId,
                  hint && hintId
                )}
                aria-invalid={hasError || isOverLimit}
                whileFocus={{ scale: touchOptimized ? 1.01 : 1 }}
                {...props}
              />

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {/* Voice input button */}
                {enableVoiceInput && recognitionRef.current && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleVoiceInput}
                    disabled={disabled}
                  >
                    <motion.div
                      animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-destructive" />
                      ) : (
                        <Mic className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </Button>
                )}

                {/* Fullscreen toggle */}
                {enableFullscreen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    disabled={disabled}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Hint text */}
          {hint && !error && !success && (
            <p id={hintId} className="text-sm text-muted-foreground">
              {hint}
            </p>
          )}

          {/* Error message */}
          <AnimatePresence>
            {(error || isOverLimit) && (
              <motion.p
                id={errorId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {error || `Text exceeds maximum length of ${maxLength} characters`}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && !isOverLimit && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-green-600 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Voice input indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                Listening...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen overlay */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className="container mx-auto p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{label || "Text Editor"}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(false)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    className={cn(
                      "w-full h-full rounded-md border border-input-border bg-input px-4 py-4 text-base",
                      "placeholder:text-muted-foreground resize-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    value={textareaRef.current?.value || ''}
                    onChange={(e) => {
                      if (textareaRef.current) {
                        textareaRef.current.value = e.target.value;
                        handleTextareaChange(e);
                      }
                    }}
                    placeholder={props.placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                  />
                  
                  {/* Character count in fullscreen */}
                  {(showCharCount || maxLength) && (
                    <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      {charCount}{maxLength && `/${maxLength}`}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

MobileTextarea.displayName = "MobileTextarea";

export { MobileTextarea };