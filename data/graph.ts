export type NodeType = "D" | "C" | "Q" | "R";
export type Difficulty = "easy" | "medium" | "hard";
export type Direction = "left" | "right" | "continue";

export interface HuntNode {
  id: string;
  type: NodeType;
  difficulty: Difficulty;
  x: number;
  y: number;
  terminal?: boolean;
  start?: boolean;
}

export interface HuntEdge {
  from: string;
  to: string;
  direction: Direction;
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  D: "Debugging",
  C: "Coding",
  Q: "Quiz",
  R: "Riddle",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/**
 * 10-node tournament graph:
 * N01 (D, Medium) - Start
 * N02 (C, Easy)
 * N03 (R, Medium)
 * N04 (Q, Hard)
 * N05 (C, Medium)
 * N06 (D, Medium)
 * N07 (D, Easy)
 * N08 (C, Easy) [formerly N10, intermediary]
 * N09 (R, Medium)
 * N10 (Q, Hard) - Terminal / Finale Node 10
 */
export const HUNT_NODES: HuntNode[] = [
  { id: "N01", type: "D", difficulty: "medium", x: 50, y: 8, start: true },
  { id: "N02", type: "C", difficulty: "easy", x: 34, y: 24 },
  { id: "N03", type: "R", difficulty: "medium", x: 66, y: 24 },
  { id: "N04", type: "Q", difficulty: "hard", x: 22, y: 44 },
  { id: "N05", type: "C", difficulty: "medium", x: 50, y: 44 },
  { id: "N06", type: "D", difficulty: "medium", x: 78, y: 44 },
  { id: "N07", type: "D", difficulty: "easy", x: 18, y: 68 },
  { id: "N08", type: "C", difficulty: "easy", x: 82, y: 68 },
  { id: "N09", type: "R", difficulty: "medium", x: 64, y: 88 },
  { id: "N10", type: "Q", difficulty: "hard", x: 42, y: 88, terminal: true },
];

export const HUNT_EDGES: HuntEdge[] = [
  { from: "N01", to: "N02", direction: "left" },
  { from: "N01", to: "N03", direction: "right" },
  { from: "N02", to: "N04", direction: "left" },
  { from: "N02", to: "N03", direction: "right" },
  { from: "N03", to: "N05", direction: "left" },
  { from: "N03", to: "N06", direction: "right" },
  { from: "N04", to: "N07", direction: "left" },
  { from: "N04", to: "N06", direction: "right" },
  { from: "N05", to: "N10", direction: "left" },
  { from: "N05", to: "N09", direction: "right" },
  { from: "N06", to: "N05", direction: "left" },
  { from: "N06", to: "N08", direction: "right" },
  { from: "N07", to: "N09", direction: "continue" },
  { from: "N08", to: "N09", direction: "continue" },
  { from: "N09", to: "N10", direction: "continue" },
];

export function getNode(id: string): HuntNode | undefined {
  return HUNT_NODES.find((node) => node.id === id);
}

export function getRoutePreview(nodeId: string) {
  return HUNT_EDGES.filter((edge) => edge.from === nodeId).map((edge) => {
    const target = getNode(edge.to);
    return {
      direction: edge.direction,
      targetId: edge.to,
      type: target?.type ?? "Q",
      difficulty: target?.difficulty ?? "medium",
      terminal: target?.terminal ?? false,
    };
  });
}
