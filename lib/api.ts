import {
  HUNT_NODES,
  HUNT_EDGES,
  getRoutePreview,
  type Direction,
  type NodeType,
  type Difficulty,
} from "@/data/graph";

const RAW_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API = RAW_API.replace(/\/+$/, "");

export type { Direction, Difficulty, NodeType };

export interface TeamSession {
  session_id: string;
  team_name: string;
  status: "REGISTERED" | "ACTIVE" | "COMPLETED" | "LOCKED";
  current_node_id?: string;
  password?: string;
}

export interface RoutePreview {
  direction: Direction;
  type: NodeType;
  difficulty: Difficulty;
  terminal?: boolean;
}

export interface NodeQuestion {
  node_id: string;
  node_type: NodeType;
  difficulty: Difficulty;
  question_text: string;
  current_index: number;
  max_questions: number;
  attempts_used: number;
  attempts_left: number;
  score_available: number;
  movement_unlocked: boolean;
  is_terminal: boolean;
  team_name: string;
  team_score: number;
  is_locked: boolean;
  completed: boolean;
  available_routes: RoutePreview[];
}

export interface ValidateResponse {
  correct: boolean;
  attempts_used: number;
  attempts_left?: number;
  score_available?: number;
  movement_unlocked: boolean;
  points_awarded: number;
  total_score: number;
  is_terminal?: boolean;
  completed?: boolean;
  next_node_id?: string;
  available_routes?: RoutePreview[];
  message: string;
}

export interface MoveResponse {
  session_id: string;
  moved_from: string;
  moved_to: string;
  current_node_id: string;
  direction: Direction;
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  total_score: number;
  completed: boolean;
  completed_at: string | null;
  path_length: number;
  nodes_solved: number;
  nodes_exhausted: number;
  wrong_attempts: number;
}

export interface MoveOut {
  from_node: string;
  to_node: string;
  direction: string;
  moved_at: string;
}

export interface ProgressOut {
  node_id: string;
  attempts_used: number;
  solved: boolean;
  exhausted: boolean;
  movement_unlocked: boolean;
  points_awarded: number;
  solved_at: string | null;
}

export interface TeamResultResponse {
  team_name: string;
  total_score: number;
  rank: number | null;
  completed: boolean;
  completed_at: string | null;
  started_at: string | null;
  path: string[];
  progress: ProgressOut[];
  moves: MoveOut[];
}

export interface AdminTeamOut {
  id: string;
  team_name: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  current_node_id: string;
  path: string[];
  total_score: number;
  is_locked: boolean;
  lock_reason: string | null;
  completed: boolean;
  plain_password?: string;
  password_hash?: string;
  moves: MoveOut[];
  progress: ProgressOut[];
}

const MOCK_TEAMS_KEY = "nh_mock_teams_registry";

