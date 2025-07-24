"use client";

import { ErrorInfo } from 'react';

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    componentStack?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  metadata?: Record<string, any>;
}

export interface UserFeedback {
  errorId: string;
  userDescription: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  userEmail?: string;
  timestamp: string;
}

class ErrorReportingService {
  private reports: ErrorReport[] = [];
  private feedback: UserFeedback[] = [];
  private isEnabled: boolean = true;

  constructor() {
    // In production, you might want to check for user consent
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('error-reporting-consent') === 'true';
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('chunk load failed') ||
      message.includes('loading chunk') ||
      stack.includes('chunkloaderror')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('permission') ||
      error.name === 'TypeError'
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('validation') ||
      message.includes('timeout') ||
      error.name === 'ValidationError'
    ) {
      return 'medium';
    }

    return 'low';
  }

  private getTags(error: Error): string[] {
    const tags: string[] = [];
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      tags.push('network');
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      tags.push('permission');
    }
    if (message.includes('validation')) {
      tags.push('validation');
    }
    if (message.includes('timeout')) {
      tags.push('timeout');
    }
    if (error.name === 'ChunkLoadError') {
      tags.push('chunk-loading');
    }

    return tags;
  }

  public reportError(
    error: Error, 
    errorInfo?: ErrorInfo, 
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) {
      return '';
    }

    const errorId = this.generateId();
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        componentStack: errorInfo?.componentStack || '',
      },
      severity: this.determineSeverity(error),
      tags: this.getTags(error),
      metadata,
    };

    this.reports.push(report);
    this.persistReport(report);
    this.sendToService(report);

    return errorId;
  }

  public submitFeedback(feedback: Omit<UserFeedback, 'timestamp'>): void {
    const fullFeedback: UserFeedback = {
      ...feedback,
      timestamp: new Date().toISOString(),
    };

    this.feedback.push(fullFeedback);
    this.persistFeedback(fullFeedback);
    this.sendFeedbackToService(fullFeedback);
  }

  public getReports(): ErrorReport[] {
    return [...this.reports];
  }

  public getFeedback(): UserFeedback[] {
    return [...this.feedback];
  }

  public clearReports(): void {
    this.reports = [];
    localStorage.removeItem('error-reports');
  }

  public clearFeedback(): void {
    this.feedback = [];
    localStorage.removeItem('error-feedback');
  }

  private getCurrentUserId(): string | undefined {
    // This would typically come from your auth system
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  private persistReport(report: ErrorReport): void {
    try {
      const existingReports = JSON.parse(localStorage.getItem('error-reports') || '[]');
      existingReports.push(report);
      
      // Keep only the last 50 reports to avoid storage bloat
      const recentReports = existingReports.slice(-50);
      localStorage.setItem('error-reports', JSON.stringify(recentReports));
    } catch (error) {
      console.warn('Failed to persist error report:', error);
    }
  }

  private persistFeedback(feedback: UserFeedback): void {
    try {
      const existingFeedback = JSON.parse(localStorage.getItem('error-feedback') || '[]');
      existingFeedback.push(feedback);
      
      // Keep only the last 20 feedback items
      const recentFeedback = existingFeedback.slice(-20);
      localStorage.setItem('error-feedback', JSON.stringify(recentFeedback));
    } catch (error) {
      console.warn('Failed to persist error feedback:', error);
    }
  }

  private async sendToService(report: ErrorReport): Promise<void> {
    try {
      // In production, this would send to your error reporting service
      // For now, we'll just log it
      console.group('🐛 Error Report');
      console.error('Error:', report.error);
      console.log('Context:', report.context);
      console.log('Severity:', report.severity);
      console.log('Tags:', report.tags);
      console.groupEnd();

      // Example of how you might send to a service:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
    } catch (error) {
      console.warn('Failed to send error report to service:', error);
    }
  }

  private async sendFeedbackToService(feedback: UserFeedback): Promise<void> {
    try {
      console.group('💬 User Feedback');
      console.log('Error ID:', feedback.errorId);
      console.log('Description:', feedback.userDescription);
      console.log('Steps:', feedback.reproductionSteps);
      console.groupEnd();

      // Example of how you might send to a service:
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedback),
      // });
    } catch (error) {
      console.warn('Failed to send feedback to service:', error);
    }
  }

  public enableReporting(): void {
    this.isEnabled = true;
    localStorage.setItem('error-reporting-consent', 'true');
  }

  public disableReporting(): void {
    this.isEnabled = false;
    localStorage.removeItem('error-reporting-consent');
    this.clearReports();
    this.clearFeedback();
  }

  public isReportingEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService();

// Convenience functions
export function reportError(
  error: Error, 
  errorInfo?: ErrorInfo, 
  metadata?: Record<string, any>
): string {
  return errorReporting.reportError(error, errorInfo, metadata);
}

export function submitErrorFeedback(feedback: Omit<UserFeedback, 'timestamp'>): void {
  errorReporting.submitFeedback(feedback);
}