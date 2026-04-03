'use client';

import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { mindsMap } from '@/data/minds';
import { roles } from '@/data/roles';
import { getRoleFit, getFitColor } from '@/data/roleFit';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';
import { hexToRgb } from '@/lib/colors';
import type { RoleId, DomainCategory } from '@/types';

interface MindNodeData {
  archetypeId: string;
  role: RoleId | null;
  label: string;
  [key: string]: unknown;
}

/* ---- Domain motif SVG patterns ---- */
function getDomainMotifStyle(domainCategory: DomainCategory, rgb: string): React.CSSProperties {
  switch (domainCategory) {
    case 'science':
      return {
        backgroundImage: `
          linear-gradient(30deg, rgba(${rgb}, 0.12) 12%, transparent 12.5%, transparent 87%, rgba(${rgb}, 0.12) 87.5%),
          linear-gradient(150deg, rgba(${rgb}, 0.12) 12%, transparent 12.5%, transparent 87%, rgba(${rgb}, 0.12) 87.5%),
          linear-gradient(30deg, rgba(${rgb}, 0.12) 12%, transparent 12.5%, transparent 87%, rgba(${rgb}, 0.12) 87.5%),
          linear-gradient(150deg, rgba(${rgb}, 0.12) 12%, transparent 12.5%, transparent 87%, rgba(${rgb}, 0.12) 87.5%),
          linear-gradient(60deg, rgba(${rgb}, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(${rgb}, 0.08) 75%),
          linear-gradient(60deg, rgba(${rgb}, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(${rgb}, 0.08) 75%)
        `,
        backgroundSize: '40px 70px',
        backgroundPosition: '0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px',
      };
    case 'strategy':
      return {
        backgroundImage: `
          repeating-linear-gradient(
            135deg,
            transparent,
            transparent 8px,
            rgba(${rgb}, 0.10) 8px,
            rgba(${rgb}, 0.10) 9px
          )
        `,
        backgroundSize: '20px 20px',
      };
    case 'art':
    case 'computing':
      return {
        backgroundImage: `
          radial-gradient(ellipse at 70% 30%, rgba(${rgb}, 0.14) 0%, transparent 30%),
          radial-gradient(ellipse at 30% 70%, rgba(${rgb}, 0.10) 0%, transparent 25%),
          radial-gradient(circle at 50% 50%, transparent 40%, rgba(${rgb}, 0.07) 41%, transparent 42%)
        `,
        backgroundSize: '100% 100%',
      };
    case 'governance':
      return {
        backgroundImage: `
          conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(${rgb}, 0.12) 10deg,
            transparent 20deg,
            transparent 70deg,
            rgba(${rgb}, 0.12) 80deg,
            transparent 90deg,
            transparent 160deg,
            rgba(${rgb}, 0.12) 170deg,
            transparent 180deg,
            transparent 250deg,
            rgba(${rgb}, 0.12) 260deg,
            transparent 270deg,
            transparent 340deg,
            rgba(${rgb}, 0.12) 350deg,
            transparent 360deg
          )
        `,
        backgroundSize: '100% 100%',
      };
    default:
      return {};
  }
}

