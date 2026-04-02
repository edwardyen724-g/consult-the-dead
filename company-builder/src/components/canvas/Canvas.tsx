'use client';

import React, { useCallback, useRef, useMemo } from 'react';
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
import { mindsMap } from '@/data/minds';
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
              key={pm.id}
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
  const { screenToFlowPosition } = useReactFlow();

  const placedMinds = useCompanyStore((s) => s.placedMinds);
  const addMind = useCompanyStore((s) => s.addMind);
  const updateMindPosition = useCompanyStore((s) => s.updateMindPosition);
  const isDraggingFromSidebar = useCompanyStore((s) => s.isDraggingFromSidebar);

  const initialNodes = useMemo(() => buildNodes(placedMinds), [placedMinds]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  // Sync nodes with store whenever placedMinds changes
  React.useEffect(() => {
    setNodes(buildNodes(placedMinds));
  }, [placedMinds, setNodes]);

  // Handle node drag stop -- persist position to store
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateMindPosition(node.id, { x: node.position.x, y: node.position.y });
    },
    [updateMindPosition]
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
        id: `${archetypeId}-${Date.now()}`,
        archetypeId,
        role: null,
        position,
      };

      addMind(newMind);
    },
    [screenToFlowPosition, addMind]
  );

  const isEmpty = placedMinds.length === 0;

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

      {/* Color bleed from placed minds */}
      <ColorBleedLayer placedMinds={placedMinds} />

      {/* Ambient particles */}
      <AmbientParticles />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
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

      {/* Empty canvas prompt */}
      {isEmpty && (
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
