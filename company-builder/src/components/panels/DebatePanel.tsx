'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateStore } from '@/store/debateStore';
import { useCompanyStore } from '@/store/companyStore';
import { mindsMap } from '@/data/minds';
import { rolesMap } from '@/data/roles';
import { hexToRgb } from '@/lib/colors';
import { appEvents } from '@/lib/events';
import type { Debate, DebateMessage } from '@/types';

/* ---- Debate Setup Modal ---- */
function DebateSetup({ onClose }: { onClose: () => void }) {
  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const connections = useCompanyStore((s) => s.connections);
  const company = useCompanyStore((s) => s.company);
  const startDebate = useDebateStore((s) => s.startDebate);
  const addMessage = useDebateStore((s) => s.addMessage);
  const completeDebate = useDebateStore((s) => s.completeDebate);
  const failDebate = useDebateStore((s) => s.failDebate);
  const setSpeakingMind = useDebateStore((s) => s.setSpeakingMind);

  const [topic, setTopic] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isStarting, setIsStarting] = useState(false);

  // Find minds that have connections
  const connectedMindIds = useMemo(() => {
    const ids = new Set<string>();
    connections.forEach((c) => {
      ids.add(c.sourceId);
      ids.add(c.targetId);
    });
    return ids;
  }, [connections]);

  const eligibleMinds = useMemo(() => {
    return placedMinds.filter((pm) => connectedMindIds.has(pm.id));
  }, [placedMinds, connectedMindIds]);

  const toggleMind = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const canStart = selectedIds.size >= 2 && topic.trim().length > 0;

  const handleStart = useCallback(async () => {
    if (!canStart || isStarting) return;
    setIsStarting(true);

    const participants = placedMinds.filter((pm) => selectedIds.has(pm.id));
    const debateId = `debate-${Date.now()}`;

    const debate: Debate = {
      id: debateId,
      topic: topic.trim(),
      participantIds: participants.map((p) => p.id),
      participantArchetypeIds: participants.map((p) => p.archetypeId),
      messages: [],
      status: 'running',
      startedAt: new Date().toISOString(),
      companyName: company.name,
      companyMission: company.mission,
    };

    startDebate(debate);

    // Build the minds payload for the API
    const minds = participants.map((p) => {
      const archetype = mindsMap.get(p.archetypeId);
      const role = p.role ? rolesMap.get(p.role) : null;
      return {
        slug: p.archetypeId,
        name: archetype?.name ?? 'Unknown',
        role: role?.label ?? 'Unassigned',
      };
    });

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          minds,
          companyName: company.name,
          companyMission: company.mission,
          rounds: 3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'speaking') {
              // Find the placed mind ID from the slug
              const placedMind = participants.find((p) => p.archetypeId === event.mindSlug);
              if (placedMind) {
                setSpeakingMind(placedMind.id);
              }
            } else if (event.type === 'message_complete') {
              const placedMind = participants.find((p) => p.archetypeId === event.mindSlug);
              const msg: DebateMessage = {
                id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                mindId: placedMind?.id ?? '',
                archetypeId: event.mindSlug,
                content: event.content,
                round: event.round,
                timestamp: new Date().toISOString(),
              };
              addMessage(msg);
            } else if (event.type === 'debate_complete') {
              completeDebate();
            } else if (event.type === 'error') {
              console.error('Debate error:', event.message);
              failDebate();
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      console.error('Debate streaming error:', err);
      failDebate();
    }
  }, [canStart, isStarting, selectedIds, topic, placedMinds, company, startDebate, addMessage, completeDebate, failDebate, setSpeakingMind]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-[11px] uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#a1a1aa' }}
        >
          New Debate
        </h2>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a' }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Topic input */}
      <div className="mb-4">
        <label
          className="text-[9px] uppercase tracking-[0.14em] block mb-1.5"
          style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Topic / Question
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Should we pursue theoretical research or applied prototyping first?"
          className="w-full text-[13px] px-3 py-2.5 rounded-lg bg-transparent outline-none"
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            color: '#e4e4e7',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            caretColor: '#e4e4e7',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
      </div>

      {/* Mind selection */}
      <div className="mb-4">
        <label
          className="text-[9px] uppercase tracking-[0.14em] block mb-1.5"
          style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Select 2-3 Connected Minds
        </label>
        <div className="space-y-1.5">
          {eligibleMinds.map((pm) => {
            const arch = mindsMap.get(pm.archetypeId);
            if (!arch) return null;
            const isSelected = selectedIds.has(pm.id);
            const rgb = hexToRgb(arch.accentColor);
            const role = pm.role ? rolesMap.get(pm.role) : null;

            return (
              <button
                key={pm.id}
                onClick={() => toggleMind(pm.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: isSelected ? `rgba(${rgb}, 0.08)` : 'rgba(255,255,255,0.02)',
                  border: isSelected ? `1px solid rgba(${rgb}, 0.3)` : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: isSelected ? arch.accentColor : 'rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? `0 0 8px rgba(${rgb}, 0.4)` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
                <span
                  className="text-[11px] tracking-wide flex-1 text-left"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: isSelected ? '#e4e4e7' : '#71717a' }}
                >
                  {arch.name}
                </span>
                {role && (
                  <span
                    className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      color: role.color,
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {role.shortLabel}
                  </span>
                )}
              </button>
            );
          })}
          {eligibleMinds.length === 0 && (
            <div
              className="text-[11px] italic py-3 text-center"
              style={{ color: '#52525b', fontFamily: 'var(--font-newsreader), serif' }}
            >
              Connect at least 2 minds on the canvas to enable debates
            </div>
          )}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart || isStarting}
        className="w-full py-2.5 rounded-lg text-[10px] uppercase tracking-[0.14em] transition-all duration-300"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          background: canStart ? 'rgba(120, 200, 160, 0.12)' : 'rgba(255,255,255,0.03)',
          border: canStart ? '1px solid rgba(120, 200, 160, 0.3)' : '1px solid rgba(255,255,255,0.06)',
          color: canStart ? 'rgba(120, 200, 160, 0.9)' : '#52525b',
          cursor: canStart ? 'pointer' : 'not-allowed',
        }}
      >
        {isStarting ? 'Starting...' : 'Start Debate'}
      </button>
    </div>
  );
}

