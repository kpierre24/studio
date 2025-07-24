"use client";

import React from 'react';
import { AlertCircle, Wifi, RefreshCw, Shield, Clock, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorType = 
  | 'network'
  | 'permission'
  | 'validation'
  | 'timeout'
  | 'server'
  | 'notFound'
  | 'generic';

interface ErrorMessageProps {
  type: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  retryLabel?: string;
  dismissLabel?: string;
}

const errorConfig: Record<ErrorType, {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultMessage: string;
  suggestions: string[];
  variant: 'default' | 'destructive';
}> = {
  network: {
    icon: Wifi,
    defaultTitle: 'Connection Problem',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable VPN if you\'re using one',
      'Contact your network administrator'
    ],
    variant: 'destructive'
  },
  permission: {
    icon: Shield,
    defaultTitle: 'Access Denied',
    defaultMessage: 'You don\'t have permission to perform this action.',
    suggestions: [
      'Contact your administrator for access',
      'Make sure you\'re logged in with the correct account',
      'Check if your session has expired'
    ],
    variant: 'destructive'
  },
  validation: {
    icon: AlertCircle,
    defaultTitle: 'Invalid Input',
    defaultMessage: 'Please check your input and try again.',
    suggestions: [
      'Review the highlighted fields',
      'Make sure all required fields are filled',
      'Check the format of your input'
    ],
    variant: 'destructive'
  },
  timeout: {
    icon: Clock,
    defaultTitle: 'Request Timeout',
    defaultMessage: 'The request took too long to complete.',
    suggestions: [
      'Try again with a smaller request',
      'Check your internet connection',
      'Contact support if this persists'
    ],
    variant: 'destructive'
  },
  server: {
    icon: AlertCircle,
    defaultTitle: 'Server Error',
    defaultMessage: 'Something went wrong on our end. We\'re working to fix it.',
    suggestions: [
      'Try again in a few minutes',
      'Check our status page for updates',
      'Contact support if the problem persists'
    ],
    variant: 'destructive'
  },
  notFound: {
    icon: HelpCircle,
    defaultTitle: 'Not Found',
    defaultMessage: 'The requested resource could not be found.',
    suggestions: [
      'Check the URL for typos',
      'Go back to the previous page',
      'Use the search function to find what you\'re looking for'
    ],
    variant: 'default'
  },
  generic: {
    icon: AlertCircle,
    defaultTitle: 'Error',
    defaultMessage: 'An unexpected error occurred.',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if the problem persists'
    ],
    variant: 'destructive'
  }
};

export function ErrorMessage({
  type,
  title,
  message,
  onRetry,
  onDismiss,
  className,
  showIcon = true,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss'
}: ErrorMessageProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={cn('relative', className)}>
      {showIcon && <Icon className="h-4 w-4" />}
      <AlertTitle>{title || config.defaultTitle}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message || config.defaultMessage}</p>
        
        <div>
          <p className="text-sm font-medium mb-2">What you can try:</p>
          <ul className="text-sm space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {(onRetry || onDismiss) && (
          <div className="flex gap-2 pt-2">
            {onRetry && (
              <Button size="sm" onClick={onRetry} variant="outline">
                <RefreshCw className="w-3 h-3 mr-1" />
                {retryLabel}
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" onClick={onDismiss} variant="ghost">
                {dismissLabel}
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Inline error message for forms and smaller contexts
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn('flex items-center gap-1 text-sm text-destructive', className)}>
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Success message component for positive feedback
interface SuccessMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessMessage({ 
  title = 'Success', 
  message, 
  onDismiss, 
  className 
}: SuccessMessageProps) {
  return (
    <Alert className={cn('border-green-200 bg-green-50 text-green-800', className)}>
      <AlertCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">{title}</AlertTitle>
      <AlertDescription className="text-green-700">
        {message}
        {onDismiss && (
          <Button 
            size="sm" 
            onClick={onDismiss} 
            variant="ghost" 
            className="ml-2 h-auto p-1 text-green-700 hover:text-green-800"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}