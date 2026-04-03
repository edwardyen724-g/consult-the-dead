'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateStore } from '@/store/debateStore';
import { mindsMap } from '@/data/minds';
import type { Debate } from '@/types';

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function DebateEntry({ debate }: { debate: Debate }) {
  const loadHistoricalDebate = useDebateStore((s) => s.loadHistoricalDebate);
  const firstMessage = debate.messages[0];
  const preview = firstMessage?.content.slice(0, 120) + (firstMessage?.content.length > 120 ? '...' : '');

  return (
    <button
      onClick={() => loadHistoricalDebate(debate)}
      className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/[0.03]"
      style={{
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Timestamp + participants */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[8px] uppercase tracking-[0.12em]"
          style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {formatTimestamp(debate.startedAt)}
        </span>
        <div className="flex items-center gap-1">
          {debate.participantArchetypeIds.map((archId) => {
            const arch = mindsMap.get(archId);
            if (!arch) return null;
            return (
              <div
                key={archId}
                className="w-2 h-2 rounded-full"
                style={{ background: arch.accentColor }}
                title={arch.name}
              />
            );
          })}
        </div>
      </div>

      {/* Topic */}
      <div
        className="text-[12px] italic leading-snug mb-1"
        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-newsreader), serif' }}
      >
        {debate.topic}
      </div>

      {/* Preview */}
      {preview && (
        <div
          className="text-[10px] leading-relaxed"
          style={{ color: '#52525b', fontFamily: 'var(--font-newsreader), serif' }}
        >
          {preview}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className="text-[8px] uppercase tracking-[0.1em]"
          style={{ color: '#3f3f46', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {debate.messages.length} messages
        </span>
        <span
          className="text-[8px] uppercase tracking-[0.1em]"
          style={{
            color: debate.status === 'complete' ? '#4CAF50' : debate.status === 'error' ? '#F44336' : '#FFC107',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
          }}
        >
          {debate.status}
        </span>
      </div>
    </button>
  );
}

export default function DebateHistory() {
  const historyPanelOpen = useDebateStore((s) => s.historyPanelOpen);
  const debateHistory = useDebateStore((s) => s.debateHistory);
  const closeHistoryPanel = useDebateStore((s) => s.closeHistoryPanel);

  return (
    <AnimatePresence>
      {historyPanelOpen && (
        <motion.div
          key="history-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full flex flex-col custom-scrollbar"
          style={{
            width: 320,
            zIndex: 32,
            background: 'rgba(10, 10, 18, 0.94)',
            backdropFilter: 'blur(28px) saturate(1.3)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
            <h2
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#a1a1aa' }}
            >
              Debate History
            </h2>
            <button
              onClick={closeHistoryPanel}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a' }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Debate list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2">
            {debateHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span
                  className="text-[11px] italic"
                  style={{ color: '#3f3f46', fontFamily: 'var(--font-newsreader), serif' }}
                >
                  No past debates yet
                </span>
              </div>
            ) : (
              debateHistory.map((debate) => (
                <DebateEntry key={debate.id} debate={debate} />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
