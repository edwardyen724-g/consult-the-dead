'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';

export default function CompanyBar() {
  const company = useCompanyStore((s) => s.company);
  const setCompanyName = useCompanyStore((s) => s.setCompanyName);
  const setCompanyMission = useCompanyStore((s) => s.setCompanyMission);
  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const connections = useCompanyStore((s) => s.connections);
  const saveIndicatorVisible = useCompanyStore((s) => s.saveIndicatorVisible);
  const exportToJSON = useCompanyStore((s) => s.exportToJSON);
  const importFromJSON = useCompanyStore((s) => s.importFromJSON);

  const openDebatePanel = useDebateStore((s) => s.openDebatePanel);
  const closeDebatePanel = useDebateStore((s) => s.closeDebatePanel);
  const debatePanelOpen = useDebateStore((s) => s.debatePanelOpen);
  const toggleHistoryPanel = useDebateStore((s) => s.toggleHistoryPanel);
  const debateHistory = useDebateStore((s) => s.debateHistory);
  const isDebateRunning = useDebateStore((s) => s.isDebateRunning);
  const hydrateDebates = useDebateStore((s) => s.hydrateDebates);
  const debateHydrated = useDebateStore((s) => s.hydrated);

  // Hydrate debate store on mount
  React.useEffect(() => {
    if (!debateHydrated) {
      hydrateDebates();
    }
  }, [debateHydrated, hydrateDebates]);

  const [editingName, setEditingName] = useState(false);
  const [editingMission, setEditingMission] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const missionRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingMission && missionRef.current) {
      missionRef.current.focus();
      missionRef.current.select();
    }
  }, [editingMission]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = ev.target?.result as string;
        if (json) {
          importFromJSON(json);
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be imported again
      e.target.value = '';
    },
    [importFromJSON]
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* Company info -- left-aligned */}
      <div className="pointer-events-auto ml-4">
        <div className="glass-panel rounded-xl px-5 py-3 inline-block">
          {/* Company name */}
          {editingName ? (
            <input
              ref={nameRef}
              type="text"
              value={company.name}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="text-[22px] font-bold tracking-wide bg-transparent border-none outline-none w-full"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#e4e4e7',
                caretColor: '#e4e4e7',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingName(true)}
              className="text-[22px] font-bold tracking-wide cursor-text transition-colors hover:text-white min-h-[32px]"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: company.name ? '#e4e4e7' : '#3f3f46',
              }}
            >
              {company.name || 'Untitled Company'}
            </div>
          )}

          {/* Mission */}
          {editingMission ? (
            <input
              ref={missionRef}
              type="text"
              value={company.mission}
              onChange={(e) => setCompanyMission(e.target.value)}
              onBlur={() => setEditingMission(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingMission(false)}
              className="text-[12px] tracking-wide bg-transparent border-none outline-none w-full mt-0.5"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: '#a1a1aa',
                caretColor: '#a1a1aa',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingMission(true)}
              className="text-[12px] tracking-wide cursor-text transition-colors hover:text-[#a1a1aa] mt-0.5 min-h-[20px]"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: company.mission ? '#71717a' : '#3f3f46',
              }}
            >
              {company.mission || 'Define your mission...'}
            </div>
          )}
        </div>
      </div>

      {/* Right side: stats, save indicator, export/import */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Save indicator */}
        <AnimatePresence>
          {saveIndicatorVisible && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3 }}
              className="text-[9px] uppercase tracking-[0.14em] px-2.5 py-1"
              style={{
                color: 'rgba(120, 200, 160, 0.7)',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              Saved
            </motion.div>
          )}
        </AnimatePresence>

        {/* Run Debate button */}
        {connections.length > 0 && (
          <button
            onClick={() => debatePanelOpen ? closeDebatePanel() : openDebatePanel()}
            className="glass-panel rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:border-white/10 flex items-center gap-1.5"
            title="Run a debate between connected minds"
            style={{
              borderColor: isDebateRunning ? 'rgba(120, 200, 160, 0.3)' : 'rgba(255,255,255,0.06)',
              background: isDebateRunning ? 'rgba(120, 200, 160, 0.06)' : undefined,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60">
              <path d="M2 1L8.5 5L2 9V1Z" fill="none" stroke={isDebateRunning ? '#78C8A0' : '#a1a1aa'} strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <span
              className="text-[9px] uppercase tracking-[0.12em]"
              style={{
                color: isDebateRunning ? 'rgba(120, 200, 160, 0.8)' : '#71717a',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              {isDebateRunning ? 'Debating...' : 'Debate'}
            </span>
          </button>
        )}

        {/* History button */}
        {debateHistory.length > 0 && (
          <button
            onClick={toggleHistoryPanel}
            className="glass-panel rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:border-white/10 flex items-center gap-1.5"
            title="View past debates"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-50">
              <circle cx="5" cy="5" r="4" fill="none" stroke="#a1a1aa" strokeWidth="1" />
              <path d="M5 3V5.5L7 6.5" fill="none" stroke="#a1a1aa" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span
              className="text-[9px] uppercase tracking-[0.12em]"
              style={{
                color: '#71717a',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              History ({debateHistory.length})
            </span>
          </button>
        )}

        {/* Export button */}
        <button
          onClick={exportToJSON}
          className="glass-panel rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:border-white/10 flex items-center gap-1.5"
          title="Export company as JSON"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-50">
            <path d="M1 6l4 3 4-3M5 1v8" fill="none" stroke="#a1a1aa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="text-[9px] uppercase tracking-[0.12em]"
            style={{
              color: '#71717a',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            Export
          </span>
        </button>

        {/* Import button */}
        <button
          onClick={handleImport}
          className="glass-panel rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:border-white/10 flex items-center gap-1.5"
          title="Import company from JSON"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-50">
            <path d="M1 4l4-3 4 3M5 9V1" fill="none" stroke="#a1a1aa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="text-[9px] uppercase tracking-[0.12em]"
            style={{
              color: '#71717a',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            Import
          </span>
        </button>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Cmd+K hint */}
        <div
          className="glass-panel rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:border-white/10"
          onClick={() => {
            // Simulate Cmd+K keypress to open command palette
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
          }}
          title="Open command palette"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-40">
            <circle cx="4.5" cy="4.5" r="3" fill="none" stroke="#a1a1aa" strokeWidth="1.2" />
            <path d="M7 7L9 9" stroke="#a1a1aa" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <kbd
            className="text-[8px] uppercase tracking-[0.08em] px-1 py-0.5 rounded"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#52525b',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '\u2318K' : 'Ctrl+K'}
          </kbd>
        </div>

        {/* Stats badge */}
        <div className="glass-panel rounded-lg px-3 py-1.5">
          <span
            className="text-[10px] uppercase tracking-[0.15em]"
            style={{
              color: placedMinds.length > 0 ? '#71717a' : '#52525b',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            {placedMinds.length} mind{placedMinds.length !== 1 ? 's' : ''}
            {connections.length > 0 && (
              <span style={{ color: '#52525b' }}> &middot; {connections.length} link{connections.length !== 1 ? 's' : ''}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
