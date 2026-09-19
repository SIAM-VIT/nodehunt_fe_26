const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Direction = "left" | "right" | "continue";
export type Difficulty = "easy" | "medium" | "hard";
export type NodeType = "D" | "C" | "Q" | "R";

export interface TeamSession {
  session_id: string;
  team_name: string;
  status: "REGISTERED" | "ACTIVE" | "COMPLETED" | "LOCKED";
  current_node_id?: string;
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
  moves: MoveOut[];
  progress: ProgressOut[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API}${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.detail ?? `Request failed with status ${res.status}`;
      const err = new Error(message) as Error & { status: number };
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(`Unable to connect to backend server at ${API}. Ensure backend is running.`);
    }
    throw err;
  }
}

export function createTeam(teamName: string, password?: string) {
  return request<TeamSession>("/api/team", {
    method: "POST",
    body: JSON.stringify({ team_name: teamName, password: password || null }),
  });
}

export function startTeam(sessionId: string) {
  return request<TeamSession>("/api/team/start", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export function loginTeam(teamName: string, password: string) {
  return request<TeamSession>("/api/team/login", {
    method: "POST",
    body: JSON.stringify({ team_name: teamName, password }),
  });
}

export function updateTeamName(sessionId: string, teamName: string) {
  return request<TeamSession>("/api/team/name", {
    method: "PATCH",
    body: JSON.stringify({ session_id: sessionId, team_name: teamName }),
  });
}

export function fetchNode(nodeId: string, sessionId: string, index = 0) {
  return request<NodeQuestion>(`/api/node/${nodeId}?session_id=${sessionId}&index=${index}`);
}

export function validatePasscode(sessionId: string, nodeId: string, passcode: string) {
  return request<ValidateResponse>("/api/validate", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, node_id: nodeId, passcode }),
  });
}

// Backward compatibility alias for validatePasscode
export const validateAnswer = validatePasscode;

export function moveTeam(sessionId: string, nodeId: string, direction: Direction) {
  return request<MoveResponse>("/api/move", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, node_id: nodeId, direction }),
  });
}

export function fetchLeaderboard() {
  return request<LeaderboardEntry[]>("/api/leaderboard");
}

export function fetchTeamResult(sessionId: string) {
  return request<TeamResultResponse>(`/api/team/${sessionId}/result`);
}

export function fetchAdminTeams(secret: string) {
  return request<AdminTeamOut[]>("/api/admin/teams", {
    headers: { "x-admin-secret": secret },
  });
}

export function fetchAdminLeaderboard(secret: string) {
  return request<LeaderboardEntry[]>("/api/admin/leaderboard", {
    headers: { "x-admin-secret": secret },
  });
}

export function setTeamLock(secret: string, teamId: string, locked: boolean, reason?: string) {
  return request<any>(`/api/admin/team/${teamId}/lock`, {
    method: "PATCH",
    headers: { "x-admin-secret": secret },
    body: JSON.stringify({ locked, reason: reason || null }),
  });
}

export function updateTeamNameAdmin(secret: string, teamId: string, teamName: string) {
  return request<any>(`/api/admin/team/${teamId}/name`, {
    method: "PATCH",
    headers: { "x-admin-secret": secret },
    body: JSON.stringify({ team_name: teamName }),
  });
}

export function deleteOneTeam(secret: string, teamId: string) {
  return request<void>(`/api/admin/team/${teamId}`, {
    method: "DELETE",
    headers: { "x-admin-secret": secret },
  });
}

export function deleteAllTeams(secret: string) {
  return request<void>("/api/admin/teams", {
    method: "DELETE",
    headers: { "x-admin-secret": secret },
  });
}
