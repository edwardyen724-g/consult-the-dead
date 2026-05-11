'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { minds, mindsMap } from '@/data/minds';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';
import { hexToRgb } from '@/lib/colors';
import { appEvents } from '@/lib/events';
import { useFocusRestore } from '@/components/shared/useFocusRestore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: 'mind' | 'action' | 'panel' | 'export';
  accentColor?: string;
  action: () => void;
  keywords: string[];
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function getIconSvg(icon: CommandItem['icon']) {
  switch (icon) {
    case 'mind':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'action':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 1L9.5 6L3 11V1Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    case 'panel':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 1V11" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'export':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 7.5l4 3 4-3M6 1.5v9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function CommandPaletteDialog({
  commands,
  onClose,
}: {
  commands: CommandItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter(
      (cmd) => fuzzyMatch(query, cmd.label) || cmd.keywords.some((kw) => fuzzyMatch(query, kw)),
    );
  }, [commands, query]);

  const normalizedSelectedIndex = filtered.length === 0 ? 0 : Math.min(selectedIndex, filtered.length - 1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[normalizedSelectedIndex]?.action();
      }
    },
    [filtered, normalizedSelectedIndex],
  );

  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.children[normalizedSelectedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [normalizedSelectedIndex]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0"
        style={{ zIndex: 100, background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 rounded-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          zIndex: 101,
          top: '18%',
          transform: 'translateX(-50%)',
          width: 520,
          maxWidth: 'calc(100vw - 40px)',
          background: 'rgba(12, 12, 20, 0.94)',
          backdropFilter: 'blur(32px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: '#52525b', flexShrink: 0 }}>
            <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search minds, actions..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#e4e4e7',
              caretColor: '#e4e4e7',
            }}
          />
          <kbd
            className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#52525b',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[320px] overflow-y-auto custom-scrollbar py-1">
          {filtered.length === 0 ? (
            <div
              className="text-center py-8 text-[11px] italic"
              style={{
                color: '#52525b',
                fontFamily: 'var(--font-newsreader), serif',
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const isSelected = i === normalizedSelectedIndex;
              const rgb = cmd.accentColor ? hexToRgb(cmd.accentColor) : '161, 161, 170';

              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                  style={{
                    background: isSelected
                      ? cmd.accentColor
                        ? `rgba(${rgb}, 0.08)`
                        : 'rgba(255, 255, 255, 0.04)'
                      : 'transparent',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: cmd.accentColor ? `rgba(${rgb}, 0.12)` : 'rgba(255, 255, 255, 0.04)',
                      color: cmd.accentColor || '#71717a',
                      border: `1px solid ${cmd.accentColor ? `rgba(${rgb}, 0.2)` : 'rgba(255, 255, 255, 0.06)'}`,
                    }}
                  >
                    {getIconSvg(cmd.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[12px] tracking-wide truncate"
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        color: isSelected ? '#e4e4e7' : '#a1a1aa',
                      }}
                    >
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div
                        className="text-[10px] truncate mt-0.5"
                        style={{
                          fontFamily: 'var(--font-newsreader), serif',
                          color: '#52525b',
                        }}
                      >
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <kbd
                      className="text-[8px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        color: '#52525b',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      Enter
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 flex items-center gap-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <span
            className="text-[9px] uppercase tracking-[0.1em] flex items-center gap-1.5"
            style={{
              color: '#3f3f46',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            <kbd style={{ background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              &uarr;&darr;
            </kbd>
            navigate
          </span>
          <span
            className="text-[9px] uppercase tracking-[0.1em] flex items-center gap-1.5"
            style={{
              color: '#3f3f46',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            <kbd style={{ background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              &crarr;
            </kbd>
            select
          </span>
          <span
            className="text-[9px] uppercase tracking-[0.1em] flex items-center gap-1.5 ml-auto"
            style={{
              color: '#3f3f46',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            <kbd style={{ background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}+K
            </kbd>
            toggle
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  useFocusRestore(isOpen);

  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const connections = useCompanyStore((s) => s.connections);
  const exportToJSON = useCompanyStore((s) => s.exportToJSON);
  const setSelectedMindId = useCompanyStore((s) => s.setSelectedMindId);

  const openDebatePanel = useDebateStore((s) => s.openDebatePanel);
  const toggleHistoryPanel = useDebateStore((s) => s.toggleHistoryPanel);
  const debatePanelOpen = useDebateStore((s) => s.debatePanelOpen);
  const closeDebatePanel = useDebateStore((s) => s.closeDebatePanel);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const bridge = window as Window & {
      __CTD_OPEN_COMMAND_PALETTE__?: () => void;
      __CTD_CLOSE_COMMAND_PALETTE__?: () => void;
    };

    bridge.__CTD_OPEN_COMMAND_PALETTE__ = () => setIsOpen(true);
    bridge.__CTD_CLOSE_COMMAND_PALETTE__ = () => setIsOpen(false);

    return () => {
      delete bridge.__CTD_OPEN_COMMAND_PALETTE__;
      delete bridge.__CTD_CLOSE_COMMAND_PALETTE__;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          appEvents.emit(next ? 'command_palette.opened' : 'command_palette.closed');
          return next;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        appEvents.emit('command_palette.closed');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    placedMinds.forEach((pm) => {
      const arch = mindsMap.get(pm.archetypeId);
      if (!arch) return;
      items.push({
        id: `mind-${pm.id}`,
        label: arch.name,
        description: 'Jump to mind on canvas',
        icon: 'mind',
        accentColor: arch.accentColor,
        keywords: [arch.name, arch.archetype, arch.domain, 'jump', 'go to', 'find', 'select'],
        action: () => {
          setSelectedMindId(pm.id);
          setIsOpen(false);
        },
      });
    });

    if (connections.length > 0) {
      items.push({
        id: 'start-debate',
        label: 'Start Debate',
        description: 'Open the debate panel to start a new discussion',
        icon: 'action',
        accentColor: '#78C8A0',
        keywords: ['debate', 'start', 'discuss', 'conversation', 'run'],
        action: () => {
          openDebatePanel();
          setIsOpen(false);
        },
      });
    }

    items.push({
      id: 'export-company',
      label: 'Export Company',
      description: 'Download company configuration as JSON',
      icon: 'export',
      keywords: ['export', 'save', 'download', 'json', 'backup'],
      action: () => {
        exportToJSON();
        setIsOpen(false);
      },
    });

    items.push({
      id: 'toggle-sidebar',
      label: 'Toggle Mind Library',
      description: 'Show or hide the mind library sidebar',
      icon: 'panel',
      keywords: ['sidebar', 'library', 'toggle', 'minds', 'panel', 'hide', 'show'],
      action: () => {
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
        setIsOpen(false);
      },
    });

    items.push({
      id: 'toggle-debate-panel',
      label: debatePanelOpen ? 'Close Debate Panel' : 'Open Debate Panel',
      description: 'Toggle the debate panel visibility',
      icon: 'panel',
      keywords: ['debate', 'panel', 'toggle', 'close', 'open'],
      action: () => {
        if (debatePanelOpen) {
          closeDebatePanel();
        } else {
          openDebatePanel();
        }
        setIsOpen(false);
      },
    });

    items.push({
      id: 'toggle-history',
      label: 'Toggle Debate History',
      description: 'Show or hide past debates',
      icon: 'panel',
      keywords: ['history', 'past', 'debates', 'archive', 'toggle'],
      action: () => {
        toggleHistoryPanel();
        setIsOpen(false);
      },
    });

    const placedArchetypeIds = new Set(placedMinds.map((pm) => pm.archetypeId));
    minds.forEach((mind) => {
      if (placedArchetypeIds.has(mind.id)) return;
      items.push({
        id: `place-${mind.id}`,
        label: `Place ${mind.name}`,
        description: `Add ${mind.name} to the canvas`,
        icon: 'mind',
        accentColor: mind.accentColor,
        keywords: [mind.name, mind.archetype, mind.domain, 'place', 'add', 'deploy'],
        action: () => {
          window.dispatchEvent(new CustomEvent('place-mind', { detail: { archetypeId: mind.id } }));
          setIsOpen(false);
        },
      });
    });

    return items;
  }, [placedMinds, connections, debatePanelOpen, setSelectedMindId, openDebatePanel, closeDebatePanel, toggleHistoryPanel, exportToJSON]);

  if (!isOpen) return null;

  return <CommandPaletteDialog key="command-palette" commands={commands} onClose={() => {
    setIsOpen(false);
    appEvents.emit('command_palette.closed');
  }} />;
}
