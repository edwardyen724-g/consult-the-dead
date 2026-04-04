'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebateStore } from '@/store/debateStore';
import { useCompanyStore } from '@/store/companyStore';
import { mindsMap } from '@/data/minds';
import { rolesMap } from '@/data/roles';
import { hexToRgb } from '@/lib/colors';
import { appEvents } from '@/lib/events';
import type { Debate, DebateMessage, ResearchSource } from '@/types';

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

  const appendStreamingChunk = useDebateStore((s) => s.appendStreamingChunk);
  const resetStreamingContent = useDebateStore((s) => s.resetStreamingContent);
  const setAbortController = useDebateStore((s) => s.setAbortController);
  const setResearching = useDebateStore((s) => s.setResearching);
  const setResearchBriefing = useDebateStore((s) => s.setResearchBriefing);
  const appendResearchChunk = useDebateStore((s) => s.appendResearchChunk);
  const setResearchSources = useDebateStore((s) => s.setResearchSources);
  const setConverging = useDebateStore((s) => s.setConverging);
  const appendConvergenceChunk = useDebateStore((s) => s.appendConvergenceChunk);
  const setConvergenceContent = useDebateStore((s) => s.setConvergenceContent);

  const [topic, setTopic] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isStarting, setIsStarting] = useState(false);
  const [researchEnabled, setResearchEnabled] = useState(true);
  const [researchFocus, setResearchFocus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 500_000) return; // skip files > 500KB
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setUploadedFiles((prev) => [...prev, { name: file.name, content: text }]);
        }
      };
      reader.readAsText(file);
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

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

    // Create abort controller for cancel capability
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Phase 1: Research (if enabled)
      let briefingText = '';
      let sources: ResearchSource[] = [];

      if (researchEnabled) {
        setResearching(true);
        setResearchBriefing('');

        const researchResponse = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.trim(),
            focus: researchFocus.trim() || undefined,
          }),
          signal: controller.signal,
        });

        if (researchResponse.ok && researchResponse.body) {
          const resReader = researchResponse.body.getReader();
          const resDecoder = new TextDecoder();
          let resBuf = '';

          while (true) {
            const { done, value } = await resReader.read();
            if (done) break;

            resBuf += resDecoder.decode(value, { stream: true });
            const lines = resBuf.split('\n\n');
            resBuf = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === 'research_sources') {
                  sources = event.sources;
                  setResearchSources(sources);
                } else if (event.type === 'research_chunk') {
                  briefingText += event.text;
                  appendResearchChunk(event.text);
                } else if (event.type === 'research_complete') {
                  // research done
                } else if (event.type === 'error') {
                  console.error('Research error:', event.message);
                }
              } catch {
                // skip malformed
              }
            }
          }
        }

        setResearching(false);
      }

      // Phase 2: Debate
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          minds,
          companyName: company.name,
          companyMission: company.mission,
          rounds: 3,
          researchEnabled,
          researchBriefing: briefingText || undefined,
          researchSources: sources.length > 0 ? sources : undefined,
          documents: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.content) : undefined,
        }),
        signal: controller.signal,
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
              const placedMind = participants.find((p) => p.archetypeId === event.mindSlug);
              if (placedMind) {
                setSpeakingMind(placedMind.id);
              }
              resetStreamingContent();
            } else if (event.type === 'chunk') {
              appendStreamingChunk(event.text);
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
              resetStreamingContent();
            } else if (event.type === 'convergence_started') {
              setSpeakingMind(null);
              resetStreamingContent();
              setConverging(true);
            } else if (event.type === 'convergence_chunk') {
              appendConvergenceChunk(event.text);
            } else if (event.type === 'convergence_complete') {
              setConvergenceContent(event.content);
              setConverging(false);
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
      if ((err as Error).name === 'AbortError') {
        setResearching(false);
        return;
      }
      console.error('Debate streaming error:', err);
      failDebate();
    } finally {
      setAbortController(null);
    }
  }, [canStart, isStarting, selectedIds, topic, placedMinds, company, researchEnabled, researchFocus, uploadedFiles, startDebate, addMessage, completeDebate, failDebate, setSpeakingMind, appendStreamingChunk, resetStreamingContent, setAbortController, setResearching, setResearchBriefing, appendResearchChunk, setResearchSources]);

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

      {/* Research toggle */}
      <div className="mb-4 flex items-center justify-between">
        <label
          className="text-[9px] uppercase tracking-[0.14em]"
          style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Include Research
        </label>
        <button
          onClick={() => setResearchEnabled((v) => !v)}
          className="relative w-9 h-5 rounded-full transition-all duration-300"
          style={{
            background: researchEnabled
              ? 'rgba(59, 130, 246, 0.25)'
              : 'rgba(255,255,255,0.06)',
            border: researchEnabled
              ? '1px solid rgba(59, 130, 246, 0.4)'
              : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300"
            style={{
              left: researchEnabled ? '18px' : '3px',
              background: researchEnabled ? '#3b82f6' : 'rgba(255,255,255,0.2)',
              boxShadow: researchEnabled ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Research focus input (shown when research enabled) */}
      {researchEnabled && (
        <div className="mb-4">
          <label
            className="text-[9px] uppercase tracking-[0.14em] block mb-1.5"
            style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            Research Focus (optional)
          </label>
          <input
            type="text"
            value={researchFocus}
            onChange={(e) => setResearchFocus(e.target.value)}
            placeholder="e.g., AI agents, developer tools, hardware"
            className="w-full text-[12px] px-3 py-2 rounded-lg bg-transparent outline-none"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#a1a1aa',
              background: 'rgba(59, 130, 246, 0.03)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              caretColor: '#3b82f6',
            }}
          />
        </div>
      )}

      {/* Document upload */}
      <div className="mb-4">
        <label
          className="text-[9px] uppercase tracking-[0.14em] block mb-1.5"
          style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Reference Documents (optional)
        </label>
        <div
          className="rounded-lg px-3 py-2.5 text-center cursor-pointer transition-all duration-200 hover:border-opacity-30"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <span
            className="text-[10px]"
            style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            Click to upload .txt, .md files
          </span>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {uploadedFiles.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  color: '#a1a1aa',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {f.name}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="ml-0.5 hover:text-red-400 transition-colors"
                  style={{ color: '#52525b' }}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
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

/* ---- Live Streaming Message (shows text as it arrives) ---- */
function StreamingMessage({ archetypeId, content }: { archetypeId: string; content: string }) {
  const arch = mindsMap.get(archetypeId);
  if (!arch || !content) return null;

  const rgb = hexToRgb(arch.accentColor);
  const monogram = arch.name.charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative pl-4"
      style={{ borderLeft: `3px solid rgba(${rgb}, 0.5)` }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(${rgb}, 0.15)`, border: `1px solid rgba(${rgb}, 0.3)` }}
        >
          <span className="text-[11px] font-bold" style={{ color: arch.accentColor, fontFamily: 'var(--font-newsreader), serif' }}>
            {monogram}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: arch.accentColor, fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
          {arch.name}
        </span>
        <div
          className="w-1.5 h-1.5 rounded-full ml-auto"
          style={{ background: arch.accentColor, animation: 'mind-breathe 1s ease-in-out infinite' }}
        />
      </div>
      <div
        className="text-[13px] leading-[1.7] whitespace-pre-wrap"
        style={{ fontFamily: 'var(--font-newsreader), serif', color: 'rgba(255, 255, 255, 0.82)' }}
      >
        {content}
        <span className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom" style={{ background: arch.accentColor, animation: 'mind-breathe 0.8s ease-in-out infinite' }} />
      </div>
    </motion.div>
  );
}

/* ---- Research Briefing Panel ---- */
function ResearchBriefingPanel({ briefing, sources, isStreaming }: { briefing: string; sources: ResearchSource[]; isStreaming: boolean }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!briefing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(59, 130, 246, 0.04)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
      >
        <span style={{ fontSize: '14px' }}>&#x1F4CA;</span>
        <span
          className="text-[10px] uppercase tracking-[0.14em] flex-1 text-left"
          style={{ color: 'rgba(59, 130, 246, 0.8)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Research Briefing
        </span>
        {isStreaming && (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#3b82f6', animation: 'mind-breathe 1s ease-in-out infinite' }}
          />
        )}
        <svg
          width="8" height="8" viewBox="0 0 8 8"
          className="transition-transform duration-200"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', color: '#3b82f6', opacity: 0.5 }}
        >
          <path d="M1 2L4 5L7 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div
            className="text-[12px] leading-[1.8] whitespace-pre-wrap"
            style={{ fontFamily: 'var(--font-newsreader), serif', color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {briefing}
            {isStreaming && (
              <span
                className="inline-block w-[2px] h-[13px] ml-0.5 align-text-bottom"
                style={{ background: '#3b82f6', animation: 'mind-breathe 0.8s ease-in-out infinite' }}
              />
            )}
          </div>

          {/* Source pills */}
          {sources.length > 0 && !isStreaming && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.08)' }}>
              {sources.slice(0, 10).map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[8px] px-2 py-0.5 rounded-full transition-all duration-200 hover:bg-blue-500/10 truncate max-w-[200px]"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    color: 'rgba(59, 130, 246, 0.7)',
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.12)',
                    textDecoration: 'none',
                  }}
                  title={s.title}
                >
                  {s.title.length > 35 ? s.title.slice(0, 35) + '...' : s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ---- Post-Debate Synthesis ---- */
function DebateSynthesis() {
  const convergenceContent = useDebateStore((s) => s.convergenceContent);
  const isConverging = useDebateStore((s) => s.isConverging);

  if (!convergenceContent && !isConverging) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 px-5 py-4 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(120, 200, 160, 0.06) 0%, rgba(100, 140, 200, 0.06) 100%)',
        border: '1px solid rgba(120, 200, 160, 0.15)',
        boxShadow: '0 4px 20px rgba(120, 200, 160, 0.05)',
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.16em] mb-3 flex items-center gap-2"
        style={{ color: 'rgba(120, 200, 160, 0.8)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 1v4M6 7v4M1 6h4M7 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {isConverging ? 'Synthesizing Consensus...' : 'Convergence Synthesis'}
      </div>
      <div
        className="text-[13px] leading-[1.8] whitespace-pre-wrap"
        style={{ fontFamily: 'var(--font-newsreader), serif', color: 'rgba(255, 255, 255, 0.75)' }}
      >
        {convergenceContent}
        {isConverging && (
          <span
            className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
            style={{ background: 'rgba(120, 200, 160, 0.6)', animation: 'mind-breathe 1s ease-in-out infinite' }}
          />
        )}
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
  const cancelDebate = useDebateStore((s) => s.cancelDebate);
  const speakingMindId = useDebateStore((s) => s.speakingMindId);
  const streamingContent = useDebateStore((s) => s.streamingContent);
  const isResearching = useDebateStore((s) => s.isResearching);
  const researchBriefing = useDebateStore((s) => s.researchBriefing);
  const researchSources = useDebateStore((s) => s.researchSources);
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

  const convergenceContent = useDebateStore((s) => s.convergenceContent);
  const isConverging = useDebateStore((s) => s.isConverging);

  // Auto-scroll to bottom on new messages, streaming content, and convergence
  useEffect(() => {
    if (!userScrolled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeDebate?.messages.length, streamingContent, convergenceContent, userScrolled]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setUserScrolled(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Resolve the currently speaking archetype ID for live streaming display
  const speakingArchetypeId = useMemo(() => {
    if (!speakingMindId) return null;
    const pm = placedMinds.find((p) => p.id === speakingMindId);
    return pm?.archetypeId || null;
  }, [speakingMindId, placedMinds]);

  // Get the speaking mind archetype for display
  const speakingArchetype = useMemo(() => {
    if (!speakingArchetypeId) return null;
    return mindsMap.get(speakingArchetypeId) || null;
  }, [speakingArchetypeId]);

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
            height: activeDebate && !isDebateRunning ? '70vh' : '50vh',
            minHeight: 340,
            maxHeight: '85vh',
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
              {isResearching && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#3b82f6', animation: 'mind-breathe 1s ease-in-out infinite' }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-[0.12em]"
                    style={{ color: '#3b82f6', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    Researching...
                  </span>
                </div>
              )}
              {isDebateRunning && !isResearching && speakingArchetype && (
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
              {/* Cancel/Stop button during active debate */}
              {isDebateRunning && (
                <button
                  onClick={cancelDebate}
                  className="text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded transition-all duration-200 hover:bg-red-500/10 flex items-center gap-1.5"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    color: '#F44336',
                    border: '1px solid rgba(244, 67, 54, 0.2)',
                    background: 'rgba(244, 67, 54, 0.05)',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
                  </svg>
                  Stop
                </button>
              )}
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

                {/* Research Briefing */}
                {(researchBriefing || isResearching) && (
                  <>
                    {isResearching && !researchBriefing && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#3b82f6', animation: 'mind-breathe 1s ease-in-out infinite' }}
                          />
                          <span
                            className="text-[10px] uppercase tracking-[0.14em]"
                            style={{ color: 'rgba(59, 130, 246, 0.6)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                          >
                            Researching...
                          </span>
                        </div>
                      </div>
                    )}
                    <ResearchBriefingPanel
                      briefing={researchBriefing}
                      sources={researchSources}
                      isStreaming={isResearching}
                    />
                  </>
                )}

                {/* Messages */}
                {activeDebate.messages.map((msg) => (
                  <DebateMessageItem
                    key={msg.id}
                    message={msg}
                  />
                ))}

                {/* Live streaming text — shows chunks as they arrive */}
                {isDebateRunning && streamingContent && speakingArchetypeId && (
                  <StreamingMessage
                    archetypeId={speakingArchetypeId}
                    content={streamingContent}
                  />
                )}

                {/* Running indicator when no messages and no streaming content yet */}
                {isDebateRunning && activeDebate.messages.length === 0 && !streamingContent && (
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

                {/* Convergence synthesis — shows during AND after convergence */}
                {(isConverging || convergenceContent) && (
                  <DebateSynthesis />
                )}

                {/* Completion indicator */}
                {activeDebate.status === 'complete' && !isConverging && (
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
