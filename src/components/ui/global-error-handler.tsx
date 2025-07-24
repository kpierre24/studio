"use client";

import React, { useEffect, useState } from 'react';
import { ErrorMessage } from './error-message';
import { ErrorFeedbackForm } from './error-feedback-form';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { errorReporting } from '@/lib/error-reporting';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { error, errorType, errorId, isVisible, clearError, retry } = useErrorHandler({
    showToast: false, // We'll show our own UI instead
  });

  // Listen for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      errorReporting.reportError(error, undefined, {
        type: 'unhandled-promise-rejection',
        url: window.location.href,
      });
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message);
      
      errorReporting.reportError(error, undefined, {
        type: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleRetry = async () => {
    try {
      await retry();
    } catch (error) {
      // Error is already handled by the error handler
    }
  };

  const handleShowFeedback = () => {
    setShowFeedbackForm(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  const handleFeedbackSubmit = () => {
    setShowFeedbackForm(false);
    clearError();
  };

  return (
    <>
      {children}
      
      {/* Global error display */}
      {isVisible && error && errorType && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <ErrorMessage
            type={errorType}
            message={error.message}
            onRetry={handleRetry}
            onDismiss={clearError}
            className="shadow-lg"
          />
          
          {/* Additional actions */}
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleShowFeedback}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Report this issue
            </button>
          </div>
        </div>
      )}

      {/* Feedback form modal */}
      {showFeedbackForm && errorId && (
        <ErrorFeedbackForm
          errorId={errorId}
          onClose={handleCloseFeedback}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}

// Context for accessing global error handler
export const GlobalErrorContext = React.createContext<{
  reportError: (error: Error, context?: Record<string, any>) => void;
  clearErrors: () => void;
} | null>(null);

export function useGlobalError() {
  const context = React.useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorHandler');
  }
  return context;
}