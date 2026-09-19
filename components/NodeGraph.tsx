"use client";

import { useMemo, useState } from "react";
import { HUNT_NODES, HUNT_EDGES, NODE_TYPE_LABELS, HuntNode } from "@/data/graph";
import type { RoutePreview } from "@/lib/api";

interface NodeGraphProps {
  currentNodeId?: string;
  visitedNodes?: string[];
  availableRoutes?: RoutePreview[];
  onSelectRoute?: (direction: string) => void;
  // If adminMode is true, reveals the entire map and shows team density
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

  // In participant mode, enforce Fog of War:
  // Visible nodes: visited nodes + current node + immediate unlocked next nodes
  const visibleNodeIds = useMemo(() => {
    if (adminMode) {
      return new Set(HUNT_NODES.map((n) => n.id));
    }
    const set = new Set<string>(visitedNodes);
    set.add(currentNodeId);

    // If movement is unlocked, reveal the next target nodes
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
    // Return viewBox coordinates (width: 800, height: 600)
    const cx = (node.x / 100) * 700 + 50;
    const cy = (node.y / 100) * 500 + 50;
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
    <div className={`relative w-full ${compact ? "h-[340px]" : "h-[480px]"} bg-[#060b18]/80 rounded-2xl border border-cyan-500/20 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 shadow-2xl shadow-cyan-950/40`}>
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Header Badge */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400" />
        <span className="text-xs uppercase font-mono tracking-widest text-cyan-300 font-bold">
          {adminMode ? "Live Radar Grid (10 Nodes)" : "Hunt Path Radar"}
        </span>
        {!adminMode && (
          <span className="text-[10px] bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-400 font-mono">
            Fog of War Active
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 800 600"
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker
            id="arrowhead-cyan"
            markerWidth="8"
            markerHeight="6"
            refX="28"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#00f3ff" />
          </marker>
          <marker
            id="arrowhead-amber"
            markerWidth="10"
            markerHeight="7"
            refX="32"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
          </marker>
          <marker
            id="arrowhead-dim"
            markerWidth="8"
            markerHeight="6"
            refX="28"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#334155" />
          </marker>
        </defs>

        {/* Draw Edges */}
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
          let strokeWidth = 2;
          let marker = "url(#arrowhead-dim)";
          let strokeDash = "none";

          if (isTraversed) {
            strokeColor = "#00f3ff";
            strokeWidth = 3.5;
            marker = "url(#arrowhead-cyan)";
          } else if (selectableRoute) {
            strokeColor = "#fbbf24";
            strokeWidth = 4;
            marker = "url(#arrowhead-amber)";
            strokeDash = "8,4";
          } else if (adminMode) {
            strokeColor = "#334155";
            strokeWidth = 2;
            marker = "url(#arrowhead-dim)";
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
                className="transition-all duration-300"
              />
              {selectableRoute && (
                <g>
                  <rect
                    x={midX - 35}
                    y={midY - 14}
                    width={70}
                    height={20}
                    rx={6}
                    fill="#060b18"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY}
                    fill="#fbbf24"
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

        {/* Draw Nodes */}
        {HUNT_NODES.map((node) => {
          const isVisible = visibleNodeIds.has(node.id);
          const isCurrent = currentNodeId === node.id;
          const isVisited = visitedNodes.includes(node.id);
          const selectableRoute = getSelectableRoute(node.id);
          const coords = getNodeCoords(node);
          const teamCount = teamLocations[node.id] ?? 0;

          if (!adminMode && !isVisible) {
            return (
              <g key={node.id} opacity={0.15}>
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={22}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                />
              </g>
            );
          }

          let fillColor = "#0b1329";
          let strokeColor = "#334155";
          let strokeWidth = 2;
          let filter: string | undefined = undefined;

          if (isCurrent) {
            fillColor = "#042f2e";
            strokeColor = "#00f3ff";
            strokeWidth = 4;
            filter = "url(#glow-cyan)";
          } else if (selectableRoute) {
            fillColor = "#451a03";
            strokeColor = "#fbbf24";
            strokeWidth = 4;
            filter = "url(#glow-amber)";
          } else if (isVisited) {
            fillColor = "#064e3b";
            strokeColor = "#10b981";
            strokeWidth = 2.5;
          }

          const radius = node.terminal ? 28 : 24;

          return (
            <g
              key={node.id}
              className={`cursor-${selectableRoute ? "pointer" : "default"} transition-all duration-300`}
              onClick={() => {
                if (selectableRoute && onSelectRoute) {
                  onSelectRoute(selectableRoute.direction);
                }
              }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Terminal Outer Double Circle */}
              {node.terminal && (
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={radius + 8}
                  fill="none"
                  stroke={isCurrent ? "#00f3ff" : "#ef4444"}
                  strokeWidth={2}
                  strokeDasharray={isCurrent ? "6,3" : "none"}
                />
              )}

              {/* Main Node Circle */}
              <circle
                cx={coords.cx}
                cy={coords.cy}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                filter={filter}
              />

              {/* Node ID label */}
              <text
                x={coords.cx}
                y={coords.cy - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontFamily="monospace"
                fontWeight="bold"
                fill={isCurrent ? "#00f3ff" : isVisited ? "#34d399" : selectableRoute ? "#fbbf24" : "#94a3b8"}
              >
                {node.id}
              </text>

              {/* Node Type Badge under ID */}
              <text
                x={coords.cx}
                y={coords.cy + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="monospace"
                fill="#64748b"
              >
                {node.type} • {node.difficulty[0].toUpperCase()}
              </text>

              {/* Admin Mode: Team count indicator */}
              {adminMode && teamCount > 0 && (
                <g>
                  <circle
                    cx={coords.cx + 18}
                    cy={coords.cy - 18}
                    r={11}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  <text
                    x={coords.cx + 18}
                    y={coords.cy - 17}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
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
