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
      } bg-[#0c0908]/85 rounded-2xl border border-[#2b1f1c] backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 shadow-2xl`}
    >
      {/* Header Label */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#d94f2b]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#d6ccc4] font-semibold">
          {adminMode ? "Full Graph Map (10 Nodes)" : "Active Radar"}
        </span>
        {!adminMode && (
          <span className="text-[10px] bg-[#1a1210] border border-[#3e2722] px-2 py-0.5 rounded text-[#ea5832] font-mono">
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
            id="arrowhead-dim"
            markerWidth="8"
            markerHeight="6"
            refX="27"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#392b27" />
          </marker>
          <marker
            id="arrowhead-rust"
            markerWidth="9"
            markerHeight="6.5"
            refX="28"
            refY="3.25"
            orient="auto"
          >
            <polygon points="0 0, 9 3.25, 0 6.5" fill="#d94f2b" />
          </marker>
          <marker
            id="arrowhead-amber"
            markerWidth="10"
            markerHeight="7"
            refX="30"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#e5933a" />
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

          let strokeColor = "#251b18";
          let strokeWidth = 1.5;
          let marker = "url(#arrowhead-dim)";
          let strokeDash = "none";

          if (isTraversed) {
            strokeColor = "#d94f2b";
            strokeWidth = 3;
            marker = "url(#arrowhead-rust)";
          } else if (selectableRoute) {
            strokeColor = "#e5933a";
            strokeWidth = 3.5;
            marker = "url(#arrowhead-amber)";
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
                    fill="#0d0807"
                    stroke="#e5933a"
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 1}
                    fill="#e5933a"
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
                  fill="#120c0a"
                  stroke="#342521"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              </g>
            );
          }

          let fillColor = "#16100e";
          let strokeColor = "#382823";
          let strokeWidth = 2;

          if (isCurrent) {
            fillColor = "#3d140b"; // deep rust
            strokeColor = "#ea5832";
            strokeWidth = 3.5;
          } else if (selectableRoute) {
            fillColor = "#341d08"; // warm amber
            strokeColor = "#e5933a";
            strokeWidth = 3.5;
          } else if (isVisited) {
            fillColor = "#26130e"; // subtle warm brick
            strokeColor = "#c24122";
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
                  stroke={isCurrent ? "#ea5832" : "#991b1b"}
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
                    ? "#fff5f0"
                    : isVisited
                    ? "#fbd7cf"
                    : selectableRoute
                    ? "#fed7aa"
                    : "#d6ccc4"
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
                fill="#9e9087"
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
                    fill="#d94f2b"
                    stroke="#070505"
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
