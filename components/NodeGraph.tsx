"use client";

import { useMemo, useState } from "react";
import { HUNT_NODES, HUNT_EDGES, NODE_TYPE_LABELS, HuntNode } from "@/data/graph";
import type { RoutePreview } from "@/lib/api";

interface NodeGraphProps {
  currentNodeId?: string;
  visitedNodes?: string[];
  availableRoutes?: RoutePreview[];
  onSelectRoute?: (direction: string) => void;
  adminMode?: boolean;
  teamLocations?: Record<string, number>;
  compact?: boolean;
}

export function NodeGraph({
  currentNodeId = "N01",
  visitedNodes = ["N01"],
  availableRoutes = [],
  onSelectRoute,
  adminMode = false,
  teamLocations = {},
  compact = false,
}: NodeGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const visibleNodeIds = useMemo(() => {
    return new Set(HUNT_NODES.map((n) => n.id));
  }, []);

  const visibleEdges = useMemo(() => {
    return HUNT_EDGES;
  }, []);

  const getNodeCoords = (node: HuntNode) => {
    const cx = (node.x / 100) * 680 + 60;
    const cy = (node.y / 100) * 440 + 40;
    return { cx, cy };
  };

  return (
    <div
      className={`relative w-full ${
        compact ? "h-[320px]" : "h-[460px]"
      } bg-[#1e1e1e] rounded-2xl border border-[#3e3e42] overflow-hidden flex flex-col items-center justify-center p-3 shadow-2xl`}
    >
      {/* Header Label */}
      <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#007acc]" />
        <span className="text-xs font-mono uppercase tracking-wider text-[#d4d4d4] font-bold">
          Full Tournament Topology (10 Nodes)
        </span>
      </div>

      <svg
        viewBox="0 0 800 520"
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead-dim"
            markerWidth="8"
            markerHeight="6"
            refX="27"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#3e3e42" />
          </marker>
          <marker
            id="arrowhead-blue"
            markerWidth="9"
            markerHeight="6.5"
            refX="28"
            refY="3.25"
            orient="auto"
          >
            <polygon points="0 0, 9 3.25, 0 6.5" fill="#007acc" />
          </marker>
        </defs>

        {/* Render Edges */}
        {HUNT_EDGES.map((edge, i) => {
          const fromNode = HUNT_NODES.find((n) => n.id === edge.from);
          const toNode = HUNT_NODES.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const fromCoords = getNodeCoords(fromNode);
          const toCoords = getNodeCoords(toNode);

          return (
            <line
              key={`edge-${i}`}
              x1={fromCoords.cx}
              y1={fromCoords.cy}
              x2={toCoords.cx}
              y2={toCoords.cy}
              stroke="#3e3e42"
              strokeWidth={2}
              markerEnd="url(#arrowhead-dim)"
            />
          );
        })}

        {/* Render Nodes */}
        {HUNT_NODES.map((node) => {
          const coords = getNodeCoords(node);
          const teamCount = teamLocations[node.id] ?? 0;

          let fillColor = "#252526";
          let strokeColor = "#3e3e42";
          let strokeWidth = 2;

          if (node.terminal) {
            strokeColor = "#4fc1ff";
            strokeWidth = 3;
            fillColor = "#1e2e3e";
          } else if (teamCount > 0) {
            strokeColor = "#007acc";
            strokeWidth = 3;
            fillColor = "#1e3a5f";
          }

          const radius = node.terminal ? 26 : 22;

          return (
            <g
              key={node.id}
              className="cursor-default transition-transform"
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Terminal outer double ring */}
              {node.terminal && (
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={radius + 6}
                  fill="none"
                  stroke="#4fc1ff"
                  strokeWidth={2}
                  strokeDasharray="4,3"
                />
              )}

              {/* Node Circle */}
              <circle
                cx={coords.cx}
                cy={coords.cy}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />

              {/* Node ID */}
              <text
                x={coords.cx}
                y={coords.cy - 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#ffffff"
              >
                {node.id}
              </text>

              {/* Node Sub-badge (Type + Diff) */}
              <text
                x={coords.cx}
                y={coords.cy + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="monospace"
                fill="#858585"
              >
                {node.type}•{node.difficulty[0].toUpperCase()}
              </text>

              {/* Admin Team Location Indicator */}
              {teamCount > 0 && (
                <g>
                  <circle
                    cx={coords.cx + 17}
                    cy={coords.cy - 17}
                    r={10.5}
                    fill="#007acc"
                    stroke="#1e1e1e"
                    strokeWidth={2}
                  />
                  <text
                    x={coords.cx + 17}
                    y={coords.cy - 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {teamCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default NodeGraph;
