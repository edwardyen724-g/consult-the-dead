'use client';

import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MindNode } from './MindNode';
import { useCompanyStore } from '@/store/companyStore';
import { minds, mindsMap } from '@/data/minds';
import { getChemistry, type ChemistryWarmth } from '@/data/chemistry';
import type { PlacedMind } from '@/types';

const nodeTypes: NodeTypes = {
  mindNode: MindNode,
};

function buildNodes(placedMinds: PlacedMind[]): Node[] {
  return placedMinds.map((pm) => ({
    id: pm.id,
    type: 'mindNode',
    position: pm.position,
    data: {
      archetypeId: pm.archetypeId,
      role: pm.role,
      label: mindsMap.get(pm.archetypeId)?.name || 'Unknown',
    },
  }));
}

/* ---- Ghost constellation: 12 faint positions for minds awaiting activation ---- */

// Arrange 12 minds in a loose constellation shape across the canvas
const GHOST_POSITIONS: { x: number; y: number }[] = [
  { x: 180, y: 80 },
  { x: 520, y: 40 },
  { x: 860, y: 100 },
  { x: 100, y: 280 },
  { x: 440, y: 220 },
  { x: 740, y: 310 },
  { x: 300, y: 440 },
  { x: 620, y: 480 },
  { x: 950, y: 420 },
  { x: 160, y: 560 },
  { x: 500, y: 600 },
  { x: 800, y: 580 },
];

