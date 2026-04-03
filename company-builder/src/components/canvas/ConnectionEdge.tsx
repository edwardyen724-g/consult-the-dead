'use client';

import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { mindsMap } from '@/data/minds';
import { getChemistry, getWarmthColor } from '@/data/chemistry';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';
import { hexToRgb, blendColors } from '@/lib/colors';
import type { ConnectionType } from '@/types';

interface ConnectionEdgeData {
  sourceArchetypeId: string;
  targetArchetypeId: string;
  connectionType: ConnectionType;
  connectionId: string;
  [key: string]: unknown;
}

/* ---- F14: Connection Spark Particles ---- */
function SparkParticles({ cx, cy, rgb }: { cx: number; cy: number; rgb: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 7 + (Math.random() - 0.5) * 0.5;
      const distance = 20 + Math.random() * 30;
      return {
        id: i,
        endX: cx + Math.cos(angle) * distance,
        endY: cy + Math.sin(angle) * distance,
        size: 2 + Math.random() * 2.5,
        duration: 0.5 + Math.random() * 0.3,
      };
    });
  }, [cx, cy]);

  return (
    <g>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={cx}
          cy={cy}
          r={p.size}
          fill={`rgba(${rgb}, 0.9)`}
          initial={{ cx, cy, opacity: 0.9, r: p.size }}
          animate={{ cx: p.endX, cy: p.endY, opacity: 0, r: 0.5 }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
        />
      ))}
      {/* Central flash */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill={`rgba(${rgb}, 0.6)`}
        initial={{ r: 4, opacity: 0.8 }}
        animate={{ r: 20, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </g>
  );
}

function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as ConnectionEdgeData;
  const [isHovered, setIsHovered] = useState(false);
  const [showSpark, setShowSpark] = useState(false);
  const [showChemistryReveal, setShowChemistryReveal] = useState(false);
  const setConnectionContextMenu = useCompanyStore((s) => s.setConnectionContextMenu);
  const justCreatedConnectionIds = useCompanyStore((s) => s.justCreatedConnectionIds);
  const clearJustCreatedConnection = useCompanyStore((s) => s.clearJustCreatedConnection);
  const isDebateRunning = useDebateStore((s) => s.isDebateRunning);
  const isJustCreated = justCreatedConnectionIds.has(edgeData.connectionId);

  // F14: Connection spark on first creation
  useEffect(() => {
    if (isJustCreated) {
      setShowSpark(true);
      setShowChemistryReveal(true);
      const sparkTimer = setTimeout(() => setShowSpark(false), 800);
      const chemTimer = setTimeout(() => setShowChemistryReveal(false), 3500);
      const clearTimer = setTimeout(() => clearJustCreatedConnection(edgeData.connectionId), 3500);
      return () => {
        clearTimeout(sparkTimer);
        clearTimeout(chemTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [isJustCreated, edgeData.connectionId, clearJustCreatedConnection]);

  const sourceMind = mindsMap.get(edgeData.sourceArchetypeId);
  const targetMind = mindsMap.get(edgeData.targetArchetypeId);
  const chemistry = getChemistry(edgeData.sourceArchetypeId, edgeData.targetArchetypeId);

  const blendedRgb = useMemo(() => {
    if (!sourceMind || !targetMind) return '150, 150, 150';
    return blendColors(sourceMind.accentColor, targetMind.accentColor);
  }, [sourceMind, targetMind]);

  // Chemistry-based warmth colors
  const warmthColors = useMemo(() => {
    if (!chemistry) return null;
    return getWarmthColor(chemistry.warmth);
  }, [chemistry]);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.3,
  });

  const isReporting = edgeData.connectionType === 'reporting';
  const filterId = `glow-${id}`;

  // Use warmth color for glow/stroke if chemistry exists
  const strokeColor = warmthColors
    ? warmthColors.stroke
    : `rgba(${blendedRgb}, ${isHovered || selected ? 0.9 : 0.7})`;
  const glowColor = warmthColors
    ? warmthColors.glow
    : `rgba(${blendedRgb}, ${isHovered || selected ? 0.5 : 0.3})`;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setConnectionContextMenu({
        connectionId: edgeData.connectionId,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [edgeData.connectionId, setConnectionContextMenu]
  );

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      {/* SVG filter for glow effect */}
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope={isHovered || selected ? 0.6 : 0.4} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer (behind) */}
      <path
        d={edgePath}
        fill="none"
        stroke={glowColor}
        strokeWidth={isReporting ? 6 : 4}
        strokeDasharray={isReporting ? 'none' : '10 6'}
        filter={`url(#${filterId})`}
        className={isDebateRunning ? 'debate-edge-pulse' : 'connection-glow'}
        style={{ transition: 'stroke 0.3s ease' }}
      />

      {/* Main visible line */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isReporting ? 2.5 : 1.8}
        strokeDasharray={isReporting ? 'none' : '8 5'}
        strokeLinecap="round"
        className={isReporting ? (isDebateRunning ? 'debate-edge-pulse' : '') : 'connection-dash-animate'}
        style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
      />

      {/* Invisible wider hit area for interaction */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />

      {/* Chemistry score badge at midpoint */}
      {chemistry && (
        <g>
          <circle
            cx={labelX}
            cy={labelY}
            r={isHovered ? 13 : 10}
            fill="rgba(10, 10, 18, 0.9)"
            stroke={warmthColors?.badge || `rgba(${blendedRgb}, 0.4)`}
            strokeWidth={1}
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          />
          <text
            x={labelX}
            y={labelY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={warmthColors?.badge || `rgba(${blendedRgb}, 0.8)`}
            fontSize={isHovered ? 8 : 7}
            fontFamily="var(--font-jetbrains-mono), monospace"
            style={{ transition: 'font-size 0.3s ease', pointerEvents: 'none' }}
          >
            {chemistry.score}
          </text>
        </g>
      )}

      {/* If no chemistry data, show the simple midpoint dot */}
      {!chemistry && (
        <circle
          cx={labelX}
          cy={labelY}
          r={isHovered ? 4 : 3}
          fill={`rgba(${blendedRgb}, ${isHovered ? 0.8 : 0.4})`}
          style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
        />
      )}

      {/* Chemistry detail on hover */}
      <AnimatePresence>
        {isHovered && chemistry && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <foreignObject
              x={labelX - 140}
              y={labelY + 18}
              width={280}
              height={80}
              style={{ overflow: 'visible' }}
            >
              <div className="flex justify-center">
                <div
                  className="text-center max-w-[260px] px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(10, 10, 15, 0.95)',
                    border: `1px solid ${warmthColors?.badge || `rgba(${blendedRgb}, 0.25)`}`,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div
                    className="text-[10px] italic leading-snug mb-1"
                    style={{
                      fontFamily: 'var(--font-newsreader), serif',
                      color: warmthColors?.badge || 'rgba(180, 180, 180, 0.8)',
                    }}
                  >
                    {chemistry.hint}
                  </div>
                  <div
                    className="text-[9px] leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-newsreader), serif',
                      color: 'rgba(255, 255, 255, 0.45)',
                    }}
                  >
                    {chemistry.detail.slice(0, 140)}{chemistry.detail.length > 140 ? '...' : ''}
                  </div>
                </div>
              </div>
            </foreignObject>
          </motion.g>
        )}
      </AnimatePresence>

      {/* F14: Connection Spark — particle burst at midpoint on creation */}
      <AnimatePresence>
        {showSpark && (
          <SparkParticles cx={labelX} cy={labelY} rgb={blendedRgb} />
        )}
      </AnimatePresence>

      {/* F14: Chemistry hint reveal animation on first connection */}
      <AnimatePresence>
        {showChemistryReveal && chemistry && !isHovered && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <foreignObject
              x={labelX - 130}
              y={labelY - 40}
              width={260}
              height={40}
              style={{ overflow: 'visible' }}
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center max-w-[240px] px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(8, 8, 14, 0.92)',
                    border: `1px solid ${warmthColors?.badge || `rgba(${blendedRgb}, 0.3)`}`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(${blendedRgb}, 0.1)`,
                  }}
                >
                  <div
                    className="text-[10px] italic leading-snug"
                    style={{
                      fontFamily: 'var(--font-newsreader), serif',
                      color: warmthColors?.badge || `rgba(${blendedRgb}, 0.9)`,
                    }}
                  >
                    {chemistry.hint}
                  </div>
                </motion.div>
              </div>
            </foreignObject>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
