"use client";

import { useEffect, useState, useMemo } from "react";
import {
  fetchAdminTeams,
  setTeamLock,
  updateTeamNameAdmin,
  deleteOneTeam,
  deleteAllTeams,
  type AdminTeamOut,
} from "@/lib/api";
import { STORAGE_ADMIN_SECRET } from "@/lib/constants";
import { NodeGraph } from "./NodeGraph";

export function AdminPreview() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [teams, setTeams] = useState<AdminTeamOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_ADMIN_SECRET);
    if (saved) {
      setSecret(saved);
      loadDashboard(saved);
    }
  }, []);

  const loadDashboard = async (admSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTeams(admSecret);
      setTeams(data);
      setAuthed(true);
      localStorage.setItem(STORAGE_ADMIN_SECRET, admSecret);
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
    if (!confirm(`Are you sure you want to permanently delete team "${team.team_name}"?`)) return;
    try {
      await deleteOneTeam(secret, team.id);
      setActionMsg(`Team "${team.team_name}" deleted.`);
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to delete team");
    }
  };

  const handleResetAll = async () => {
    const confirmText = prompt("DANGER: Type 'RESET' to delete ALL teams and wipe the tournament database:");
    if (confirmText !== "RESET") return;
    try {
      await deleteAllTeams(secret);
      setActionMsg("All tournament teams deleted cleanly.");
      loadDashboard(secret);
    } catch (err: any) {
      setError(err.message || "Failed to reset tournament");
    }
  };

  // Compute team distribution per node for admin radar
  const teamLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const team of teams) {
      if (!team.completed && team.current_node_id) {
        counts[team.current_node_id] = (counts[team.current_node_id] || 0) + 1;
      }
    }
    return counts;
  }, [teams]);

  if (!authed) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#080e22]/90 border border-cyan-500/20 backdrop-blur-xl rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold font-mono text-cyan-300 uppercase tracking-wider mb-2">
          Organizers Portal
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Enter admin secret header to monitor live teams and manage event controls.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            required
            placeholder="Enter X-Admin-Secret..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#030712] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
          >
            {loading ? "Authenticating..." : "Access Control Panel"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Admin Top HUD */}
      <div className="bg-[#080e22]/90 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            Organizers Command Deck
          </span>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Live Tournament Telemetry ({teams.length} Teams)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(secret)}
            className="px-4 py-2 bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-cyan-300 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-red-950/80 border border-red-500/40 hover:bg-red-900 text-red-300 font-mono text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Danger: Reset All
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_ADMIN_SECRET);
              setAuthed(false);
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          ✓ {actionMsg}
        </div>
      )}

      {/* Grid: Full 10-Node Radar (Right) & Live Teams Table (Left) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Full Organizers Radar Map */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
              Full 10-Node Grid & Team Locations
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              Active Map
            </span>
          </div>

          <NodeGraph
            adminMode={true}
            teamLocations={teamLocations}
            compact={false}
          />

          <div className="bg-[#060b18]/70 border border-cyan-500/10 rounded-xl p-3 text-[11px] font-mono text-slate-400">
            Red badges indicate how many teams are currently on that node.
          </div>
        </div>

        {/* Live Teams Management Table */}
        <div className="lg:col-span-7 bg-[#060b18]/90 border border-cyan-500/20 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-cyan-500/10 flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-white">
              Registered Teams ({teams.length})
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#040816] text-slate-400 uppercase tracking-wider text-[11px] border-b border-cyan-500/10 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-2 text-center">Node</th>
                  <th className="py-3 px-2 text-center">Score</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 text-slate-300">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      <div>{t.team_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Path: {t.path?.join(" → ") || "N01"}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-cyan-300">
                      {t.current_node_id}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-amber-300">
                      {t.total_score} PTS
                    </td>
                    <td className="py-3 px-2 text-center">
                      {t.is_locked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 border border-red-500/40 text-red-300">
                          LOCKED
                        </span>
                      ) : t.completed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleRename(t)}
                        title="Rename Team"
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleToggleLock(t)}
                        title={t.is_locked ? "Unlock Team" : "Lock Team"}
                        className={`px-2 py-1 rounded text-[10px] cursor-pointer font-bold ${
                          t.is_locked
                            ? "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-900/60 hover:bg-amber-800 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {t.is_locked ? "Unlock" : "Lock"}
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t)}
                        title="Delete Team"
                        className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30 rounded text-[10px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminPreview;