function GhostConstellation({
  placedMinds,
  isDraggingFromSidebar,
  draggedArchetypeId,
}: {
  placedMinds: PlacedMind[];
  isDraggingFromSidebar: boolean;
  draggedArchetypeId: string | null;
}) {
  const placedArchetypeIds = useMemo(
    () => new Set(placedMinds.map((pm) => pm.archetypeId)),
    [placedMinds]
  );

  // Ghost minds are unplaced minds mapped to constellation positions
  const ghostMinds = useMemo(() => {
    return minds
      .filter((m) => !placedArchetypeIds.has(m.id))
      .slice(0, 12)
      .map((mind, i) => ({
        mind,
        position: GHOST_POSITIONS[i % GHOST_POSITIONS.length],
      }));
  }, [placedArchetypeIds]);

  if (ghostMinds.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
      <AnimatePresence>
        {ghostMinds.map(({ mind, position }) => {
          const isBeingDragged = draggedArchetypeId === mind.id;
          const brighten = isDraggingFromSidebar;
          const rgb = hexToRgb(mind.accentColor);

          return (
            <motion.div
              key={`ghost-${mind.id}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isBeingDragged ? 0.6 : brighten ? 0.3 : 1,
                scale: isBeingDragged ? 1.3 : 1,
              }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute flex flex-col items-center gap-1"
              style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Accent dot */}
              <div
                className="rounded-full"
                style={{
                  width: isBeingDragged ? 8 : 5,
                  height: isBeingDragged ? 8 : 5,
                  background: mind.accentColor,
                  opacity: isBeingDragged ? 0.8 : brighten ? 0.35 : 0.2,
                  boxShadow: isBeingDragged
                    ? `0 0 16px rgba(${rgb}, 0.6), 0 0 32px rgba(${rgb}, 0.3)`
                    : `0 0 8px rgba(${rgb}, 0.15)`,
                  transition: 'all 0.4s ease',
                }}
              />
              {/* Ghost name label */}
              <div
                className="text-[9px] uppercase tracking-[0.14em] whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  color: mind.accentColor,
                  opacity: isBeingDragged ? 0.55 : brighten ? 0.2 : 0.12,
                  transition: 'opacity 0.4s ease',
                  textShadow: isBeingDragged ? `0 0 10px rgba(${rgb}, 0.4)` : 'none',
                }}
              >
                {mind.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ---- Color bleed: pools of accent color behind each node ---- */
function ColorBleedLayer({ placedMinds }: { placedMinds: PlacedMind[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <AnimatePresence>
        {placedMinds.map((pm) => {
          const mind = mindsMap.get(pm.archetypeId);
          if (!mind) return null;
          const rgb = hexToRgb(mind.accentColor);
          return (
            <motion.div
              key={`bleed-${pm.id}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute pointer-events-none"
              style={{
                left: pm.position.x + 110,
                top: pm.position.y + 70,
                width: 300,
                height: 300,
                marginLeft: -150,
                marginTop: -150,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(${rgb}, 0.045) 0%, rgba(${rgb}, 0.015) 40%, transparent 70%)`,
                filter: 'blur(30px)',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ---- Proximity chemistry hints between nearby nodes ---- */
interface ChemistryHint {
  pairKey: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  warmth: ChemistryWarmth;
  hint: string;
  distance: number;
}

function ProximityChemistry({ placedMinds }: { placedMinds: PlacedMind[] }) {
  const hints = useMemo(() => {
    const result: ChemistryHint[] = [];
    for (let i = 0; i < placedMinds.length; i++) {
      for (let j = i + 1; j < placedMinds.length; j++) {
        const a = placedMinds[i];
        const b = placedMinds[j];
        // Node center offsets (node is ~220x140)
        const ax = a.position.x + 110;
        const ay = a.position.y + 70;
        const bx = b.position.x + 110;
        const by = b.position.y + 70;
        const dx = ax - bx;
        const dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 350 && dist > 50) {
          const chem = getChemistry(a.archetypeId, b.archetypeId);
          if (chem) {
            result.push({
              pairKey: `${a.id}--${b.id}`,
              x1: ax,
              y1: ay,
              x2: bx,
              y2: by,
              midX: (ax + bx) / 2,
              midY: (ay + by) / 2,
              warmth: chem.warmth,
              hint: chem.hint,
              distance: dist,
            });
          }
        }
      }
    }
    return result;
  }, [placedMinds]);

  if (hints.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {hints.map((h) => {
          const opacity = Math.max(0, Math.min(1, 1 - h.distance / 350)) * 0.4;
          const color =
            h.warmth === 'synergy'
              ? 'rgba(120, 200, 160, VAR)'
              : h.warmth === 'tension'
                ? 'rgba(220, 120, 100, VAR)'
                : 'rgba(180, 180, 180, VAR)';
          const strokeColor = color.replace('VAR', String(opacity));
          // Curved arc: control point perpendicular to midpoint
          const dx = h.x2 - h.x1;
          const dy = h.y2 - h.y1;
          const cpx = h.midX - dy * 0.15;
          const cpy = h.midY + dx * 0.15;

          return (
            <path
              key={h.pairKey}
              d={`M ${h.x1} ${h.y1} Q ${cpx} ${cpy} ${h.x2} ${h.y2}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.2}
              strokeDasharray="6 4"
              className="chemistry-arc"
            />
          );
        })}
      </svg>

      {/* Hint labels at midpoints */}
      <AnimatePresence>
        {hints.map((h) => {
          const fadeOpacity = Math.max(0, Math.min(1, 1 - h.distance / 350));
          const labelColor =
            h.warmth === 'synergy'
              ? 'rgba(120, 200, 160, 0.7)'
              : h.warmth === 'tension'
                ? 'rgba(220, 120, 100, 0.7)'
                : 'rgba(180, 180, 180, 0.6)';

          // Offset label slightly from the arc
          const dx = h.x2 - h.x1;
          const dy = h.y2 - h.y1;
          const labelX = h.midX - dy * 0.12;
          const labelY = h.midY + dx * 0.12 - 14;

          return (
            <motion.div
              key={`label-${h.pairKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: fadeOpacity * 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute text-center"
              style={{
                left: labelX,
                top: labelY,
                transform: 'translate(-50%, -50%)',
                maxWidth: 200,
              }}
            >
              <div
                className="text-[9px] italic leading-snug px-2 py-1 rounded-md inline-block"
                style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  color: labelColor,
                  background: 'rgba(10, 10, 15, 0.7)',
                  border: `1px solid ${h.warmth === 'synergy' ? 'rgba(120, 200, 160, 0.15)' : h.warmth === 'tension' ? 'rgba(220, 120, 100, 0.15)' : 'rgba(180, 180, 180, 0.1)'}`,
                }}
              >
                {h.hint}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ---- Ambient particles floating across canvas ---- */
function AmbientParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 1.5,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 20,
      drift: 15 + Math.random() * 25,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(255,255,255,0.12)',
            animation: `particle-drift ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setCenter } = useReactFlow();

  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const addMind = useCompanyStore((s) => s.addMind);
  const updateMindPosition = useCompanyStore((s) => s.updateMindPosition);
  const isDraggingFromSidebar = useCompanyStore((s) => s.isDraggingFromSidebar);
  const draggedArchetypeId = useCompanyStore((s) => s.draggedArchetypeId);

  const initialNodes = useMemo(() => buildNodes(placedMinds), [placedMinds]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  // Sync nodes with store whenever placedMinds changes
  useEffect(() => {
    setNodes(buildNodes(placedMinds));
  }, [placedMinds, setNodes]);

  // Handle node drag stop -- persist position to store
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateMindPosition(node.id, { x: node.position.x, y: node.position.y });
    },
    [updateMindPosition]
  );

  // Double-click node to center canvas on it
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setCenter(node.position.x + 110, node.position.y + 70, {
        zoom: 1.2,
        duration: 600,
      });
    },
    [setCenter]
  );

  // Handle drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const archetypeId = event.dataTransfer.getData('application/mindId');
      if (!archetypeId) return;

      const mind = mindsMap.get(archetypeId);
      if (!mind) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      // Offset to center node on drop point
      position.x -= 110;
      position.y -= 70;

      const newMind: PlacedMind = {
        id: `${archetypeId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        archetypeId,
        role: null,
        position,
      };

      addMind(newMind);
    },
    [screenToFlowPosition, addMind]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Radial vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Drag feedback: pulse ring on canvas when dragging from sidebar */}
      <AnimatePresence>
        {isDraggingFromSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div
              className="absolute inset-0"
              style={{
                border: '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                animation: 'canvas-invite 2s ease-in-out infinite',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ghost constellation: minds waiting to be summoned */}
      <GhostConstellation
        placedMinds={placedMinds}
        isDraggingFromSidebar={isDraggingFromSidebar}
        draggedArchetypeId={draggedArchetypeId}
      />

      {/* Color bleed from placed minds */}
      <ColorBleedLayer placedMinds={placedMinds} />

      {/* Proximity chemistry hints */}
      <ProximityChemistry placedMinds={placedMinds} />

      {/* Ambient particles */}
      <AmbientParticles />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        selectionOnDrag={false}
        selectNodesOnDrag={false}
        style={{ background: '#0a0a0f' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="rgba(255, 255, 255, 0.06)"
          style={{ background: '#0a0a0f' }}
        />
      </ReactFlow>

      {/* Empty canvas prompt — now the ghosts ARE the empty state,
          but keep a subtle hint text */}
      {placedMinds.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <div
            className="text-center"
            style={{ animation: 'float-prompt 4s ease-in-out infinite' }}
          >
            <div
              className="text-sm uppercase tracking-[0.2em] mb-2"
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
              }}
            >
              The Void Awaits
            </div>
            <div
              className="text-[13px] italic"
              style={{
                color: 'rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-newsreader), serif',
              }}
            >
              Drag a mind from the library to begin orchestration
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
