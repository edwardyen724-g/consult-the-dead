import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('Loading', () => {
  it('renders without crashing', () => {
    render(<Loading />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has an accessible label', () => {
    render(<Loading />);
    expect(screen.getByRole('main', { name: /loading company builder/i })).toBeInTheDocument();
  });

  it('renders the Mind Library pane header', () => {
    render(<Loading />);
    expect(screen.getByText('Mind Library')).toBeInTheDocument();
  });

  it('renders the Canvas pane header', () => {
    render(<Loading />);
    expect(screen.getByText('Canvas')).toBeInTheDocument();
  });

  it('renders the Panels pane header', () => {
    render(<Loading />);
    expect(screen.getByText('Panels')).toBeInTheDocument();
  });

  it('renders the canvas initializing label', () => {
    render(<Loading />);
    expect(screen.getByText(/initializing command center/i)).toBeInTheDocument();
  });

  it('renders the canvas loading description text', () => {
    render(<Loading />);
    expect(
      screen.getByText(/loading company memory, panels, and canvas state/i),
    ).toBeInTheDocument();
  });
});
