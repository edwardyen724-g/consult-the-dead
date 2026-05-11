import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusRestore } from '../useFocusRestore';

// A helper component that exercises the hook
function Dialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useFocusRestore(open);
  if (!open) return null;
  return (
    <div role="dialog">
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button id="trigger" onClick={() => setOpen(true)} aria-label="open dialog">
        Open
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

describe('useFocusRestore', () => {
  it('returns focus to the previously focused element when dialog closes', () => {
    render(<Harness />);
    const trigger = screen.getByLabelText('open dialog');

    // Focus the trigger, then open the dialog
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close the dialog
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    // Focus should be restored to the trigger
    expect(document.activeElement).toBe(trigger);
  });

  it('does nothing when active is false from the start', () => {
    // Render with active=false — previousFocusRef should stay null and no error thrown
    function StaticHook() {
      useFocusRestore(false);
      return <button>static</button>;
    }
    render(<StaticHook />);
    expect(screen.getByRole('button', { name: /static/i })).toBeInTheDocument();
  });

  it('handles the case where document.activeElement is not an HTMLElement', () => {
    // Temporarily mock document.activeElement to return something that is NOT
    // an HTMLElement (e.g. null or an SVGElement stub), so the else branch fires.
    const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement');
    Object.defineProperty(document, 'activeElement', {
      get: () => null,
      configurable: true,
    });

    function HookWithNullFocus() {
      useFocusRestore(true);
      return <span>content</span>;
    }

    // Should mount and unmount without throwing even though activeElement is null
    const { unmount } = render(<HookWithNullFocus />);
    unmount();

    // Restore original descriptor
    if (originalDescriptor) {
      Object.defineProperty(document, 'activeElement', originalDescriptor);
    }
  });
});
