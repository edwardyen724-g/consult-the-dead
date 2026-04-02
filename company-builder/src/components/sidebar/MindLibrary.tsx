'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { minds } from '@/data/minds';
import { useCompanyStore } from '@/store/companyStore';
import type { DomainCategory, MindArchetype, PlacedMind } from '@/types';

const categories: { id: DomainCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'science', label: 'SCIENCE' },
  { id: 'strategy', label: 'STRATEGY' },
  { id: 'governance', label: 'GOVERN' },
  { id: 'art', label: 'ART' },
  { id: 'computing', label: 'COMPUTE' },
];

function MindCard({ mind }: { mind: MindArchetype }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const addMind = useCompanyStore((s) => s.addMind);
  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const setDraggingFromSidebar = useCompanyStore((s) => s.setDraggingFromSidebar);

  const rgb = hexToRgb(mind.accentColor);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/mindId', mind.id);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setDraggingFromSidebar(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    setDraggingFromSidebar(false);
  };

  const handleClick = () => {
    // Place mind at a staggered position based on how many are already placed
    const count = placedMinds.length;
    const newMind: PlacedMind = {
      id: `${mind.id}-${Date.now()}`,
      archetypeId: mind.id,
      role: null,
      position: {
        x: 100 + (count % 3) * 250,
        y: 80 + Math.floor(count / 3) * 200,
      },
    };
    addMind(newMind);
  };

  const monogram = mind.name.charAt(0).toUpperCase();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 select-none overflow-hidden"
      style={{
        background: isHovered
          ? `radial-gradient(ellipse at center, rgba(${rgb}, 0.08) 0%, transparent 70%), rgba(18, 18, 30, 0.7)`
          : 'rgba(18, 18, 30, 0.4)',
        border: `1px solid ${isHovered ? `rgba(${rgb}, 0.25)` : 'rgba(255,255,255,0.04)'}`,
        boxShadow: isDragging
          ? `0 0 30px rgba(${rgb}, 0.25), 0 0 60px rgba(${rgb}, 0.08)`
          : isHovered
            ? `0 0 20px rgba(${rgb}, 0.12)`
            : 'none',
        transform: isDragging ? 'scale(0.97)' : 'scale(1)',
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: `linear-gradient(180deg, ${mind.accentColor}, transparent)`,
          opacity: isHovered ? 0.8 : 0.3,
          transition: 'opacity 0.2s ease',
        }}
      />

      <div className="px-3 py-2.5 pl-4">
        {/* Name row with monogram */}
        <div className="flex items-center gap-2.5 mb-1">
          {/* Monogram */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `radial-gradient(circle, rgba(${rgb}, 0.2) 0%, rgba(${rgb}, 0.05) 70%)`,
              border: `1px solid rgba(${rgb}, 0.3)`,
              boxShadow: isHovered ? `0 0 8px rgba(${rgb}, 0.2)` : 'none',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{
                color: mind.accentColor,
                fontFamily: 'var(--font-newsreader), serif',
              }}
            >
              {monogram}
            </span>
          </div>

          <span
            className="text-[12px] font-medium tracking-wide truncate flex-1"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#e4e4e7',
            }}
          >
            {mind.name}
          </span>
          {isHovered && (
            <span
              className="text-[10px] flex-shrink-0 w-4 h-4 flex items-center justify-center rounded"
              style={{
                background: `rgba(${rgb}, 0.2)`,
                color: mind.accentColor,
              }}
            >
              +
            </span>
          )}
        </div>

        {/* Archetype + Domain */}
        <div className="flex items-center gap-2 ml-[34px]">
          <span
            className="text-[9px] uppercase tracking-[0.12em]"
            style={{
              color: mind.accentColor,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            {mind.archetype}
          </span>
          <span
            className="text-[9px] uppercase tracking-[0.08em]"
            style={{
              color: '#52525b',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            {mind.domain}
          </span>
        </div>

        {/* Hover reveal: one-liner */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="ml-[34px] overflow-hidden"
            >
              <div
                className="text-[10px] italic leading-relaxed"
                style={{
                  color: `rgba(${rgb}, 0.5)`,
                  fontFamily: 'var(--font-newsreader), serif',
                }}
              >
                &ldquo;{mind.one_liner}&rdquo;
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {mind.best_roles.slice(0, 3).map((role) => (
                  <span
                    key={role}
                    className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: '#71717a',
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                    }}
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </div>
  );
}

export default function MindLibrary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DomainCategory | 'all'>('all');
  const [collapsed, setCollapsed] = useState(false);

  const filteredMinds = useMemo(() => {
    return minds.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.archetype.toLowerCase().includes(search.toLowerCase()) ||
        m.domain.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || m.domainCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <motion.div
      animate={{ width: collapsed ? 48 : 272 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="h-full flex flex-col glass-panel relative overflow-hidden"
      style={{ zIndex: 20, flexShrink: 0, minWidth: collapsed ? 48 : 272, maxWidth: collapsed ? 48 : 272 }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full flex items-center justify-center z-30 transition-colors"
        style={{
          background: 'rgba(18, 18, 30, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#71717a',
          fontSize: 10,
        }}
      >
        {collapsed ? '\u203A' : '\u2039'}
      </button>

      {collapsed ? (
        /* Collapsed: accent dots only */
        <div className="flex flex-col items-center gap-2 pt-14 px-1">
          {minds.map((m) => (
            <div
              key={m.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/mindId', m.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="w-3 h-3 rounded-full cursor-grab active:cursor-grabbing flex-shrink-0 transition-transform hover:scale-150"
              style={{
                background: m.accentColor,
                boxShadow: `0 0 8px ${m.accentColor}`,
              }}
              title={m.name}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-3 pt-4 pb-2">
            <div
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{
                color: '#71717a',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              Mind Library
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search minds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-[11px] px-2.5 py-1.5 rounded-md focus:outline-none transition-colors pr-7"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#e4e4e7',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] transition-colors"
                  style={{ color: '#52525b' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="text-[8px] uppercase tracking-[0.12em] px-2 py-1 rounded transition-colors"
                  style={{
                    background:
                      activeCategory === cat.id
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.02)',
                    color:
                      activeCategory === cat.id ? '#e4e4e7' : '#52525b',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    border: `1px solid ${activeCategory === cat.id ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          {/* Mind list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {filteredMinds.map((mind) => (
                <MindCard key={mind.id} mind={mind} />
              ))}
            </AnimatePresence>

            {filteredMinds.length === 0 && (
              <div
                className="text-[11px] text-center py-8 italic"
                style={{
                  color: '#52525b',
                  fontFamily: 'var(--font-newsreader), serif',
                }}
              >
                No minds match your search
              </div>
            )}
          </div>

          {/* Footer count */}
          <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div
              className="text-[9px] uppercase tracking-[0.12em]"
              style={{
                color: '#3f3f46',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              {filteredMinds.length} / {minds.length} minds
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
