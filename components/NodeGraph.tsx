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
    if (adminMode) {
      return new Set(HUNT_NODES.map((n) => n.id));
    }
    const set = new Set<string>(visitedNodes);
    set.add(currentNodeId);

    if (availableRoutes && availableRoutes.length > 0) {
      const outgoingEdges = HUNT_EDGES.filter((e) => e.from === currentNodeId);
      for (const route of availableRoutes) {
        const matchingEdge = outgoingEdges.find((e) => e.direction === route.direction);
        if (matchingEdge) {
          set.add(matchingEdge.to);
        }
      }
    }
    return set;
  }, [adminMode, visitedNodes, currentNodeId, availableRoutes]);

  const visibleEdges = useMemo(() => {
    if (adminMode) {
      return HUNT_EDGES;
    }
    return HUNT_EDGES.filter(
      (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
    );
  }, [adminMode, visibleNodeIds]);

  const getNodeCoords = (node: HuntNode) => {
    const cx = (node.x / 100) * 680 + 60;
    const cy = (node.y / 100) * 440 + 40;
    return { cx, cy };
  };

  const getSelectableRoute = (targetNodeId: string) => {
    if (!availableRoutes || availableRoutes.length === 0) return null;
    const edge = HUNT_EDGES.find(
      (e) => e.from === currentNodeId && e.to === targetNodeId
    );
    if (!edge) return null;
    return availableRoutes.find((r) => r.direction === edge.direction);
  };

  return (
    <div
      className={`relative w-full ${
        compact ? "h-[320px]" : "h-[440px]"
      } bg-slate-950/70 rounded-2xl border border-slate-800/80 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner`}
    >
      {/* Discreet Header Label */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {adminMode ? "Full Graph Map (10 Nodes)" : "Active Radar"}
        </span>
        {!adminMode && (
          <span className="text-[10px] bg-slate-900 border border-slate-700/60 px-2 py-0.5 rounded text-indigo-300 font-mono">
            Fog of War
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 800 520"
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead-slate"
            markerWidth="8"
            markerHeight="6"
            refX="27"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#334155" />
          </marker>
          <marker
            id="arrowhead-indigo"
            markerWidth="9"
            markerHeight="6.5"
            refX="28"
            refY="3.25"
            orient="auto"
          >
            <polygon points="0 0, 9 3.25, 0 6.5" fill="#6366f1" />
          </marker>
          <marker
            id="arrowhead-teal"
            markerWidth="10"
            markerHeight="7"
            refX="30"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#0d9488" />
          </marker>
        </defs>

        {/* Render Edges */}
        {HUNT_EDGES.map((edge, i) => {
          const fromNode = HUNT_NODES.find((n) => n.id === edge.from);
          const toNode = HUNT_NODES.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isVisible = visibleEdges.includes(edge);
          const fromCoords = getNodeCoords(fromNode);
          const toCoords = getNodeCoords(toNode);

          const isTraversed =
            visitedNodes.includes(fromNode.id) &&
            (visitedNodes.includes(toNode.id) || toNode.id === currentNodeId);

          const selectableRoute = getSelectableRoute(toNode.id);

          if (!adminMode && !isVisible) {
            return null;
          }

          let strokeColor = "#1e293b";
          let strokeWidth = 1.5;
          let marker = "url(#arrowhead-slate)";
          let strokeDash = "none";

          if (isTraversed) {
            strokeColor = "#6366f1";
            strokeWidth = 3;
            marker = "url(#arrowhead-indigo)";
          } else if (selectableRoute) {
            strokeColor = "#14b8a6";
            strokeWidth = 3.5;
            marker = "url(#arrowhead-teal)";
            strokeDash = "6,4";
          }

          const midX = (fromCoords.cx + toCoords.cx) / 2;
          const midY = (fromCoords.cy + toCoords.cy) / 2;

          return (
            <g key={`edge-${i}`}>
              <line
                x1={fromCoords.cx}
                y1={fromCoords.cy}
                x2={toCoords.cx}
                y2={toCoords.cy}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={marker}
              />
              {selectableRoute && (
                <g>
                  <rect
                    x={midX - 32}
                    y={midY - 12}
                    width={64}
                    height={22}
                    rx={6}
                    fill="#020617"
                    stroke="#14b8a6"
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 1}
                    fill="#14b8a6"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {selectableRoute.direction.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render Nodes */}
        {HUNT_NODES.map((node) => {
          const isVisible = visibleNodeIds.has(node.id);
          const isCurrent = currentNodeId === node.id;
          const isVisited = visitedNodes.includes(node.id);
          const selectableRoute = getSelectableRoute(node.id);
          const coords = getNodeCoords(node);
          const teamCount = teamLocations[node.id] ?? 0;

          if (!adminMode && !isVisible) {
            return (
              <g key={node.id} opacity={0.12}>
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={20}
                  fill="#090d16"
                  stroke="#334155"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              </g>
            );
          }

          let fillColor = "#0f172a";
          let strokeColor = "#334155";
          let strokeWidth = 2;

          if (isCurrent) {
            fillColor = "#1e1b4b"; // deep indigo
            strokeColor = "#818cf8";
            strokeWidth = 3.5;
          } else if (selectableRoute) {
            fillColor = "#042f2e"; // deep teal
            strokeColor = "#14b8a6";
            strokeWidth = 3.5;
          } else if (isVisited) {
            fillColor = "#064e3b"; // deep emerald
            strokeColor = "#10b981";
            strokeWidth = 2;
          }

          const radius = node.terminal ? 26 : 22;

          return (
            <g
              key={node.id}
              className={`${
                selectableRoute ? "cursor-pointer" : "cursor-default"
              } transition-transform`}
              onClick={() => {
                if (selectableRoute && onSelectRoute) {
                  onSelectRoute(selectableRoute.direction);
                }
              }}
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
                  stroke={isCurrent ? "#818cf8" : "#f43f5e"}
                  strokeWidth={1.5}
                  strokeDasharray={isCurrent ? "4,3" : "none"}
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
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
                fill={
                  isCurrent
                    ? "#e0e7ff"
                    : isVisited
                    ? "#6ee7b7"
                    : selectableRoute
                    ? "#5eead4"
                    : "#cbd5e1"
                }
              >
                {node.id}
              </text>

              {/* Node Sub-badge (Type + Diff) */}
              <text
                x={coords.cx}
                y={coords.cy + 11}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8.5"
                fontFamily="monospace"
                fill="#94a3b8"
              >
                {node.type}•{node.difficulty[0].toUpperCase()}
              </text>

              {/* Admin Team Location Indicator */}
              {adminMode && teamCount > 0 && (
                <g>
                  <circle
                    cx={coords.cx + 16}
                    cy={coords.cy - 16}
                    r={9.5}
                    fill="#ef4444"
                    stroke="#020617"
                    strokeWidth={1.5}
                  />
                  <text
                    x={coords.cx + 16}
                    y={coords.cy - 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9.5"
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
