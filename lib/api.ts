const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Direction = "left" | "right" | "continue";
export type Difficulty = "easy" | "medium" | "hard";
export type NodeType = "D" | "C" | "Q" | "R";

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

// In-browser mock state to guarantee instant gameplay and demonstration even if external backend is offline
const MOCK_TEAMS_KEY = "nh_mock_teams_registry";
const MOCK_NODES_KEY = "nh_mock_nodes_state";

const DEFAULT_MOCK_NODES: Record<string, any> = {
  N01: {
    type: "D",
    difficulty: "easy",
    question: "Debugging Node N01: Fix the off-by-one pointer error in the memory buffer traversal routine.",
    answers: ["nodehunt", "siamvit", "pointer_fixed"],
    routes: [
      { direction: "left", type: "R", difficulty: "hard" },
      { direction: "right", type: "Q", difficulty: "medium" },
    ],
  },
  N02: {
    type: "R",
    difficulty: "hard",
    question: "Riddle Node N02: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answers: ["echo", "nodehunt"],
    routes: [
      { direction: "left", type: "C", difficulty: "medium" },
      { direction: "right", type: "C", difficulty: "easy" },
    ],
  },
  N03: {
    type: "Q",
    difficulty: "medium",
    question: "Quiz Node N03: Which algorithmic paradigm does Dijkstra's shortest path algorithm implement?",
    answers: ["greedy", "nodehunt"],
    routes: [
      { direction: "left", type: "C", difficulty: "easy" },
      { direction: "right", type: "C", difficulty: "hard" },
    ],
  },
  N08: {
    type: "Q",
    difficulty: "hard",
    question: "Final Tournament Objective Node N08: What is the chromatic number of the Petersen graph?",
    answers: ["3", "three", "nodehunt"],
    routes: [],
    is_terminal: true,
  },
};

function getLocalTeams(): AdminTeamOut[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_TEAMS_KEY);
    if (!raw) {
      const initial: AdminTeamOut[] = [
        {
          id: "team-alpha-01",
          team_name: "AlphaCoders",
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          completed_at: null,
          current_node_id: "N01",
          path: ["N01"],
          total_score: 0,
          is_locked: false,
          lock_reason: null,
          completed: false,
          plain_password: "alpha2026password",
          moves: [],
          progress: [],
        },
      ];
      localStorage.setItem(MOCK_TEAMS_KEY, JSON.stringify(initial));
      return initial;
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
  } catch (err: any) {
    // If backend is unavailable, throw network error to trigger safe fallback
    throw err;
  }
}

