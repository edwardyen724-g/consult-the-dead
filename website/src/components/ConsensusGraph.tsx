"use client";

import { useState } from "react";

const GRAPH_SIZE = 260;
const CX = 130;
const CY = 130;
const ORBIT_R = 95;
const CENTER_R = 30;
const NODE_R = 16;

export type ConsensusNodeKey =
  | "POINTS"
  | "TENSIONS"
  | "ACTION"
  | "STEPS"
  | "RISKS";

export const NODE_LABELS: ConsensusNodeKey[] = [
  "POINTS",
  "TENSIONS",
  "ACTION",
  "STEPS",
  "RISKS",
];

export interface ConsensusGraphProps {
  started: boolean;
  summaries?: Partial<Record<ConsensusNodeKey, string>>;
  onNodeSelect?: (key: ConsensusNodeKey) => void;
  selected?: ConsensusNodeKey | null;
}

export function ConsensusGraph({
  started,
  summaries,
  onNodeSelect,
  selected,
}: ConsensusGraphProps) {
  const [hovered, setHovered] = useState<ConsensusNodeKey | null>(null);
  const active = hovered ?? selected ?? null;

  const outerNodes = NODE_LABELS.map((label, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return {
      label,
      x: CX + ORBIT_R * Math.cos(angle),
      y: CY + ORBIT_R * Math.sin(angle),
    };
  });

  const activeNode = active ? outerNodes.find((n) => n.label === active) : null;
  const activeSummary = active ? summaries?.[active] : null;

  return (
    <div style={{ position: "relative", width: GRAPH_SIZE, height: GRAPH_SIZE }}>
      <svg
        width={GRAPH_SIZE}
        height={GRAPH_SIZE}
        className={`gm-consensus-graph${started ? " gm-consensus-play" : ""}`}
        aria-hidden="true"
        overflow="visible"
      >
        {outerNodes.map((node, i) => {
          const dx = CX - node.x;
          const dy = CY - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / dist;
          const uy = dy / dist;
          return (
            <line
              key={i}
              x1={node.x + ux * NODE_R}
              y1={node.y + uy * NODE_R}
              x2={CX - ux * CENTER_R}
              y2={CY - uy * CENTER_R}
              stroke="var(--amber)"
              strokeWidth="1"
              className={`gm-consensus-line gm-cline-${i}`}
              opacity={active === node.label ? 1 : 0.65}
            />
          );
        })}

        {outerNodes.map((node, i) => {
          const isActive = active === node.label;
          const interactive = !!onNodeSelect || !!summaries;
          return (
            <circle
              key={i}
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill="var(--bg)"
              stroke={isActive ? "var(--amber)" : "var(--fg-dim)"}
              strokeWidth={isActive ? 1.5 : 1}
              className="gm-consensus-node"
              style={{
                transitionDelay: `${i * 120}ms`,
                cursor: interactive ? "pointer" : "default",
              }}
              onMouseEnter={() => interactive && setHovered(node.label)}
              onMouseLeave={() => interactive && setHovered(null)}
              onClick={() => onNodeSelect?.(node.label)}
            />
          );
        })}

        {outerNodes.map((node, i) => {
          const ux = (node.x - CX) / ORBIT_R;
          const uy = (node.y - CY) / ORBIT_R;
          const lx = node.x + ux * (NODE_R + 7);
          const ly = node.y + uy * (NODE_R + 7);
          const anchor = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
          const isActive = active === node.label;
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="font-mono gm-consensus-node"
              fill={isActive ? "var(--amber)" : "var(--fg-dim)"}
              fontSize="7"
              letterSpacing="0.06em"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {node.label}
            </text>
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="var(--bg)"
          stroke="var(--amber)"
          strokeWidth="1.5"
          className="gm-consensus-center"
        />
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono gm-consensus-center"
          fill="var(--amber)"
          fontSize="7"
        >
          CON-
        </text>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono gm-consensus-center"
          fill="var(--amber)"
          fontSize="7"
        >
          SENSUS
        </text>
      </svg>

      {activeNode && activeSummary && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: activeNode.x,
            top: activeNode.y + NODE_R + 18,
            transform: "translateX(-50%)",
            background: "var(--bg)",
            border: "1px solid var(--amber)",
            padding: "8px 12px",
            maxWidth: "220px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            lineHeight: 1.45,
            letterSpacing: "0.02em",
            color: "var(--fg)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              color: "var(--amber)",
              marginBottom: "4px",
              letterSpacing: "0.08em",
            }}
          >
            {activeNode.label}
          </div>
          <div style={{ color: "var(--fg-dim)" }}>{activeSummary}</div>
        </div>
      )}
    </div>
  );
}
