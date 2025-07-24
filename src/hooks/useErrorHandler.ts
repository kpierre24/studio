"use client";

import { useState, useCallback, useRef } from 'react';
import { ErrorType } from '@/components/ui/error-message';
import { reportError } from '@/lib/error-reporting';
import { useRetry } from './useRetry';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: Error | null;
  errorType: ErrorType | null;
  errorId: string | null;
  isVisible: boolean;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  onError?: (error: Error, errorType: ErrorType) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    autoRetry = false,
    maxRetries = 3,
    onError
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorType: null,
    errorId: null,
    isVisible: false,
  });

  const { toast } = useToast();
  const retryRef = useRef<(() => Promise<any>) | null>(null);

  const determineErrorType = useCallback((error: Error): ErrorType => {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch') ||
      name === 'networkerror' ||
      name === 'typeerror'
    ) {
      return 'network';
    }

    // Permission errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('access denied') ||
      error.name === 'PermissionError'
    ) {
      return 'permission';
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      error.name === 'ValidationError'
    ) {
      return 'validation';
    }

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      error.name === 'TimeoutError'
    ) {
      return 'timeout';
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('internal') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    ) {
      return 'server';
    }

    // Not found errors
    if (
      message.includes('not found') ||
      message.includes('404') ||
      error.name === 'NotFoundError'
    ) {
      return 'notFound';
    }

    return 'generic';
  }, []);

  const handleError = useCallback((
    error: Error,
    context?: Record<string, any>
  ) => {
    const errorType = determineErrorType(error);
    const errorId = reportError(error, undefined, context);

    setErrorState({
      error,
      errorType,
      errorId,
      isVisible: true,
    });

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: getErrorTitle(errorType),
        description: error.message,
        variant: "destructive",
      });
    }

    // Call custom error handler
    onError?.(error, errorType);

    console.error('Error handled:', { error, errorType, errorId, context });
  }, [determineErrorType, showToast, toast, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorType: null,
      errorId: null,
      isVisible: false,
    });
    retryRef.current = null;
  }, []);

  const retry = useCallback(async () => {
    if (retryRef.current) {
      try {
        await retryRef.current();
        clearError();
      } catch (error) {
        handleError(error as Error);
      }
    }
  }, [clearError, handleError]);

  // Wrapper for async operations with error handling
  const withErrorHandling = useCallback(<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ) => {
    return async (): Promise<T> => {
      try {
        retryRef.current = operation;
        const result = await operation();
        clearError(); // Clear any previous errors on success
        return result;
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    };
  }, [handleError, clearError]);

  // Wrapper for sync operations with error handling
  const withSyncErrorHandling = useCallback(<T>(
    operation: () => T,
    context?: Record<string, any>
  ) => {
    return (): T => {
      try {
        const result = operation();
        clearError(); // Clear any previous errors on success
        return result;
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    };
  }, [handleError, clearError]);

  return {
    error: errorState.error,
    errorType: errorState.errorType,
    errorId: errorState.errorId,
    isVisible: errorState.isVisible,
    handleError,
    clearError,
    retry,
    withErrorHandling,
    withSyncErrorHandling,
  };
}

// Hook specifically for form error handling
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  const handleFormError = useCallback((error: Error) => {
    // Try to parse validation errors from the error message
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.fields) {
        setFieldErrors(parsed.fields);
        return;
      }
    } catch {
      // Not a structured validation error
    }

    // Set as general error
    setGeneralError(error.message);
  }, []);

  return {
    fieldErrors,
    generalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleFormError,
    hasErrors: Object.keys(fieldErrors).length > 0 || generalError !== null,
  };
}

// Utility function to get error titles
function getErrorTitle(errorType: ErrorType): string {
  const titles: Record<ErrorType, string> = {
    network: 'Connection Problem',
    permission: 'Access Denied',
    validation: 'Invalid Input',
    timeout: 'Request Timeout',
    server: 'Server Error',
    notFound: 'Not Found',
    generic: 'Error Occurred',
  };

  return titles[errorType];
}