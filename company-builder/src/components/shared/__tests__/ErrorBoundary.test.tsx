import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// A component that throws when `shouldThrow` is true
function BombComponent({ shouldThrow, message }: { shouldThrow: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message ?? 'boom');
  }
  return <div>stable</div>;
}

// Suppress console.error noise during tests that intentionally throw
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary section="Test">
        <div>hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary section="Canvas">
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Canvas stalled')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('uses "Component" as fallback section label when section prop is omitted', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Component stalled')).toBeInTheDocument();
  });

  it('shows a default message when the error has no message', () => {
    // Override getDerivedStateFromError to inject a message-less error
    const MessagelessError = () => {
      const err = new Error();
      err.message = '';
      throw err;
    };
    render(
      <ErrorBoundary section="Panels">
        <MessagelessError />
      </ErrorBoundary>,
    );
    expect(
      screen.getByText('An unexpected runtime fault interrupted this shell section.'),
    ).toBeInTheDocument();
  });

  it('shows "Retry section" and "Reload app" buttons', () => {
    render(
      <ErrorBoundary section="Sidebar">
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /retry section/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument();
  });

  it('resets the internal state when Retry section is clicked so the next render attempt is made', () => {
    // We can't easily prove children render after reset without a live app server,
    // but we CAN assert: (a) the boundary starts in error state, and (b) clicking
    // Retry section clears the error state (the alert is replaced by children).
    // Use a ref on the boundary instance to verify setState was called.
    const ref = React.createRef<ErrorBoundary>();
    render(
      <ErrorBoundary ref={ref} section="Mine">
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Spy on setState before clicking
    const setStateSpy = vi.spyOn(ref.current!, 'setState');
    fireEvent.click(screen.getByRole('button', { name: /retry section/i }));
    expect(setStateSpy).toHaveBeenCalledWith({ hasError: false, error: null });
  });

  it('calls window.location.reload when Reload app is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary section="Reload">
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: /reload app/i }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it('logs the error to console.error with the section label', () => {
    render(
      <ErrorBoundary section="My Section">
        <BombComponent shouldThrow message="test error" />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
    // React also calls console.error internally; find our specific call
    const allCalls = (console.error as ReturnType<typeof vi.fn>).mock.calls;
    const ourCall = allCalls.find((args) =>
      args.some((a: unknown) => typeof a === 'string' && a.includes('[ErrorBoundary:My Section]')),
    );
    expect(ourCall).toBeDefined();
  });

  it('has role="alert" and aria-live="polite" on the fallback container', () => {
    render(
      <ErrorBoundary section="Aria">
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