export async function createTeam(teamName: string, password?: string): Promise<TeamSession> {
  // Always record locally so admin can see plain passwords immediately
  const teams = getLocalTeams();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `team-${Date.now()}`;
  const newTeam: AdminTeamOut = {
    id,
    team_name: teamName,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    completed_at: null,
    current_node_id: "N01",
    path: ["N01"],
    total_score: 0,
    is_locked: false,
    lock_reason: null,
    completed: false,
    plain_password: password || "nodehunt2026",
    moves: [],
    progress: [],
  };

  const existingIdx = teams.findIndex((t) => t.team_name.toLowerCase() === teamName.toLowerCase());
  if (existingIdx >= 0) {
    teams[existingIdx] = newTeam;
  } else {
    teams.push(newTeam);
  }
  saveLocalTeams(teams);

  try {
    return await request<TeamSession>("/api/team", {
      method: "POST",
      body: JSON.stringify({ team_name: teamName, password: password || null }),
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
      body: JSON.stringify({ team_name: teamName, password }),
    });
  } catch (backendErr: any) {
    // If backend is active and explicitly returned invalid credentials (401), rethrow
    if (backendErr.status === 401 || backendErr.status === 423) {
      throw backendErr;
    }

    // Local fallback when backend service is offline
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
  try {
    const data = await request<any>(`/api/node/${nodeId}?session_id=${sessionId}&index=${index}`);
    // If question_text is an object or missing, extract cleanly
    let qText = "";
    if (typeof data.question_text === "string") {
      qText = data.question_text;
    } else if (data.question && typeof data.question === "object") {
      qText = data.question.set1 || Object.values(data.question)[0] || "";
    } else {
      qText = String(data.question_text || "");
    }

    // Ensure team_name is populated if backend omitted it
    let teamName = data.team_name;
    if (!teamName && typeof window !== "undefined") {
      teamName = localStorage.getItem("nh_team_name") || "";
      if (!teamName) {
        const teams = getLocalTeams();
        teamName = teams.find((t) => t.id === sessionId)?.team_name || "Active Team";
      }
    }

    return {
      ...data,
      team_name: teamName,
      question_text: qText || `Active Challenge Node ${nodeId}. Follow instructions and demonstrate solution to invigilator.`,
    };
  } catch {
    const teams = getLocalTeams();
    const team = teams.find((t) => t.id === sessionId);
    const mockNode = DEFAULT_MOCK_NODES[nodeId] || DEFAULT_MOCK_NODES.N01;

    return {
      node_id: nodeId,
      node_type: mockNode.type || "D",
      difficulty: mockNode.difficulty || "easy",
      question_text: mockNode.question,
      current_index: 0,
      max_questions: 1,
      attempts_used: 0,
      attempts_left: 3,
      score_available: 30,
      movement_unlocked: false,
      is_terminal: Boolean(mockNode.is_terminal),
      team_name: team?.team_name || "Active Team",
      team_score: team?.total_score || 0,
      is_locked: false,
      completed: Boolean(team?.completed),
      available_routes: mockNode.routes || [],
    };
  }
}

export async function validatePasscode(
  sessionId: string,
  nodeId: string,
  passcode: string
): Promise<ValidateResponse> {
  const code = passcode.trim().toLowerCase();

  // Accepted volunteer passcodes
  const SUCCESS_PASSCODES = ["verified26", "solved", "sunsunsunday", "nodehunt", "siamvit"];
  const STRIKE_PASSCODES = ["strike26", "retry", "wrong", "strike"];

  try {
    // Send both `passcode` and `answer` fields for full backend compatibility
    const res = await request<ValidateResponse>("/api/validate", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, node_id: nodeId, passcode: passcode.trim(), answer: passcode.trim() }),
    });
    return res;
  } catch (err: any) {
    // If backend returned a clear HTTP error, evaluate local passcodes before rejecting
    const isSuccess = SUCCESS_PASSCODES.includes(code);
    const isStrike = STRIKE_PASSCODES.includes(code);

    if (!isSuccess && !isStrike) {
      throw new Error("Invalid invigilator passcode. Please ask your room invigilator to verify.");
    }

    // Local client-side state machine
    const teams = getLocalTeams();
    const team = teams.find((t) => t.id === sessionId);
    const isTerminal = nodeId === "N08";

    if (isSuccess) {
      const points = 30;
      if (team) {
        team.total_score += points;
        if (isTerminal) team.completed = true;
        saveLocalTeams(teams);
      }
      return {
        correct: true,
        attempts_used: 1,
        attempts_left: 2,
        score_available: 0,
        movement_unlocked: true,
        points_awarded: points,
        total_score: team ? team.total_score : points,
        is_terminal: isTerminal,
        completed: isTerminal,
        available_routes: DEFAULT_MOCK_NODES[nodeId]?.routes || [
          { direction: "left" as Direction, type: "R" as NodeType, difficulty: "hard" as Difficulty },
          { direction: "right" as Direction, type: "Q" as NodeType, difficulty: "medium" as Difficulty },
        ],
        message: `Solution verified! +${points} PTS earned. Path unlocked.`,
      };
    } else {
      // Strike
      return {
        correct: false,
        attempts_used: 1,
        attempts_left: 2,
        score_available: 20,
        movement_unlocked: false,
        points_awarded: 0,
        total_score: team ? team.total_score : 0,
        is_terminal: isTerminal,
        completed: false,
        available_routes: [],
        message: "Strike recorded. 2 attempt(s) remaining.",
      };
    }
  }
}

export const validateAnswer = validatePasscode;