/* ---- Custom Role Dropdown ---- */
function RoleDropdown({
  currentRole,
  onSelect,
}: {
  currentRole: RoleId | null;
  onSelect: (role: RoleId | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = roles.find((r) => r.id === currentRole);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()} onWheelCapture={(e) => { if (open) e.stopPropagation(); }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-[11px] uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-md cursor-pointer focus:outline-none transition-all duration-200 text-left flex items-center gap-2"
        style={{
          background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
          color: selected ? selected.color : '#71717a',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
        }}
      >
        {selected && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: selected.color, boxShadow: `0 0 4px ${selected.color}` }}
          />
        )}
        <span className="flex-1 truncate">{selected ? selected.shortLabel : 'Assign Role...'}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path d="M2 3.5l3 3 3-3" fill="none" stroke="#a1a1aa" strokeWidth="1.2" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-1 rounded-lg overflow-hidden custom-scrollbar nowheel nopan"
            style={{
              zIndex: 50,
              background: 'rgba(12, 12, 22, 0.96)',
              backdropFilter: 'blur(20px) saturate(1.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)',
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className="w-full text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 text-left transition-colors duration-100 flex items-center gap-2"
              style={{
                color: '#52525b',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                background: !currentRole ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = !currentRole ? 'rgba(255,255,255,0.05)' : 'transparent')}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3f3f46' }} />
              <span>Unassigned</span>
            </button>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => { onSelect(role.id); setOpen(false); }}
                className="w-full text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 text-left transition-colors duration-100 flex items-center gap-2"
                style={{
                  color: role.color,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  background: currentRole === role.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = currentRole === role.id ? 'rgba(255,255,255,0.05)' : 'transparent')}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: role.color, boxShadow: `0 0 4px ${role.color}` }}
                />
                <span>{role.shortLabel}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Main Node Component ---- */
function MindNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindNodeData;
  const mind = mindsMap.get(nodeData.archetypeId);
  const updateMindRole = useCompanyStore((s) => s.updateMindRole);
  const removeMind = useCompanyStore((s) => s.removeMind);
  const justPlacedIds = useCompanyStore((s) => s.justPlacedIds);
  const clearJustPlaced = useCompanyStore((s) => s.clearJustPlaced);
  const hoveredSidebarArchetypeId = useCompanyStore((s) => s.hoveredSidebarArchetypeId);
  const setSelectedMindId = useCompanyStore((s) => s.setSelectedMindId);

  const speakingMindId = useDebateStore((s) => s.speakingMindId);
  const isDebateRunning = useDebateStore((s) => s.isDebateRunning);

  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const justPlaced = justPlacedIds.has(id);
  const [showPlacementQuote, setShowPlacementQuote] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const isHighlightedFromSidebar = hoveredSidebarArchetypeId === nodeData.archetypeId;
  const isSpeaking = speakingMindId === id;
  const phaseOffset = useMemo(() => Math.random() * 4, []);

  // Role fit indicator
  const roleFit = useMemo(() => {
    if (!nodeData.role) return null;
    return getRoleFit(nodeData.archetypeId, nodeData.role);
  }, [nodeData.archetypeId, nodeData.role]);

  const fitColor = roleFit ? getFitColor(roleFit) : null;
  const fitRgb = fitColor ? hexToRgb(fitColor) : null;

  // Placement ceremony (F13 enhanced: longer quote hold, more prominent)
  useEffect(() => {
    if (justPlaced) {
      setShowFlash(true);
      setShowPlacementQuote(true);
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      const quoteTimer = setTimeout(() => setShowPlacementQuote(false), 2800);
      const clearTimer = setTimeout(() => clearJustPlaced(id), 3000);
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(quoteTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [justPlaced, id, clearJustPlaced]);

  const handleRoleChange = useCallback(
    (role: RoleId | null) => {
      updateMindRole(id, role);
    },
    [id, updateMindRole]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsRemoving(true);
      setTimeout(() => {
        removeMind(id);
      }, 450);
    },
    [id, removeMind]
  );

  const handleNodeClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't select if clicking on dropdown or buttons
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-no-select]')) return;
      setSelectedMindId(id);
    },
    [id, setSelectedMindId]
  );

  if (!mind) return null;

  const accent = mind.accentColor;
  const rgb = hexToRgb(accent);
  const monogram = mind.name.charAt(0).toUpperCase();
  const domainMotif = getDomainMotifStyle(mind.domainCategory, rgb);

  return (
    <motion.div
      initial={{ scale: 0.05, opacity: 0 }}
      animate={
        isRemoving
          ? { scale: 0.02, opacity: 0, filter: `blur(8px) brightness(3)` }
          : { scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)' }
      }
      transition={
        isRemoving
          ? { duration: 0.4, ease: 'easeIn' }
          : { type: 'spring', stiffness: 300, damping: 20, duration: 0.5 }
      }
      className="relative group"
      style={{ minWidth: 220 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNodeClick}
    >
      {/* Placement flash burst */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${rgb}, 0.6) 0%, rgba(${rgb}, 0.1) 50%, transparent 70%)`,
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Placement quote (F13 enhanced: larger, more prominent) */}
      <AnimatePresence>
        {showPlacementQuote && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 text-center pointer-events-none"
            style={{ bottom: '100%', marginBottom: 10, zIndex: 10, transform: 'translateX(-50%)' }}
          >
            <div
              className="text-[13px] italic leading-relaxed px-4 py-2.5 rounded-xl inline-block max-w-[300px]"
              style={{
                color: `rgba(${rgb}, 0.95)`,
                fontFamily: 'var(--font-newsreader), serif',
                background: 'rgba(8, 8, 14, 0.9)',
                border: `1px solid rgba(${rgb}, 0.3)`,
                boxShadow: `0 4px 24px rgba(${rgb}, 0.15), 0 0 40px rgba(${rgb}, 0.08)`,
                textShadow: `0 0 20px rgba(${rgb}, 0.3)`,
              }}
            >
              &ldquo;{mind.one_liner}&rdquo;
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar hover highlight ring */}
      {isHighlightedFromSidebar && (
        <div
          className="absolute pointer-events-none rounded-2xl"
          style={{
            inset: -6,
            border: `2px solid rgba(${rgb}, 0.5)`,
            borderRadius: 18,
            animation: 'mind-breathe 1.5s ease-in-out infinite',
            boxShadow: `0 0 20px rgba(${rgb}, 0.3)`,
          }}
        />
      )}

      {/* Role-fit indicator ring */}
      <AnimatePresence>
        {fitColor && fitRgb && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="absolute pointer-events-none rounded-2xl"
            style={{
              inset: -1,
              border: `2px solid ${fitColor}`,
              borderRadius: 17,
              boxShadow: `0 0 12px rgba(${fitRgb}, 0.3), inset 0 0 6px rgba(${fitRgb}, 0.1)`,
              animation: 'fit-glow 3s ease-in-out infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Speaking indicator ring */}
      {isSpeaking && (
        <div
          className="absolute pointer-events-none rounded-2xl"
          style={{
            inset: -8,
            border: `2px solid rgba(${rgb}, 0.6)`,
            borderRadius: 18,
            animation: 'speaking-pulse 1s ease-in-out infinite',
            boxShadow: `0 0 30px rgba(${rgb}, 0.5), 0 0 60px rgba(${rgb}, 0.2)`,
          }}
        />
      )}

      {/* Breathing aura glow */}
      <div
        className="absolute pointer-events-none rounded-2xl"
        style={{
          inset: isSpeaking ? -20 : -12,
          background: `radial-gradient(ellipse at center, rgba(${rgb}, ${isSpeaking ? 0.25 : selected ? 0.18 : 0.08}) 0%, rgba(${rgb}, ${isSpeaking ? 0.08 : selected ? 0.06 : 0.02}) 60%, transparent 100%)`,
          animation: isSpeaking
            ? `mind-breathe 1.2s ease-in-out infinite`
            : `mind-breathe ${3.2 + phaseOffset * 0.3}s ease-in-out infinite`,
          animationDelay: isSpeaking ? '0s' : `${phaseOffset}s`,
          filter: isSpeaking ? `blur(12px)` : selected ? `blur(8px)` : `blur(6px)`,
          transition: 'all 0.4s ease',
        }}
      />

      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: selected
            ? `0 0 40px rgba(${rgb}, 0.35), 0 0 80px rgba(${rgb}, 0.15), inset 0 0 30px rgba(${rgb}, 0.05)`
            : `0 0 25px rgba(${rgb}, 0.2), 0 0 50px rgba(${rgb}, 0.06)`,
          animation: `mind-glow ${3.2 + phaseOffset * 0.3}s ease-in-out infinite`,
          animationDelay: `${phaseOffset}s`,
          transition: 'box-shadow 0.4s ease',
        }}
      />

      {/* Node body with domain motif overlay */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: `radial-gradient(ellipse at top center, rgba(${rgb}, 0.1) 0%, transparent 60%), rgba(14, 14, 24, 0.94)`,
          border: selected
            ? `1.5px solid rgba(${rgb}, 0.7)`
            : `1px solid rgba(${rgb}, 0.15)`,
          transform: selected ? 'scale(1.06)' : isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'border 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Domain motif pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={domainMotif}
        />

        {/* Top accent bar */}
        <div
          className="h-[2px] w-full relative"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />

        <div className="px-4 pt-3 pb-3 relative">
          {/* Monogram + Name row */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative"
              style={{
                background: `radial-gradient(circle at 40% 40%, rgba(${rgb}, 0.3) 0%, rgba(${rgb}, 0.08) 70%)`,
                border: `1.5px solid rgba(${rgb}, 0.4)`,
                boxShadow: `0 0 16px rgba(${rgb}, 0.2), inset 0 0 8px rgba(${rgb}, 0.1)`,
              }}
            >
              <span
                className="text-[16px] font-bold"
                style={{
                  color: accent,
                  fontFamily: 'var(--font-newsreader), serif',
                  textShadow: `0 0 10px rgba(${rgb}, 0.5)`,
                }}
              >
                {monogram}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-[13px] font-medium tracking-wide truncate"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#e4e4e7' }}
                >
                  {mind.name}
                </span>
                <button
                  onClick={handleRemove}
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#71717a',
                    fontSize: 9,
                  }}
                  title="Remove mind"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{ color: accent, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {mind.archetype}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-2" style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.15), transparent)` }} />

          {/* Domain + Fit badge */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="text-[9px] uppercase tracking-[0.1em] flex-1"
              style={{ color: '#71717a', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {mind.domain}
            </div>
            {/* Role fit badge */}
            {roleFit && fitColor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  color: fitColor,
                  background: `rgba(${fitRgb}, 0.1)`,
                  border: `1px solid rgba(${fitRgb}, 0.2)`,
                }}
              >
                {roleFit} fit
              </motion.div>
            )}
          </div>

          {/* Custom Role Dropdown */}
          <div data-no-select>
            <RoleDropdown
              currentRole={nodeData.role}
              onSelect={handleRoleChange}
            />
          </div>

          {/* Hover quote reveal */}
          <AnimatePresence>
            {(selected || isHovered) && !showPlacementQuote && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="text-[10px] italic leading-relaxed"
                  style={{
                    color: `rgba(${rgb}, 0.65)`,
                    fontFamily: 'var(--font-newsreader), serif',
                  }}
                >
                  &ldquo;{mind.one_liner}&rdquo;
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Connection handles - all ports are both source AND target */}
      <Handle
        type="target"
        id="left-target"
        position={Position.Left}
        className="connection-port connection-port-left"
        style={{
          width: 10,
          height: 10,
          background: `rgba(${rgb}, 0.3)`,
          border: `1.5px solid rgba(${rgb}, 0.5)`,
          borderRadius: '50%',
          transition: 'all 0.2s ease',
        }}
      />
      <Handle
        type="source"
        id="left-source"
        position={Position.Left}
        className="connection-port connection-port-left"
        style={{
          width: 10,
          height: 10,
          background: 'transparent',
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle
        type="target"
        id="right-target"
        position={Position.Right}
        className="connection-port connection-port-right"
        style={{
          width: 10,
          height: 10,
          background: 'transparent',
          border: 'none',
          borderRadius: '50%',
        }}
      />
      <Handle
        type="source"
        id="right-source"
        position={Position.Right}
        className="connection-port connection-port-right"
        style={{
          width: 10,
          height: 10,
          background: `rgba(${rgb}, 0.3)`,
          border: `1.5px solid rgba(${rgb}, 0.5)`,
          borderRadius: '50%',
          transition: 'all 0.2s ease',
        }}
      />
    </motion.div>
  );
}

export const MindNode = memo(MindNodeComponent);