function getLocalTeams(): AdminTeamOut[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_TEAMS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalTeams(teams: AdminTeamOut[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_TEAMS_KEY, JSON.stringify(teams));
}

function getOrInitNodeProgress(team: AdminTeamOut, nodeId: string): ProgressOut {
  if (!team.progress) team.progress = [];
  let prog = team.progress.find((p) => p.node_id === nodeId);
  if (!prog) {
    prog = {
      node_id: nodeId,
      attempts_used: 0,
      solved: false,
      exhausted: false,
      movement_unlocked: false,
      points_awarded: 0,
      solved_at: null,
    };
    team.progress.push(prog);
  }
  return prog;
}

export function getConnectedRoutes(nodeId: string): RoutePreview[] {
  return getRoutePreview(nodeId).map((r) => ({
    direction: r.direction as Direction,
    type: r.type as NodeType,
    difficulty: r.difficulty as Difficulty,
    terminal: r.terminal,
  }));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      typeof errorData.detail === "string"
        ? errorData.detail
        : Array.isArray(errorData.detail)
        ? errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ")
        : typeof errorData.message === "string"
        ? errorData.message
        : `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export async function createTeam(teamName: string, password?: string): Promise<TeamSession> {
  const teams = getLocalTeams();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `team-${Date.now()}`;
  const newTeam: AdminTeamOut = {
    id,
    team_name: teamName.trim(),
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    completed_at: null,
    current_node_id: "N01",
    path: ["N01"],
    total_score: 0,
    is_locked: false,
    lock_reason: null,
    completed: false,
    plain_password: password?.trim() || "nodehunt2026",
    moves: [],
    progress: [],
  };

  const existingIdx = teams.findIndex((t) => t.team_name.toLowerCase() === teamName.trim().toLowerCase());
  if (existingIdx >= 0) {
    teams[existingIdx] = newTeam;
  } else {
    teams.push(newTeam);
  }
  saveLocalTeams(teams);

  try {
    return await request<TeamSession>("/api/team", {
      method: "POST",
      body: JSON.stringify({ team_name: teamName.trim(), password: password?.trim() || null }),
    });
  } catch {
    return {
      session_id: newTeam.id,
      team_name: newTeam.team_name,
      status: "ACTIVE",
      current_node_id: "N01",
      password: newTeam.plain_password,
    };
  }
}

export async function startTeam(sessionId: string): Promise<TeamSession> {
  try {
    return await request<TeamSession>("/api/team/start", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch {
    const teams = getLocalTeams();
    const t = teams.find((item) => item.id === sessionId);
    return {
      session_id: sessionId,
      team_name: t?.team_name || "Active Team",
      status: "ACTIVE",
      current_node_id: t?.current_node_id || "N01",
    };
  }
}

export async function loginTeam(teamName: string, password: string): Promise<TeamSession> {
  try {
    return await request<TeamSession>("/api/team/login", {
      method: "POST",
      body: JSON.stringify({ team_name: teamName.trim(), password: password.trim() }),
    });
  } catch (backendErr: any) {
    if (backendErr.status === 401 || backendErr.status === 423) {
      throw backendErr;
    }

    const teams = getLocalTeams();
    const match = teams.find((t) => t.team_name.toLowerCase() === teamName.trim().toLowerCase());
    if (match) {
      if (match.plain_password && match.plain_password !== password.trim()) {
        const err = new Error("Invalid team password") as Error & { status: number };
        err.status = 401;
        throw err;
      }
      return {
        session_id: match.id,
        team_name: match.team_name,
        status: match.is_locked ? "LOCKED" : match.completed ? "COMPLETED" : "ACTIVE",
        current_node_id: match.current_node_id || "N01",
      };
    }
    throw backendErr;
  }
}

export async function fetchNode(nodeId: string, sessionId: string, index = 0): Promise<NodeQuestion> {
  const teams = getLocalTeams();
  let team = teams.find((t) => t.id === sessionId);
  if (!team) {
    team = {
      id: sessionId,
      team_name: typeof window !== "undefined" ? localStorage.getItem("nh_team_name") || "Active Team" : "Active Team",
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: null,
      current_node_id: nodeId,
      path: [nodeId],
      total_score: 0,
      is_locked: false,
      lock_reason: null,
      completed: false,
      moves: [],
      progress: [],
    };
    teams.push(team);
    saveLocalTeams(teams);
  }

  const prog = getOrInitNodeProgress(team, nodeId);
  const attemptsUsed = prog.attempts_used;
  const attemptsLeft = Math.max(0, 3 - attemptsUsed);
  const scoreAvailable = prog.movement_unlocked ? 0 : attemptsLeft === 3 ? 30 : attemptsLeft === 2 ? 20 : attemptsLeft === 1 ? 10 : 0;
  const isTerminal = nodeId === "N10";
  const connectedRoutes = getConnectedRoutes(nodeId);

  try {
    const data = await request<any>(`/api/node/${nodeId}?session_id=${sessionId}&index=${index}`);
    let qText = "";
    if (typeof data.question_text === "string") {
      qText = data.question_text;
    } else if (data.question && typeof data.question === "object") {
      qText = data.question.set1 || Object.values(data.question)[0] || "";
    } else {
      qText = String(data.question_text || "");
    }

    return {
      node_id: nodeId,
      node_type: data.node_type || "D",
      difficulty: data.difficulty || "easy",
      question_text: qText || `Active Challenge Node ${nodeId}. Follow instructions and demonstrate solution to invigilator.`,
      current_index: data.current_index ?? 0,
      max_questions: data.max_questions ?? 1,
      attempts_used: data.attempts_used ?? attemptsUsed,
      attempts_left: data.attempts_left ?? attemptsLeft,
      score_available: data.score_available ?? scoreAvailable,
      movement_unlocked: Boolean(data.movement_unlocked ?? prog.movement_unlocked),
      is_terminal: Boolean(data.is_terminal ?? isTerminal),
      team_name: team.team_name,
      team_score: data.team_score ?? team.total_score,
      is_locked: Boolean(data.is_locked ?? team.is_locked),
      completed: Boolean(data.completed ?? team.completed),
      available_routes: (data.movement_unlocked || prog.movement_unlocked) && !isTerminal ? connectedRoutes : [],
    };
  } catch {
    const nodeObj = HUNT_NODES.find((n) => n.id === nodeId);
    return {
      node_id: nodeId,
      node_type: (nodeObj?.type || "D") as NodeType,
      difficulty: (nodeObj?.difficulty || "easy") as Difficulty,
      question_text:
        nodeId === "N10"
          ? "Final Tournament Objective Node N10: What is the chromatic number of the Petersen graph?"
          : `Challenge Node ${nodeId}: Implement the optimal graph traversal algorithm with minimal memory overhead.`,
      current_index: 0,
      max_questions: 1,
      attempts_used: attemptsUsed,
      attempts_left: attemptsLeft,
      score_available: scoreAvailable,
      movement_unlocked: prog.movement_unlocked,
      is_terminal: isTerminal,
      team_name: team.team_name,
      team_score: team.total_score,
      is_locked: team.is_locked,
      completed: team.completed,
      available_routes: prog.movement_unlocked && !isTerminal ? connectedRoutes : [],
    };
  }
}

export async function validatePasscode(
  sessionId: string,
  nodeId: string,
  passcode: string
): Promise<ValidateResponse> {
  const code = passcode.trim().toLowerCase();

  const SUCCESS_PASSCODES = ["verified26", "solved", "sunsunsunday", "nodehunt", "siamvit"];
  const STRIKE_PASSCODES = ["strike26", "retry", "wrong", "strike"];

  const isSuccess = SUCCESS_PASSCODES.includes(code);
  const isStrike = STRIKE_PASSCODES.includes(code);

  if (!isSuccess && !isStrike) {
    throw new Error("Invalid invigilator passcode. Please ask your room invigilator to verify.");
  }

  // Synchronize local state
  const teams = getLocalTeams();
  let team = teams.find((t) => t.id === sessionId);
  if (!team) {
    team = {
      id: sessionId,
      team_name: typeof window !== "undefined" ? localStorage.getItem("nh_team_name") || "Active Team" : "Active Team",
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: null,
      current_node_id: nodeId,
      path: [nodeId],
      total_score: 0,
      is_locked: false,
      lock_reason: null,
      completed: false,
      moves: [],
      progress: [],
    };
    teams.push(team);
  }

  const prog = getOrInitNodeProgress(team, nodeId);
  const isTerminal = nodeId === "N10";
  const connectedRoutes = getConnectedRoutes(nodeId);

  // If already unlocked, respond idempotently
  if (prog.movement_unlocked) {
    return {
      correct: prog.solved,
      attempts_used: prog.attempts_used,
      attempts_left: Math.max(0, 3 - prog.attempts_used),
      score_available: 0,
      movement_unlocked: true,
      points_awarded: prog.points_awarded,
      total_score: team.total_score,
      is_terminal: isTerminal,
      completed: team.completed,
      available_routes: isTerminal ? [] : connectedRoutes,
      message: team.completed ? "Hunt completed." : "Movement already unlocked. Choose your next route.",
    };
  }

  // Increment attempt
  prog.attempts_used += 1;
  const attemptsLeft = Math.max(0, 3 - prog.attempts_used);

  if (isSuccess) {
    // 1st try = 30, 2nd try = 20, 3rd try = 10
    const points = prog.attempts_used === 1 ? 30 : prog.attempts_used === 2 ? 20 : 10;
    prog.solved = true;
    prog.exhausted = false;
    prog.movement_unlocked = true;
    prog.points_awarded = points;
    prog.solved_at = new Date().toISOString();
    team.total_score += points;

    if (isTerminal) {
      team.completed = true;
      team.completed_at = new Date().toISOString();
    }
    saveLocalTeams(teams);

    // Call backend
    try {
      const remoteRes = await request<ValidateResponse>("/api/validate", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, node_id: nodeId, passcode: passcode.trim(), answer: passcode.trim() }),
      });
      if (remoteRes.total_score !== undefined) {
        team.total_score = remoteRes.total_score;
      }
      saveLocalTeams(teams);
      return {
        ...remoteRes,
        available_routes: isTerminal ? [] : connectedRoutes,
      };
    } catch (e) {
      console.warn("Backend validate fallback:", e);
    }

    return {
      correct: true,
      attempts_used: prog.attempts_used,
      attempts_left: attemptsLeft,
      score_available: 0,
      movement_unlocked: true,
      points_awarded: points,
      total_score: team.total_score,
      is_terminal: isTerminal,
      completed: team.completed,
      available_routes: isTerminal ? [] : connectedRoutes,
      message: team.completed
        ? `Tournament completed! Solved ${nodeId} for +${points} PTS.`
        : `Solution verified! +${points} PTS earned. Path unlocked.`,
    };
  }

  // Strike logic
  if (prog.attempts_used >= 3) {
    // 3 strikes exhausted: 0 points but movement unlocked!
    prog.exhausted = true;
    prog.solved = false;
    prog.movement_unlocked = true;
    prog.points_awarded = 0;

    if (isTerminal) {
      team.completed = true;
      team.completed_at = new Date().toISOString();
    }
    saveLocalTeams(teams);

    // Call backend
    try {
      const remoteRes = await request<ValidateResponse>("/api/validate", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, node_id: nodeId, passcode: passcode.trim(), answer: passcode.trim() }),
      });
      return {
        ...remoteRes,
        available_routes: isTerminal ? [] : connectedRoutes,
      };
    } catch (e) {
      console.warn("Backend validate fallback:", e);
    }

    return {
      correct: false,
      attempts_used: 3,
      attempts_left: 0,
      score_available: 0,
      movement_unlocked: true,
      points_awarded: 0,
      total_score: team.total_score,
      is_terminal: isTerminal,
      completed: team.completed,
      available_routes: isTerminal ? [] : connectedRoutes,
      message: team.completed
        ? "No attempts left. Tournament finalized with 0 PTS for this node."
        : "All 3 attempts used. You earned 0 PTS, but forward path is now unlocked.",
    };
  }

  // 1st or 2nd Strike: deduct available score for NEXT attempt, movement remains locked
  const nextAvailable = attemptsLeft === 2 ? 20 : attemptsLeft === 1 ? 10 : 0;
  saveLocalTeams(teams);

  // Call backend
  try {
    const remoteRes = await request<ValidateResponse>("/api/validate", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, node_id: nodeId, passcode: passcode.trim(), answer: passcode.trim() }),
    });
    return {
      ...remoteRes,
      available_routes: [],
    };
  } catch (e) {
    console.warn("Backend validate fallback:", e);
  }

  return {
    correct: false,
    attempts_used: prog.attempts_used,
    attempts_left: attemptsLeft,
    score_available: nextAvailable,
    movement_unlocked: false,
    points_awarded: 0,
    total_score: team.total_score,
    is_terminal: isTerminal,
    completed: false,
    available_routes: [],
    message: `Strike recorded. ${attemptsLeft} attempt(s) remaining (${nextAvailable} PTS available).`,
  };
}

export const validateAnswer = validatePasscode;

export async function moveTeam(sessionId: string, nodeId: string, direction: Direction): Promise<MoveResponse> {
  const teams = getLocalTeams();
  const team = teams.find((t) => t.id === sessionId);

  // Strictly look up outgoing edge in verified 10-node graph
  const edge = HUNT_EDGES.find((e) => e.from === nodeId && e.direction === direction);
  if (!edge) {
    throw new Error(`Invalid traversal: No path '${direction}' from ${nodeId}`);
  }

  const nextNodeId = edge.to;

  if (team) {
    team.current_node_id = nextNodeId;
    if (!team.path.includes(nextNodeId)) {
      team.path.push(nextNodeId);
    }
    if (!team.moves) team.moves = [];
    team.moves.push({
      from_node: nodeId,
      to_node: nextNodeId,
      direction,
      moved_at: new Date().toISOString(),
    });
    saveLocalTeams(teams);
  }

  try {
    return await request<MoveResponse>("/api/move", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, node_id: nodeId, direction }),
    });
  } catch {
    return {
      session_id: sessionId,
      moved_from: nodeId,
      moved_to: nextNodeId,
      current_node_id: nextNodeId,
      direction,
    };
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const localTeams = getLocalTeams();
  // Filter for completed teams primarily, sort by highest score, then completion time
  const sorted = [...localTeams]
    .filter((t) => t.completed)
    .sort((a, b) => b.total_score - a.total_score || (a.completed_at || "").localeCompare(b.completed_at || ""));

  return sorted.map((t, idx) => ({
    rank: idx + 1,
    team_name: t.team_name,
    total_score: t.total_score,
    completed: t.completed,
    completed_at: t.completed_at,
    path_length: t.path?.length || 1,
    nodes_solved: (t.progress || []).filter((p) => p.solved).length,
    nodes_exhausted: (t.progress || []).filter((p) => p.exhausted).length,
    wrong_attempts: (t.progress || []).reduce((acc, p) => acc + (p.attempts_used - (p.solved ? 1 : 0)), 0),
  }));
}

export async function fetchTeamResult(sessionId: string): Promise<TeamResultResponse> {
  try {
    const t = await request<AdminTeamOut>(`/api/team/${sessionId}`);
    return {
      team_name: t.team_name,
      total_score: t.total_score,
      rank: null,
      completed: Boolean(t.completed),
      completed_at: t.completed_at || null,
      started_at: t.started_at || null,
      path: t.path && t.path.length > 0 ? t.path : ["N01"],
      progress: t.progress || [],
      moves: t.moves || [],
    };
  } catch {
    const teams = getLocalTeams();
    const t = teams.find((item) => item.id === sessionId);

    // Compute rank amongst completed teams
    const completedSorted = [...teams]
      .filter((team) => team.completed)
      .sort((a, b) => b.total_score - a.total_score);

    const rankIdx = completedSorted.findIndex((item) => item.id === sessionId);
    const rank = rankIdx >= 0 ? rankIdx + 1 : null;

    return {
      team_name: t?.team_name || "Active Team",
      total_score: t?.total_score || 0,
      rank,
      completed: Boolean(t?.completed),
      completed_at: t?.completed_at || null,
      started_at: t?.started_at || null,
      path: t?.path || ["N01"],
      progress: t?.progress || [],
      moves: t?.moves || [],
    };
  }
}

export async function fetchAdminTeams(secret: string): Promise<AdminTeamOut[]> {
  const localTeams = getLocalTeams();
  try {
    const remoteTeams = await request<AdminTeamOut[]>("/api/admin/teams", {
      headers: { "x-admin-secret": secret },
    });
    return remoteTeams.map((rt) => {
      const match = localTeams.find((lt) => lt.team_name.toLowerCase() === rt.team_name.toLowerCase());
      return {
        ...rt,
        plain_password: match?.plain_password || rt.plain_password || "—",
      };
    });
  } catch (err) {
    return localTeams;
  }
}

export async function setTeamLock(secret: string, teamId: string, locked: boolean, reason?: string) {
  const teams = getLocalTeams();
  const t = teams.find((item) => item.id === teamId);
  if (t) {
    t.is_locked = locked;
    t.lock_reason = locked ? reason || "Admin locked" : null;
    saveLocalTeams(teams);
  }
  request<any>(`/api/admin/team/${teamId}/lock`, {
    method: "PATCH",
    headers: { "x-admin-secret": secret },
    body: JSON.stringify({ locked, reason: reason || null }),
  }).catch(() => {});
}

export async function updateTeamNameAdmin(secret: string, teamId: string, teamName: string) {
  const teams = getLocalTeams();
  const t = teams.find((item) => item.id === teamId);
  if (t) {
    t.team_name = teamName;
    saveLocalTeams(teams);
  }
  request<any>(`/api/admin/team/${teamId}/name`, {
    method: "PATCH",
    headers: { "x-admin-secret": secret },
    body: JSON.stringify({ team_name: teamName }),
  }).catch(() => {});
}

export async function deleteOneTeam(secret: string, teamId: string) {
  const teams = getLocalTeams().filter((t) => t.id !== teamId);
  saveLocalTeams(teams);
  request<void>(`/api/admin/team/${teamId}`, {
    method: "DELETE",
    headers: { "x-admin-secret": secret },
  }).catch(() => {});
}

export async function deleteAllTeams(secret: string) {
  saveLocalTeams([]);
  request<void>("/api/admin/teams", {
    method: "DELETE",
    headers: { "x-admin-secret": secret },
  }).catch(() => {});
}