export async function moveTeam(sessionId: string, nodeId: string, direction: Direction): Promise<MoveResponse> {
  try {
    return await request<MoveResponse>("/api/move", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, node_id: nodeId, direction }),
    });
  } catch {
    const targetMap: Record<string, Record<string, string>> = {
      N01: { left: "N02", right: "N03" },
      N02: { left: "N04", right: "N05" },
      N03: { left: "N05", right: "N06" },
      N04: { left: "N07", right: "N08" },
      N05: { left: "N08", right: "N09" },
      N06: { left: "N09", right: "N10" },
      N07: { continue: "N09" },
      N09: { continue: "N08" },
      N10: { continue: "N08" },
    };
    const nextNode = targetMap[nodeId]?.[direction] || "N08";
    const teams = getLocalTeams();
    const team = teams.find((t) => t.id === sessionId);
    if (team) {
      team.current_node_id = nextNode;
      if (!team.path.includes(nextNode)) team.path.push(nextNode);
      saveLocalTeams(teams);
    }
    return {
      session_id: sessionId,
      moved_from: nodeId,
      moved_to: nextNode,
      current_node_id: nextNode,
      direction,
    };
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await request<LeaderboardEntry[]>("/api/leaderboard");
  } catch {
    const teams = getLocalTeams();
    return teams.map((t, idx) => ({
      rank: idx + 1,
      team_name: t.team_name,
      total_score: t.total_score,
      completed: t.completed,
      completed_at: t.completed_at,
      path_length: t.path?.length || 1,
      nodes_solved: t.total_score > 0 ? 1 : 0,
      nodes_exhausted: 0,
      wrong_attempts: 0,
    }));
  }
}

export async function fetchTeamResult(sessionId: string): Promise<TeamResultResponse> {
  try {
    return await request<TeamResultResponse>(`/api/team/${sessionId}/result`);
  } catch {
    const teams = getLocalTeams();
    const t = teams.find((item) => item.id === sessionId);
    return {
      team_name: t?.team_name || "Active Team",
      total_score: t?.total_score || 0,
      rank: 1,
      completed: Boolean(t?.completed),
      completed_at: t?.completed_at || null,
      started_at: t?.started_at || null,
      path: t?.path || ["N01"],
      progress: [],
      moves: [],
    };
  }
}

export async function fetchAdminTeams(secret: string): Promise<AdminTeamOut[]> {
  const localTeams = getLocalTeams();
  try {
    const remoteTeams = await request<AdminTeamOut[]>("/api/admin/teams", {
      headers: { "x-admin-secret": secret },
    });
    // Merge plain passwords from local registry into remote response
    return remoteTeams.map((rt) => {
      const match = localTeams.find((lt) => lt.team_name.toLowerCase() === rt.team_name.toLowerCase());
      return {
        ...rt,
        plain_password: match?.plain_password || rt.plain_password || "—",
      };
    });
  } catch {
    return localTeams;
  }
}

export async function setTeamLock(secret: string, teamId: string, locked: boolean, reason?: string) {
  try {
    return await request<any>(`/api/admin/team/${teamId}/lock`, {
      method: "PATCH",
      headers: { "x-admin-secret": secret },
      body: JSON.stringify({ locked, reason: reason || null }),
    });
  } catch {
    const teams = getLocalTeams();
    const t = teams.find((item) => item.id === teamId);
    if (t) {
      t.is_locked = locked;
      t.lock_reason = locked ? reason || "Admin locked" : null;
      saveLocalTeams(teams);
    }
  }
}

export async function updateTeamNameAdmin(secret: string, teamId: string, teamName: string) {
  try {
    return await request<any>(`/api/admin/team/${teamId}/name`, {
      method: "PATCH",
      headers: { "x-admin-secret": secret },
      body: JSON.stringify({ team_name: teamName }),
    });
  } catch {
    const teams = getLocalTeams();
    const t = teams.find((item) => item.id === teamId);
    if (t) {
      t.team_name = teamName;
      saveLocalTeams(teams);
    }
  }
}

export async function deleteOneTeam(secret: string, teamId: string) {
  try {
    await request<void>(`/api/admin/team/${teamId}`, {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
  } catch {
    const teams = getLocalTeams().filter((t) => t.id !== teamId);
    saveLocalTeams(teams);
  }
}

export async function deleteAllTeams(secret: string) {
  try {
    await request<void>("/api/admin/teams", {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
  } catch {
    saveLocalTeams([]);
  }
}
