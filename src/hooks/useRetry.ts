"use client";

import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  canRetry: boolean;
  error: Error | null;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
    onMaxAttemptsReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    canRetry: true,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateDelay = useCallback((attempt: number) => {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt - 1);
    }
    return delay * attempt;
  }, [delay, backoff]);

  const execute = useCallback(async (): Promise<T> => {
    if (state.attempt >= maxAttempts) {
      throw new Error('Maximum retry attempts reached');
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempt: prev.attempt + 1,
      error: null
    }));

    try {
      const result = await operation();
      
      setState(prev => ({
        ...prev,
        isRetrying: false,
        canRetry: true,
        error: null
      }));

      return result;
    } catch (error) {
      const currentAttempt = state.attempt + 1;
      const canRetryAgain = currentAttempt < maxAttempts;

      setState(prev => ({
        ...prev,
        isRetrying: false,
        attempt: currentAttempt,
        canRetry: canRetryAgain,
        error: error as Error
      }));

      if (canRetryAgain) {
        onRetry?.(currentAttempt);
      } else {
        onMaxAttemptsReached?.();
      }

      throw error;
    }
  }, [operation, maxAttempts, state.attempt, onRetry, onMaxAttemptsReached]);

  const retry = useCallback(async (): Promise<T> => {
    if (!state.canRetry) {
      throw new Error('Cannot retry: maximum attempts reached');
    }

    const retryDelay = calculateDelay(state.attempt + 1);
    
    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await execute();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, retryDelay);
    });
  }, [state.canRetry, state.attempt, calculateDelay, execute]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState({
      isRetrying: false,
      attempt: 0,
      canRetry: true,
      error: null
    });
  }, []);

  return {
    execute,
    retry,
    reset,
    ...state
  };
}

// Hook for automatic retry with exponential backoff
export function useAutoRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions & { autoRetry?: boolean } = {}
) {
  const { autoRetry = false, ...retryOptions } = options;
  const retryHook = useRetry(operation, retryOptions);

  const executeWithAutoRetry = useCallback(async (): Promise<T> => {
    try {
      return await retryHook.execute();
    } catch (error) {
      if (autoRetry && retryHook.canRetry) {
        return await retryHook.retry();
      }
      throw error;
    }
  }, [retryHook, autoRetry]);

  return {
    ...retryHook,
    execute: executeWithAutoRetry
  };
}

// Hook for network-specific retry logic
export function useNetworkRetry<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions, 'onRetry'> & {
    onNetworkError?: () => void;
  } = {}
) {
  const { onNetworkError, ...retryOptions } = options;

  const isNetworkError = (error: Error): boolean => {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError'
    );
  };

  return useRetry(operation, {
    ...retryOptions,
    onRetry: (attempt) => {
      console.log(`Network retry attempt ${attempt}`);
    },
    onMaxAttemptsReached: () => {
      onNetworkError?.();
    }
  });
}