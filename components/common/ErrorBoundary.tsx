'use client';

import { Component, ReactNode, ErrorInfo } from 'react';

import { logError } from '@/lib/utils/errorHandler';

import { ErrorBoundaryContent } from './ErrorBoundaryContent';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Ignore NEXT_NOT_FOUND errors - these are handled by Next.js for 404 pages
    // Check both message and digest (Next.js uses digest for special errors)
    const errorAny = error as { digest?: string; message: string };
    if (
      error.message === 'NEXT_NOT_FOUND' ||
      errorAny.digest === 'NEXT_NOT_FOUND' ||
      errorAny.digest?.startsWith('NEXT_NOT_FOUND')
    ) {
      // Don't set error state for NEXT_NOT_FOUND - let Next.js handle it
      // Return empty state to prevent ErrorBoundary from catching it
      return { hasError: false, error: null, errorInfo: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Ignore NEXT_NOT_FOUND errors - these are handled by Next.js for 404 pages
    // Check both message and digest (Next.js uses digest for special errors)
    const errorAny = error as { digest?: string; message: string };
    if (
      error.message === 'NEXT_NOT_FOUND' ||
      errorAny.digest === 'NEXT_NOT_FOUND' ||
      errorAny.digest?.startsWith('NEXT_NOT_FOUND')
    ) {
      // Don't log or handle NEXT_NOT_FOUND errors - let Next.js handle them
      return;
    }

    // Log error for debugging and error tracking
    logError(error, 'ErrorBoundary');

    // Store error info for potential reporting
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        const hasResetKeyChanged = resetKeys.some(
          (resetKey, index) => resetKey !== prevProps.resetKeys?.[index]
        );

        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    // Reset on props change if enabled
    if (hasError && this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId !== null) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId !== null) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }, 0);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryContent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}
