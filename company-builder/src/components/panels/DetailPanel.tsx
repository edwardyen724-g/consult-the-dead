'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '@/store/companyStore';
import { mindsMap } from '@/data/minds';
import { rolesMap } from '@/data/roles';
import { getRoleFit, getFitColor } from '@/data/roleFit';
import { getChemistry } from '@/data/chemistry';
import { hexToRgb } from '@/lib/colors';

export default function DetailPanel() {
  const selectedMindId = useCompanyStore((s) => s.selectedMindId);
  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const connections = useCompanyStore((s) => s.connections);
  const setSelectedMindId = useCompanyStore((s) => s.setSelectedMindId);

  const selectedMind = useMemo(() => {
    if (!selectedMindId) return null;
    return placedMinds.find((pm) => pm.id === selectedMindId) || null;
  }, [selectedMindId, placedMinds]);

  const archetype = selectedMind ? mindsMap.get(selectedMind.archetypeId) : null;

  // Connections involving this mind
  const mindConnections = useMemo(() => {
    if (!selectedMindId) return [];
    return connections
      .filter((c) => c.sourceId === selectedMindId || c.targetId === selectedMindId)
      .map((c) => {
        const otherId = c.sourceId === selectedMindId ? c.targetId : c.sourceId;
        const otherPlaced = placedMinds.find((pm) => pm.id === otherId);
        const otherArchetype = otherPlaced ? mindsMap.get(otherPlaced.archetypeId) : null;
        const chemistry = otherPlaced && archetype
          ? getChemistry(selectedMind!.archetypeId, otherPlaced.archetypeId)
          : null;
        return {
          connection: c,
          otherPlaced,
          otherArchetype,
          chemistry,
        };
      })
      .filter((c) => c.otherArchetype);
  }, [selectedMindId, connections, placedMinds, archetype, selectedMind]);

  const roleFit = selectedMind?.role
    ? getRoleFit(selectedMind.archetypeId, selectedMind.role)
    : null;
  const fitColor = roleFit ? getFitColor(roleFit) : null;
  const fitRgb = fitColor ? hexToRgb(fitColor) : null;
  const roleData = selectedMind?.role ? rolesMap.get(selectedMind.role) : null;

  if (!archetype) {
    return (
      <AnimatePresence>
        {selectedMindId && (
          <motion.div
            key="empty-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </AnimatePresence>
    );
  }

  const accent = archetype.accentColor;
  const rgb = hexToRgb(accent);

  return (
    <AnimatePresence>
      {selectedMindId && archetype && (
        <motion.div
          key="detail-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full flex flex-col custom-scrollbar"
          style={{
            width: 340,
            zIndex: 30,
            background: 'rgba(12, 12, 20, 0.92)',
            backdropFilter: 'blur(28px) saturate(1.3)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
            overflowY: 'auto',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedMindId(null)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 z-10"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#71717a',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Header with accent gradient */}
          <div
            className="relative px-6 pt-6 pb-5"
            style={{
              background: `linear-gradient(180deg, rgba(${rgb}, 0.08) 0%, transparent 100%)`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />

            {/* Monogram */}
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 40% 40%, rgba(${rgb}, 0.3) 0%, rgba(${rgb}, 0.08) 70%)`,
                  border: `2px solid rgba(${rgb}, 0.4)`,
                  boxShadow: `0 0 24px rgba(${rgb}, 0.25), inset 0 0 12px rgba(${rgb}, 0.1)`,
                }}
              >
                <span
                  className="text-[24px] font-bold"
                  style={{
                    color: accent,
                    fontFamily: 'var(--font-newsreader), serif',
                    textShadow: `0 0 14px rgba(${rgb}, 0.5)`,
                  }}
                >
                  {archetype.name.charAt(0)}
                </span>
              </div>

              <div>
                <div
                  className="text-[16px] font-medium tracking-wide"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#e4e4e7' }}
                >
                  {archetype.name}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.14em] mt-0.5"
                  style={{ color: accent, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {archetype.archetype}
                </div>
                <div
                  className="text-[10px] tracking-[0.08em] mt-0.5"
                  style={{ color: '#71717a', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {archetype.era}
                </div>
              </div>
            </div>

            {/* Domain */}
            <div
              className="text-[9px] uppercase tracking-[0.12em]"
              style={{ color: '#71717a', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {archetype.domain} &middot; {archetype.domainCategory}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.15), transparent)` }} />

          {/* Role Assignment */}
          {roleData && (
            <div className="px-6 py-4">
              <SectionHeader label="Current Role" rgb={rgb} />
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: roleData.color, boxShadow: `0 0 6px ${roleData.color}` }}
                />
                <span
                  className="text-[12px] uppercase tracking-[0.1em]"
                  style={{ color: roleData.color, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {roleData.label}
                </span>
                {roleFit && fitColor && fitRgb && (
                  <span
                    className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ml-auto"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      color: fitColor,
                      background: `rgba(${fitRgb}, 0.1)`,
                      border: `1px solid rgba(${fitRgb}, 0.2)`,
                    }}
                  >
                    {roleFit} fit
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Thinking Pattern */}
          <div className="px-6 py-3">
            <SectionHeader label="Communication Style" rgb={rgb} />
            <p
              className="text-[12px] leading-relaxed mt-2"
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-newsreader), serif' }}
            >
              {archetype.communication_style}
            </p>
          </div>

          {/* Decision Style */}
          <div className="px-6 py-3">
            <div className="flex gap-4">
              <div>
                <div
                  className="text-[8px] uppercase tracking-[0.12em] mb-1"
                  style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  Decision Speed
                </div>
                <div
                  className="text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: '#a1a1aa', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {archetype.decision_speed}
                </div>
              </div>
              <div>
                <div
                  className="text-[8px] uppercase tracking-[0.12em] mb-1"
                  style={{ color: '#52525b', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  Risk Tolerance
                </div>
                <div
                  className="text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: '#a1a1aa', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {archetype.risk_tolerance}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Strengths */}
          <div className="px-6 py-3">
            <SectionHeader label="Strengths" rgb={rgb} />
            <ul className="mt-2 space-y-1.5">
              {archetype.natural_strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: `rgba(${rgb}, 0.5)` }}
                  />
                  <span
                    className="text-[11px] leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-newsreader), serif' }}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="px-6 py-3">
            <SectionHeader label="Weaknesses" rgb={rgb} />
            <ul className="mt-2 space-y-1.5">
              {archetype.natural_weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'rgba(244, 67, 54, 0.4)' }}
                  />
                  <span
                    className="text-[11px] leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-newsreader), serif' }}
                  >
                    {w}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Connections */}
          {mindConnections.length > 0 && (
            <div className="px-6 py-3">
              <SectionHeader label={`Connections (${mindConnections.length})`} rgb={rgb} />
              <div className="mt-2 space-y-2">
                {mindConnections.map(({ connection, otherArchetype, chemistry }) => {
                  if (!otherArchetype) return null;
                  const otherRgb = hexToRgb(otherArchetype.accentColor);
                  return (
                    <div
                      key={connection.id}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: otherArchetype.accentColor,
                          boxShadow: `0 0 6px rgba(${otherRgb}, 0.3)`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[11px] tracking-wide truncate"
                          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#e4e4e7' }}
                        >
                          {otherArchetype.name}
                        </div>
                        {chemistry && (
                          <div
                            className="text-[9px] italic mt-0.5 truncate"
                            style={{
                              fontFamily: 'var(--font-newsreader), serif',
                              color: chemistry.warmth === 'synergy'
                                ? 'rgba(120, 200, 160, 0.8)'
                                : chemistry.warmth === 'tension'
                                  ? 'rgba(220, 120, 100, 0.8)'
                                  : 'rgba(180, 180, 180, 0.6)',
                            }}
                          >
                            {chemistry.hint}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          color: connection.type === 'reporting' ? '#71717a' : '#52525b',
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {connection.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

          {/* Best Roles */}
          <div className="px-6 py-3">
            <SectionHeader label="Best Roles" rgb={rgb} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {archetype.best_roles.map((roleId) => {
                const r = rolesMap.get(roleId);
                if (!r) return null;
                return (
                  <span
                    key={roleId}
                    className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 rounded"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      color: r.color,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {r.shortLabel}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Signature Quote */}
          <div className="px-6 py-4 mt-auto">
            <div
              className="relative px-4 py-3 rounded-lg"
              style={{
                background: `linear-gradient(135deg, rgba(${rgb}, 0.05) 0%, transparent 100%)`,
                border: `1px solid rgba(${rgb}, 0.1)`,
              }}
            >
              <div
                className="text-[22px] absolute -top-2 left-2 leading-none"
                style={{ color: `rgba(${rgb}, 0.3)`, fontFamily: 'var(--font-newsreader), serif' }}
              >
                &ldquo;
              </div>
              <div
                className="text-[12px] italic leading-relaxed"
                style={{
                  color: `rgba(${rgb}, 0.7)`,
                  fontFamily: 'var(--font-newsreader), serif',
                }}
              >
                {archetype.one_liner}
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({ label, rgb }: { label: string; rgb: string }) {
  return (
    <div
      className="text-[9px] uppercase tracking-[0.16em]"
      style={{
        color: `rgba(${rgb}, 0.6)`,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
      }}
    >
      {label}
    </div>
  );
}
