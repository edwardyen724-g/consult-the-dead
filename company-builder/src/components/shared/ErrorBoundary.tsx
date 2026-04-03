'use client';

import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  section?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.section || 'unknown'}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center p-6"
          style={{
            background: 'rgba(10, 10, 18, 0.9)',
            minHeight: 100,
          }}
        >
          <div className="text-center">
            <div
              className="text-[10px] uppercase tracking-[0.16em] mb-2"
              style={{
                color: '#F44336',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              {this.props.section || 'Component'} Error
            </div>
            <div
              className="text-[11px] italic"
              style={{
                color: 'rgba(255, 255, 255, 0.35)',
                fontFamily: 'var(--font-newsreader), serif',
              }}
            >
              Something went wrong. Try refreshing the page.
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#71717a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
