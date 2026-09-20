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

    // ONLY reveal target nodes if movement is actually unlocked and outgoing routes exist!
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
    // Only show edges between nodes that are both visible
    return HUNT_EDGES.filter((edge) => {
      // Show traversed path
      const isTraversed =
        visitedNodes.includes(edge.from) &&
        (visitedNodes.includes(edge.to) || edge.to === currentNodeId);

      // Show newly unlocked outgoing route from the current node
      const isUnlockedOutgoing =
        edge.from === currentNodeId &&
        availableRoutes &&
        availableRoutes.some((r) => r.direction === edge.direction);

      return isTraversed || isUnlockedOutgoing;
    });
  }, [adminMode, visitedNodes, currentNodeId, availableRoutes]);

  const getNodeCoords = (node: HuntNode) => {
    const cx = (node.x / 100) * 680 + 60;
    const cy = (node.y / 100) * 440 + 40;
    return { cx, cy };
  };

  const getSelectableRoute = (targetNodeId: string) => {
    // A route is ONLY selectable if movement is unlocked and the target is directly connected from current node
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
      } bg-[#080606]/85 rounded-2xl border border-white/[0.08] backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 shadow-2xl`}
    >
      {/* Header Label */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#b43426]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#d1c7c2] font-semibold">
          {adminMode ? "Full Graph Map (10 Nodes)" : "Active Radar"}
        </span>
        {!adminMode && (
          <span className="text-[10px] bg-[#140c0b] border border-[#3a1b17] px-2 py-0.5 rounded text-[#e06655] font-mono">
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
            <polygon points="0 0, 8 3, 0 6" fill="#2d2624" />
          </marker>
          <marker
            id="arrowhead-rust"
            markerWidth="9"
            markerHeight="6.5"
            refX="28"
            refY="3.25"
            orient="auto"
          >
            <polygon points="0 0, 9 3.25, 0 6.5" fill="#b43426" />
          </marker>
          <marker
            id="arrowhead-amber"
            markerWidth="10"
            markerHeight="7"
            refX="30"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#d9822b" />
          </marker>
        </defs>

        {/* Render Edges */}
        {HUNT_EDGES.map((edge, i) => {
          const fromNode = HUNT_NODES.find((n) => n.id === edge.from);
          const toNode = HUNT_NODES.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isVisible = visibleEdges.includes(edge);
          if (!adminMode && !isVisible) {
            return null;
          }

          const fromCoords = getNodeCoords(fromNode);
          const toCoords = getNodeCoords(toNode);

          const isTraversed =
            visitedNodes.includes(fromNode.id) &&
            (visitedNodes.includes(toNode.id) || toNode.id === currentNodeId);

          const selectableRoute = getSelectableRoute(toNode.id);

          let strokeColor = "#1f1a18";
          let strokeWidth = 1.5;
          let marker = "url(#arrowhead-dim)";
          let strokeDash = "none";

          if (isTraversed) {
            strokeColor = "#b43426";
            strokeWidth = 3;
            marker = "url(#arrowhead-rust)";
          } else if (selectableRoute) {
            strokeColor = "#d9822b";
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
                    fill="#080606"
                    stroke="#d9822b"
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 1}
                    fill="#d9822b"
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
            return null; // Fog of War hides unrevealed nodes completely
          }

          let fillColor = "#110d0c";
          let strokeColor = "#2c2220";
          let strokeWidth = 2;

          if (isCurrent) {
            fillColor = "#2b0f0b"; // deep muted rust
            strokeColor = "#c84332";
            strokeWidth = 3.5;
          } else if (selectableRoute) {
            fillColor = "#261506"; // muted warm amber
            strokeColor = "#d9822b";
            strokeWidth = 3.5;
          } else if (isVisited) {
            fillColor = "#1f100e"; // quiet brick
            strokeColor = "#9b3024";
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
                // Strictly disallow clicking on unselectable or disconnected nodes!
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
                  stroke={isCurrent ? "#c84332" : "#7f1d1d"}
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
                    ? "#fff5f4"
                    : isVisited
                    ? "#f0d5d2"
                    : selectableRoute
                    ? "#fed7aa"
                    : "#d1c7c2"
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
                fill="#8c8079"
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
                    fill="#b43426"
                    stroke="#050505"
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
