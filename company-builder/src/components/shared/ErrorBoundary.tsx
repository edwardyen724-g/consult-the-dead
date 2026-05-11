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
      const sectionLabel = this.props.section || 'Component';
      const errorMessage = this.state.error?.message || 'An unexpected runtime fault interrupted this shell section.';

      return (
        <div
          className="glass-panel flex items-center justify-center p-6"
          style={{
            background: 'rgba(10, 10, 18, 0.94)',
            minHeight: 160,
          }}
          role="alert"
          aria-live="polite"
        >
          <div className="text-center max-w-xs">
            <div
              className="text-[10px] uppercase tracking-[0.16em] mb-3"
              style={{
                color: '#F44336',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              {sectionLabel} stalled
            </div>
            <div
              className="text-[11px] italic leading-relaxed"
              style={{
                color: 'rgba(255, 255, 255, 0.52)',
                fontFamily: 'var(--font-newsreader), serif',
              }}
            >
              {errorMessage}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  color: '#e4e4e7',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                Retry section
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  color: '#71717a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
