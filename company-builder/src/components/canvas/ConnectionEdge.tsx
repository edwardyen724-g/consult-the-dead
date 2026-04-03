'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { mindsMap } from '@/data/minds';
import { getChemistry, getWarmthColor } from '@/data/chemistry';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';
import type { ConnectionType } from '@/types';

interface ConnectionEdgeData {
  sourceArchetypeId: string;
  targetArchetypeId: string;
  connectionType: ConnectionType;
  connectionId: string;
  [key: string]: unknown;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function blendColors(color1: string, color2: string): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  return `${Math.round((r1 + r2) / 2)}, ${Math.round((g1 + g2) / 2)}, ${Math.round((b1 + b2) / 2)}`;
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
  const setConnectionContextMenu = useCompanyStore((s) => s.setConnectionContextMenu);
  const isDebateRunning = useDebateStore((s) => s.isDebateRunning);

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
    </g>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