/* ---- Debate Thread Message ---- */
function DebateMessageItem({ message, isStreaming }: { message: DebateMessage; isStreaming?: boolean }) {
  const arch = mindsMap.get(message.archetypeId);
  if (!arch) return null;

  const rgb = hexToRgb(arch.accentColor);
  const monogram = arch.name.charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative pl-4"
      style={{
        borderLeft: `3px solid rgba(${rgb}, 0.5)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `rgba(${rgb}, 0.15)`,
            border: `1px solid rgba(${rgb}, 0.3)`,
          }}
        >
          <span
            className="text-[11px] font-bold"
            style={{ color: arch.accentColor, fontFamily: 'var(--font-newsreader), serif' }}
          >
            {monogram}
          </span>
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{ color: arch.accentColor, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {arch.name}
        </span>
        <span
          className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
          style={{
            color: '#52525b',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          Round {message.round}
        </span>
        {isStreaming && (
          <div
            className="w-1.5 h-1.5 rounded-full ml-auto"
            style={{
              background: arch.accentColor,
              animation: 'mind-breathe 1s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Body */}
      <div
        className="text-[13px] leading-[1.7] whitespace-pre-wrap"
        style={{
          fontFamily: 'var(--font-newsreader), serif',
          color: 'rgba(255, 255, 255, 0.82)',
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

/* ---- Main Debate Panel ---- */
export default function DebatePanel() {
  const debatePanelOpen = useDebateStore((s) => s.debatePanelOpen);
  const activeDebate = useDebateStore((s) => s.activeDebate);
  const isDebateRunning = useDebateStore((s) => s.isDebateRunning);
  const closeDebatePanel = useDebateStore((s) => s.closeDebatePanel);
  const speakingMindId = useDebateStore((s) => s.speakingMindId);
  const placedMinds = useCompanyStore((s) => s.placedMinds);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  // Auto-open setup when panel opens without active debate
  useEffect(() => {
    if (debatePanelOpen && !activeDebate) {
      setShowSetup(true);
    }
  }, [debatePanelOpen, activeDebate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!userScrolled && scrollRef.current && activeDebate?.messages.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeDebate?.messages.length, userScrolled]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user scrolled up more than 100px from bottom, stop auto-scroll
    setUserScrolled(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Get the speaking mind archetype for display
  const speakingArchetype = useMemo(() => {
    if (!speakingMindId) return null;
    const pm = placedMinds.find((p) => p.id === speakingMindId);
    if (!pm) return null;
    return mindsMap.get(pm.archetypeId) || null;
  }, [speakingMindId, placedMinds]);

  if (!debatePanelOpen) return null;

  return (
    <AnimatePresence>
      {debatePanelOpen && (
        <motion.div
          key="debate-panel"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 flex flex-col custom-scrollbar"
          style={{
            height: '50vh',
            minHeight: 340,
            maxHeight: '70vh',
            zIndex: 35,
            background: 'rgba(10, 10, 18, 0.95)',
            backdropFilter: 'blur(28px) saturate(1.3)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top accent line */}
          <div
            className="h-[1px] w-full"
            style={{
              background: isDebateRunning
                ? 'linear-gradient(90deg, transparent, rgba(120, 200, 160, 0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              animation: isDebateRunning ? 'debate-line-pulse 2s ease-in-out infinite' : 'none',
            }}
          />

          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#a1a1aa' }}
              >
                {activeDebate ? 'Debate' : 'New Debate'}
              </h2>
              {activeDebate && (
                <span
                  className="text-[12px] italic max-w-[300px] truncate"
                  style={{ fontFamily: 'var(--font-newsreader), serif', color: '#71717a' }}
                >
                  {activeDebate.topic}
                </span>
              )}
              {isDebateRunning && speakingArchetype && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: speakingArchetype.accentColor,
                      animation: 'mind-breathe 1s ease-in-out infinite',
                    }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-[0.12em]"
                    style={{
                      color: speakingArchetype.accentColor,
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                    }}
                  >
                    {speakingArchetype.name} is thinking...
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeDebate && !isDebateRunning && (
                <button
                  onClick={() => { setShowSetup(true); }}
                  className="text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded transition-colors hover:bg-white/5"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    color: '#71717a',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  New Debate
                </button>
              )}
              <button
                onClick={closeDebatePanel}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Content area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4"
          >
            {showSetup && !isDebateRunning ? (
              <DebateSetup onClose={() => {
                setShowSetup(false);
                if (!activeDebate) closeDebatePanel();
              }} />
            ) : activeDebate ? (
              <div className="space-y-5 max-w-3xl mx-auto">
                {/* Topic header */}
                <div className="text-center mb-6">
                  <div
                    className="text-[9px] uppercase tracking-[0.16em] mb-1"
                    style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    Topic
                  </div>
                  <div
                    className="text-[15px] italic"
                    style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-newsreader), serif' }}
                  >
                    &ldquo;{activeDebate.topic}&rdquo;
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {activeDebate.participantArchetypeIds.map((archId) => {
                      const arch = mindsMap.get(archId);
                      if (!arch) return null;
                      return (
                        <span
                          key={archId}
                          className="text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                          style={{
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            color: arch.accentColor,
                            background: `rgba(${hexToRgb(arch.accentColor)}, 0.1)`,
                            border: `1px solid rgba(${hexToRgb(arch.accentColor)}, 0.2)`,
                          }}
                        >
                          {arch.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Messages */}
                {activeDebate.messages.map((msg, i) => (
                  <DebateMessageItem
                    key={msg.id}
                    message={msg}
                    isStreaming={isDebateRunning && i === activeDebate.messages.length - 1}
                  />
                ))}

                {/* Running indicator when no messages yet */}
                {isDebateRunning && activeDebate.messages.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/50" style={{ animation: 'mind-breathe 1s ease-in-out infinite' }} />
                      <span
                        className="text-[10px] uppercase tracking-[0.14em]"
                        style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                      >
                        Debate starting...
                      </span>
                    </div>
                  </div>
                )}

                {/* Completion indicator */}
                {activeDebate.status === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4 mt-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <span
                      className="text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      Debate complete &middot; {activeDebate.messages.length} exchanges
                    </span>
                  </motion.div>
                )}

                {activeDebate.status === 'error' && (
                  <div className="text-center py-4 mt-2">
                    <span
                      className="text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: '#F44336', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      Debate encountered an error
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span
                  className="text-[11px] italic"
                  style={{ color: '#52525b', fontFamily: 'var(--font-newsreader), serif' }}
                >
                  No active debate
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
