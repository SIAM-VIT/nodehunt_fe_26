"use client";

import { useEffect, useState, useMemo } from "react";
import {
  fetchAdminTeams,
  setTeamLock,
  updateTeamNameAdmin,
  deleteOneTeam,
  deleteAllTeams,
  createTeam,
  fetchLeaderboard,
  type AdminTeamOut,
  type LeaderboardEntry,
} from "@/lib/api";
import { NodeGraph } from "./NodeGraph";
import {
  LayoutDashboard,
  Users,
  Compass,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Edit2,
  LogOut,
  ShieldAlert,
  Search,
  Activity,
  ChevronRight,
  UserPlus,
  Key,
  Trophy,
} from "lucide-react";

type AdminTab = "dashboard" | "teams" | "create" | "radar" | "standings";

export function AdminPreview() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [teams, setTeams] = useState<AdminTeamOut[]>([]);
  const [officialLeaderboard, setOfficialLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPassword, setNewTeamPassword] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const loadDashboard = async (admSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const [teamsData, lbData] = await Promise.all([
        fetchAdminTeams(admSecret),
        fetchLeaderboard(),
      ]);
      setTeams(teamsData);
      setOfficialLeaderboard(lbData);
      setAuthed(true);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate admin secret");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    loadDashboard(secret.trim());
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamPassword.trim()) {
      setError("Please provide both Team Name and Team Password.");
      return;
    }
    setCreatingTeam(true);
    setError(null);
    try {
      await createTeam(newTeamName.trim(), newTeamPassword.trim());
      setActionMsg(`Team "${newTeamName.trim()}" successfully created! Passcode: ${newTeamPassword.trim()}`);
      setNewTeamName("");
      setNewTeamPassword("");
      await loadDashboard(secret);
      setActiveTab("teams");
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleToggleLock = async (team: AdminTeamOut) => {
    try {
      await setTeamLock(secret, team.id, !team.is_locked, !team.is_locked ? "Admin locked" : undefined);
      setActionMsg(`Team "${team.team_name}" ${!team.is_locked ? "LOCKED" : "UNLOCKED"}`);
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to toggle lock");
    }
  };

  const handleRename = async (team: AdminTeamOut) => {
    const newName = prompt(`Enter new name for team "${team.team_name}":`, team.team_name);
    if (!newName || !newName.trim() || newName.trim() === team.team_name) return;
    try {
      await updateTeamNameAdmin(secret, team.id, newName.trim());
      setActionMsg(`Team renamed to "${newName.trim()}"`);
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to rename team");
    }
  };

  const handleDeleteTeam = async (team: AdminTeamOut) => {
    if (!confirm(`Are you sure you want to delete team "${team.team_name}"?`)) return;
    try {
      await deleteOneTeam(secret, team.id);
      setActionMsg(`Team "${team.team_name}" deleted.`);
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to delete team");
    }
  };

  const handleResetAll = async () => {
    const confirmText = prompt("Type 'RESET' to delete ALL teams and wipe the database:");
    if (confirmText !== "RESET") return;
    try {
      await deleteAllTeams(secret);
      setActionMsg("All tournament teams deleted cleanly.");
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to reset tournament");
    }
  };

  const teamLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const team of teams) {
      if (!team.completed && team.current_node_id) {
        counts[team.current_node_id] = (counts[team.current_node_id] || 0) + 1;
      }
    }
    return counts;
  }, [teams]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) =>
        t.team_name.toLowerCase().includes(q) ||
        t.current_node_id.toLowerCase().includes(q) ||
        t.id.toString().includes(q)
    );
  }, [teams, searchQuery]);

  const stats = useMemo(() => {
    const total = teams.length;
    const completed = teams.filter((t) => t.completed).length;
    const locked = teams.filter((t) => t.is_locked).length;
    const active = total - completed;
    const avgScore = total > 0 ? Math.round(teams.reduce((acc, t) => acc + t.total_score, 0) / total) : 0;
    return { total, completed, locked, active, avgScore };
  }, [teams]);

  const synchronizedRankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.total_score - a.total_score || (a.completed_at || "").localeCompare(b.completed_at || ""));
  }, [teams]);

  // Login view
  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 bg-[#252526] border border-[#3e3e42] rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center text-[#4fc1ff]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                NodeHunt Command Deck
              </h2>
              <p className="text-xs text-[#858585] font-mono">
                Invigilation & Tournament Control
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-[#3c1e1e] border border-[#f48771]/30 text-[#f48771] text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-1.5 font-semibold">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-mono text-sm placeholder:text-[#858585] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-[#007acc]/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Control Deck →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="grid lg:grid-cols-12 gap-6 min-h-[82vh]">
        {/* ── Left Sidebar Navigation ── */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#3e3e42]">
              <div className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center text-[#4fc1ff] font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">NODEHUNT CONTROL</div>
                <div className="text-[10px] text-[#858585] font-mono uppercase tracking-wider">
                  Invigilator Hub
                </div>
              </div>
            </div>

            <nav className="space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#858585] px-3 py-1 font-semibold">
                Overview
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#1e2e3e] text-[#4fc1ff] font-bold border border-[#007acc]/40"
                    : "text-[#cccccc] hover:text-white hover:bg-[#2d2d2d]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <div className="text-[10px] uppercase tracking-wider text-[#858585] px-3 pt-3 pb-1 font-semibold">
                Management
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "create"
                    ? "bg-[#1e2e3e] text-[#4fc1ff] font-bold border border-[#007acc]/40"
                    : "text-[#cccccc] hover:text-white hover:bg-[#2d2d2d]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-[#4fc1ff]" />
                  <span>Create Team</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab("teams")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "teams"
                    ? "bg-[#1e2e3e] text-[#4fc1ff] font-bold border border-[#007acc]/40"
                    : "text-[#cccccc] hover:text-white hover:bg-[#2d2d2d]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Teams Roster</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e1e1e] text-[#858585]">
                  {teams.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("standings")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "standings"
                    ? "bg-[#1e2e3e] text-[#4fc1ff] font-bold border border-[#007acc]/40"
                    : "text-[#cccccc] hover:text-white hover:bg-[#2d2d2d]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-[#dcdcaa]" />
                  <span>Tournament Standings</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e1e1e] text-[#dcdcaa]">
                  {officialLeaderboard.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("radar")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "radar"
                    ? "bg-[#1e2e3e] text-[#4fc1ff] font-bold border border-[#007acc]/40"
                    : "text-[#cccccc] hover:text-white hover:bg-[#2d2d2d]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4" />
                  <span>Topology Map</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <div className="text-[10px] uppercase tracking-wider text-[#858585] px-3 pt-4 pb-1 font-semibold">
                Emergency Controls
              </div>
              <button
                onClick={() => loadDashboard(secret)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-[#cccccc] hover:text-white hover:bg-[#2d2d2d] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Telemetry</span>
              </button>
              <button
                onClick={handleResetAll}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-[#f48771] hover:text-white hover:bg-[#3c1e1e] transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Teams</span>
              </button>
              <button
                onClick={() => {
                  setSecret("");
                  setAuthed(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-[#858585] hover:text-white transition-all cursor-pointer pt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* ── Main Panel Content ── */}
        <main className="lg:col-span-9 space-y-5">
          {actionMsg && (
            <div className="p-3.5 rounded-xl bg-[#1e3a2b] border border-[#4ec9b0]/40 text-[#4ec9b0] text-xs font-mono flex items-center justify-between">
              <span>✓ {actionMsg}</span>
              <button onClick={() => setActionMsg(null)} className="text-[#4ec9b0] text-sm">✕</button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-[#3c1e1e] border border-[#f48771]/40 text-[#f48771] text-xs font-mono flex items-center justify-between">
              <span>✕ {error}</span>
              <button onClick={() => setError(null)} className="text-[#f48771] text-sm">✕</button>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#252526] border border-[#3e3e42]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9cdcfe] block font-semibold">
                Total Teams
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#252526] border border-[#3e3e42]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9cdcfe] block font-semibold">
                Active in Graph
              </span>
              <div className="text-2xl font-bold font-mono text-[#4fc1ff] mt-1">{stats.active}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#252526] border border-[#3e3e42]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9cdcfe] block font-semibold">
                Graph Finished
              </span>
              <div className="text-2xl font-bold font-mono text-[#4ec9b0] mt-1">{stats.completed}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#252526] border border-[#3e3e42]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9cdcfe] block font-semibold">
                Average Score
              </span>
              <div className="text-2xl font-bold font-mono text-[#dcdcaa] mt-1">{stats.avgScore} PTS</div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              <div className="grid lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-5 p-4 rounded-2xl bg-[#252526] border border-[#3e3e42] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold uppercase tracking-wider">Topology Density</span>
                    <span className="text-[#4fc1ff]">10 Nodes</span>
                  </div>
                  <NodeGraph adminMode={true} teamLocations={teamLocations} compact={true} />
                </div>

                <div className="lg:col-span-7 p-5 rounded-2xl bg-[#252526] border border-[#3e3e42] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#3e3e42]">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#4fc1ff]" />
                      Leading Contenders (Score Ranked)
                    </h3>
                    <button
                      onClick={() => setActiveTab("standings")}
                      className="text-xs font-mono text-[#4fc1ff] hover:underline cursor-pointer"
                    >
                      View Finished Standings →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {synchronizedRankedTeams.slice(0, 5).map((team, idx) => (
                      <div
                        key={team.id}
                        className="p-3 rounded-xl bg-[#1e1e1e] border border-[#3e3e42] flex items-center justify-between text-xs font-mono hover:border-[#007acc] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 font-bold ${idx === 0 ? "text-[#dcdcaa]" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-500" : "text-[#858585]"}`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-sans font-bold text-white text-sm flex items-center gap-2">
                              <span>{team.team_name}</span>
                              {team.completed && (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1e3a2b] border border-[#4ec9b0]/40 text-[#4ec9b0]">
                                  FINISHER
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#858585]">
                              {team.completed ? "Reached Finale (N10)" : `On Node ${team.current_node_id}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#4ec9b0] font-bold text-sm">{team.total_score} PTS</div>
                          <div className="text-[10px] text-[#858585]">{team.path?.length || 1} steps traversed</div>
                        </div>
                      </div>
                    ))}
                    {synchronizedRankedTeams.length === 0 && (
                      <div className="py-8 text-center text-[#858585] font-mono text-xs">
                        No teams registered yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STANDINGS (Only Admin Can View Leaderboard) */}
          {activeTab === "standings" && (
            <div className="rounded-2xl bg-[#252526] border border-[#3e3e42] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#3e3e42] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#dcdcaa]" />
                    Official Tournament Standings
                  </h3>
                  <p className="text-[11px] text-[#858585] font-mono mt-0.5">
                    Teams that successfully reached and resolved the finale (Node N10)
                  </p>
                </div>
                <button
                  onClick={() => loadDashboard(secret)}
                  className="px-3 py-1.5 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#007acc]/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Standings</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#1e1e1e] text-[#9cdcfe] uppercase tracking-wider text-[11px] border-b border-[#3e3e42]">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-center">Solved</th>
                      <th className="py-3 px-4 text-center">Steps</th>
                      <th className="py-3 px-4 text-right">Finish Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3e3e42] text-[#cccccc]">
                    {officialLeaderboard.map((entry) => (
                      <tr key={entry.rank} className="hover:bg-[#2d2d2d] transition-colors">
                        <td className="py-3 px-4 font-bold text-sm">
                          {entry.rank === 1 ? "🥇 #1" : entry.rank === 2 ? "🥈 #2" : entry.rank === 3 ? "🥉 #3" : `#${entry.rank}`}
                        </td>
                        <td className="py-3 px-4 font-sans font-bold text-white text-sm">
                          {entry.team_name}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#4ec9b0] text-sm">
                          {entry.total_score} PTS
                        </td>
                        <td className="py-3 px-4 text-center text-[#4fc1ff] font-bold">
                          {entry.nodes_solved}
                        </td>
                        <td className="py-3 px-4 text-center text-[#858585]">
                          {entry.path_length}
                        </td>
                        <td className="py-3 px-4 text-right text-[#858585]">
                          {entry.completed_at ? new Date(entry.completed_at).toLocaleTimeString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {officialLeaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#858585] font-mono text-xs">
                          No teams have completed the tournament graph yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CREATE TEAM */}
          {activeTab === "create" && (
            <div className="p-7 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-xl max-w-xl">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#3e3e42]">
                <div className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center text-[#4fc1ff]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Register New Team
                  </h3>
                  <p className="text-xs text-[#858585] font-mono">
                    Participant creation is restricted to invigilators. Teams will use these credentials to log in.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-1.5 font-semibold">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. CyberVanguards"
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-sans text-sm focus:outline-none placeholder:text-[#858585]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-1.5 font-semibold">
                    Team Password / Access Token
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamPassword}
                    onChange={(e) => setNewTeamPassword(e.target.value)}
                    placeholder="e.g. hunt2026pass"
                    className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-mono text-sm focus:outline-none placeholder:text-[#858585]"
                  />
                  <p className="text-[11px] text-[#858585] font-mono mt-1">
                    Provide this password directly to the team participants for arena entry.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creatingTeam}
                  className="w-full mt-2 py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#007acc]/20 disabled:opacity-50 cursor-pointer"
                >
                  {creatingTeam ? "Provisioning Team..." : "Create Team Credentials →"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: TEAMS MANAGEMENT TABLE */}
          {activeTab === "teams" && (
            <div className="rounded-2xl bg-[#252526] border border-[#3e3e42] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#3e3e42] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white">
                  <Users className="w-4 h-4 text-[#4fc1ff]" />
                  <span>Registered Contenders ({filteredTeams.length})</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#858585]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search team or node..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white text-xs font-mono focus:outline-none placeholder:text-[#858585]"
                    />
                  </div>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-3 py-1.5 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#007acc]/20"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Team</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#1e1e1e] text-[#9cdcfe] uppercase tracking-wider text-[11px] border-b border-[#3e3e42] sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-3 text-center">Password</th>
                      <th className="py-3 px-3 text-center">Node</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3e3e42] text-[#cccccc]">
                    {filteredTeams.map((t) => (
                      <tr key={t.id} className="hover:bg-[#2d2d2d] transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          <div className="font-sans font-bold text-sm text-[#ffffff]">{t.team_name}</div>
                          <div className="text-[10px] text-[#858585] font-mono mt-0.5">
                            Path: {t.path?.join(" → ") || "N01"}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#3e3e42] text-[#dcdcaa] font-mono text-[11px] select-all">
                            <Key className="w-3 h-3 text-[#4fc1ff]" />
                            {t.plain_password || "••••••••"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#4fc1ff]">
                          {t.current_node_id}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#4ec9b0]">
                          {t.total_score} PTS
                        </td>
                        <td className="py-3 px-3 text-center">
                          {t.is_locked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#3c1e1e] border border-[#f48771]/50 text-[#f48771] font-bold">
                              LOCKED
                            </span>
                          ) : t.completed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#1e3a2b] border border-[#4ec9b0]/50 text-[#4ec9b0] font-bold">
                              COMPLETED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#2d2d2d] text-[#cccccc]">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleRename(t)}
                            title="Rename Team"
                            className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] text-[#cccccc] hover:text-white rounded-lg transition-colors cursor-pointer border border-[#3e3e42]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(t)}
                            title={t.is_locked ? "Unlock Team" : "Lock Team"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                              t.is_locked
                                ? "bg-[#1e3a2b] border-[#4ec9b0]/50 text-[#4ec9b0]"
                                : "bg-[#1e1e1e] border-[#3e3e42] text-[#f48771]"
                            }`}
                          >
                            {t.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(t)}
                            title="Delete Team"
                            className="p-1.5 bg-[#3c1e1e] hover:bg-[#502828] border border-[#f48771]/40 text-[#f48771] rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTeams.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#858585] font-mono text-xs">
                          No matching teams found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TOPOLOGY MAP */}
          {activeTab === "radar" && (
            <div className="p-6 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#3e3e42]">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#4fc1ff]" />
                    Global 10-Node Graph Topology
                  </h3>
                  <p className="text-xs text-[#858585] font-mono mt-0.5">
                    Live team density distribution across the tournament graph
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#cccccc]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007acc]" />
                  <span>Team Locations</span>
                </div>
              </div>

              <NodeGraph adminMode={true} teamLocations={teamLocations} compact={false} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPreview;
