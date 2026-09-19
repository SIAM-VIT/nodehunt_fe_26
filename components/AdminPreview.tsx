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

  if (!authed) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#120b0a]/90 border border-[#271c19] backdrop-blur-xl rounded-2xl shadow-xl">
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider mb-2">
          Organizers Command Deck
        </h2>
        <p className="text-xs text-[#9e9087] mb-6 font-mono">
          Enter admin secret header to monitor live teams and access controls.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
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
            className="w-full px-4 py-2.5 bg-[#090504] border border-[#3b2a26] focus:border-[#d94f2b] rounded-xl text-white font-mono text-sm placeholder:text-[#6e625a] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#d94f2b] hover:bg-[#ea5832] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#d94f2b]/20"
          >
            {loading ? "Authenticating..." : "Access Control Panel"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Admin Header */}
      <div className="bg-[#120b0a]/90 border border-[#271c19] rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#ea5832] font-semibold block">
            Command Deck
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Live Tournament Telemetry ({teams.length} Teams)
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadDashboard(secret)}
            className="px-3 py-1.5 bg-[#1e1513] hover:bg-[#2c1e1b] rounded-lg text-[#d6ccc4] font-mono text-xs transition-colors cursor-pointer border border-[#392925]"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 text-rose-300 font-mono text-xs rounded-lg transition-colors cursor-pointer"
          >
            Reset All
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_ADMIN_SECRET);
              setAuthed(false);
            }}
            className="px-3 py-1.5 bg-[#120b0a] hover:bg-[#1c120f] text-[#9e9087] font-mono text-xs rounded-lg transition-colors cursor-pointer border border-[#271c19]"
          >
            Logout
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          ✓ {actionMsg}
        </div>
      )}

      {/* Grid: 10-Node Radar (Left) | Live Teams Table (Right) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Full Radar Map */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-[#9e9087]">
            <span className="font-semibold uppercase tracking-wider">Full 10-Node Grid</span>
            <span className="text-[#ea5832]">Live Density</span>
          </div>

          <NodeGraph
            adminMode={true}
            teamLocations={teamLocations}
            compact={false}
          />
        </div>

        {/* Live Teams Table */}
        <div className="lg:col-span-7 bg-[#120b0a]/90 border border-[#271c19] rounded-2xl backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="p-3.5 border-b border-[#241a17] flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Teams List ({teams.length})
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#090504] text-[#9e9087] uppercase tracking-wider text-[11px] border-b border-[#241a17] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-center">Node</th>
                  <th className="py-2.5 px-2 text-center">Score</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241a17] text-[#d6ccc4]">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1a110e]/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white">
                      <div>{t.team_name}</div>
                      <div className="text-[10px] text-[#6e625a] font-mono">
                        {t.path?.join(" → ") || "N01"}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#ea5832]">
                      {t.current_node_id}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-white">
                      {t.total_score} PTS
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {t.is_locked ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 border border-rose-500/40 text-rose-300">
                          LOCKED
                        </span>
                      ) : t.completed ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                          DONE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e1513] text-[#d6ccc4]">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleRename(t)}
                        className="px-2 py-0.5 bg-[#1c1412] hover:bg-[#281c19] text-[#d6ccc4] rounded text-[10px] cursor-pointer border border-[#3b2a26]"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleToggleLock(t)}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-bold ${
                          t.is_locked
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : "bg-[#1c1412] text-[#e5933a] border border-[#e5933a]/30"
                        }`}
                      >
                        {t.is_locked ? "Unlock" : "Lock"}
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t)}
                        className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded text-[10px] cursor-pointer"
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
