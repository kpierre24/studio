"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle, Camera, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface MobileInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "floating" | "outlined";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  enableVoiceInput?: boolean;
  enableCameraInput?: boolean;
  onVoiceInput?: (transcript: string) => void;
  onCameraCapture?: (file: File) => void;
  touchOptimized?: boolean;
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({
    className,
    type,
    label,
    error,
    success,
    hint,
    size = "md",
    variant = "default",
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    enableVoiceInput = false,
    enableCameraInput = false,
    onVoiceInput,
    onCameraCapture,
    touchOptimized = true,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const recognitionRef = React.useRef<any>(null);

    const inputId = React.useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Handle voice input
    React.useEffect(() => {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (onVoiceInput) {
            onVoiceInput(transcript);
          }
          setIsListening(false);
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

    const handleVoiceInput = () => {
      if (recognitionRef.current && !isListening) {
        setIsListening(true);
        recognitionRef.current.start();
      } else if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    const handleCameraCapture = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onCameraCapture) {
        onCameraCapture(file);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const sizeClasses = {
      sm: touchOptimized ? "h-12 px-3 text-sm" : "h-9 px-3 text-sm",
      md: touchOptimized ? "h-14 px-4 text-base" : "h-10 px-3 text-sm",
      lg: touchOptimized ? "h-16 px-4 text-lg" : "h-11 px-4 text-base"
    };

    const variantClasses = {
      default: "border border-input-border bg-input",
      floating: "border-b-2 border-input-border bg-transparent rounded-none",
      outlined: "border-2 border-input-border bg-transparent"
    };

    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
      <div className="w-full space-y-2">
        {/* Hidden file input for camera */}
        {enableCameraInput && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        )}

        <div className="relative">
          {/* Floating label */}
          {label && variant === "floating" && (
            <motion.label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none",
                isFocused || hasValue
                  ? "top-2 text-xs text-primary"
                  : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
              )}
              animate={{
                y: isFocused || hasValue ? -20 : 0,
                scale: isFocused || hasValue ? 0.85 : 1,
              }}
            >
              {label}
            </motion.label>
          )}

          {/* Regular label */}
          {label && variant !== "floating" && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-foreground mb-2"
            >
              {label}
            </label>
          )}

          <div className="relative">
            {/* Left icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {leftIcon}
              </div>
            )}

            {/* Input field */}
            <motion.input
              ref={ref}
              id={inputId}
              type={inputType}
              className={cn(
                "flex w-full rounded-md ring-offset-background transition-all duration-200",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                sizeClasses[size],
                variantClasses[variant],
                leftIcon && "pl-10",
                (rightIcon || showPasswordToggle || enableVoiceInput || enableCameraInput) && "pr-12",
                hasError && "border-destructive focus-visible:ring-destructive",
                hasSuccess && "border-green-500 focus-visible:ring-green-500",
                touchOptimized && "touch-manipulation",
                className
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleInputChange}
              disabled={disabled}
              aria-describedby={cn(
                error && errorId,
                hint && hintId
              )}
              aria-invalid={hasError}
              whileFocus={{ scale: touchOptimized ? 1.02 : 1 }}
              {...props}
            />

            {/* Right side icons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
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

              {/* Camera input button */}
              {enableCameraInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCameraCapture}
                  disabled={disabled}
                >
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}

              {/* Password toggle */}
              {showPasswordToggle && type === "password" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={disabled}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}

              {/* Custom right icon */}
              {rightIcon && !showPasswordToggle && !enableVoiceInput && !enableCameraInput && (
                <div className="text-muted-foreground">{rightIcon}</div>
              )}

              {/* Status icons */}
              {hasError && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              {hasSuccess && (
                <CheckCircle className="h-4 w-4 text-green-500" />
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
          {error && (
            <motion.p
              id={errorId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {success && (
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
    );
  }
);

MobileInput.displayName = "MobileInput";

export { MobileInput };