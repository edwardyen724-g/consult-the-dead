import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from '../error';

const originalConsoleError = console.error;

beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Error page (app/error.tsx)', () => {
  it('renders without crashing', () => {
    const error = new Error('test failure');
    const reset = vi.fn();
    render(<ErrorPage error={error} reset={reset} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows the section heading', () => {
    const error = new Error('whoops');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText(/command center fault/i)).toBeInTheDocument();
  });

  it('shows the descriptive heading', () => {
    const error = new Error('whoops');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /unexpected runtime error/i })).toBeInTheDocument();
  });

  it('shows the "Retry route" button', () => {
    const error = new Error('test');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /retry route/i })).toBeInTheDocument();
  });

  it('calls reset when "Retry route" is clicked', () => {
    const reset = vi.fn();
    const error = new Error('test');
    render(<ErrorPage error={error} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /retry route/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('shows the "Reload app" button', () => {
    const error = new Error('test');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument();
  });

  it('calls window.location.reload when "Reload app" is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    const error = new Error('test');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /reload app/i }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it('displays the error digest when present', () => {
    const error = Object.assign(new Error('test'), { digest: 'abc123' });
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText(/digest abc123/i)).toBeInTheDocument();
  });

  it('displays the error message when no digest', () => {
    const error = new Error('something broke');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText('something broke')).toBeInTheDocument();
  });

  it('logs the error to console.error on mount', () => {
    const error = new Error('log me');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(console.error).toHaveBeenCalledWith('[company-builder/app]', error);
  });

  it('has role="alert" and aria-live="assertive" on the section', () => {
    const error = new Error('test');
    render(<ErrorPage error={error} reset={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
