"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginTeam } from "@/lib/api";
import {
  STORAGE_SESSION_ID,
  STORAGE_TEAM_NAME,
  STORAGE_CURRENT_NODE,
} from "@/lib/constants";
import { ShieldCheck, KeyRound, Play } from "lucide-react";

export function JoinForm() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<{ id: string; name: string; node: string } | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem(STORAGE_SESSION_ID);
    const sName = localStorage.getItem(STORAGE_TEAM_NAME);
    const sNode = localStorage.getItem(STORAGE_CURRENT_NODE) || "N01";
    if (sid && sName) {
      setActiveSession({ id: sid, name: sName, node: sNode });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginTeam(teamName.trim(), password.trim());
      localStorage.setItem(STORAGE_SESSION_ID, session.session_id);
      localStorage.setItem(STORAGE_TEAM_NAME, session.team_name);
      localStorage.setItem(STORAGE_CURRENT_NODE, session.current_node_id || "N01");

      router.push("/game");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate team. Ensure your team has been created by an admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    router.push("/game");
  };

  const handleClearSession = () => {
    localStorage.removeItem(STORAGE_SESSION_ID);
    localStorage.removeItem(STORAGE_TEAM_NAME);
    localStorage.removeItem(STORAGE_CURRENT_NODE);
    setActiveSession(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-7 rounded-2xl bg-[#0c0807]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
      {activeSession && (
        <div className="mb-6 p-4 rounded-xl bg-[#1c110e] border border-[#b43426]/40 text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#e06655] font-semibold">
              Active Session Found
            </span>
            <span className="text-[11px] font-mono text-[#8c8079]">
              Node: {activeSession.node}
            </span>
          </div>
          <div className="text-base font-bold text-white font-mono mb-3">
            {activeSession.name}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="flex-1 py-2 px-3 rounded-lg bg-[#b43426] hover:bg-[#c84332] text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" /> Resume Arena
            </button>
            <button
              onClick={handleClearSession}
              className="py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#a69a93] text-xs font-mono transition-colors cursor-pointer"
            >
              Switch Team
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-[#1d0f0c] border border-[#b43426]/40 flex items-center justify-center text-[#e06655]">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide">
            Team Authentication
          </h2>
          <p className="text-[11px] text-[#8c8079] font-mono">
            Enter assigned team credentials to access arena
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8c8079] mb-1.5">
            Team Name
          </label>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. StackHunters"
            className="w-full px-4 py-2.5 bg-[#050505] border border-white/[0.1] focus:border-[#b43426] rounded-xl text-white font-sans text-sm focus:outline-none placeholder:text-[#594f49]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8c8079] mb-1.5">
            Team Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password given by admin"
            className="w-full px-4 py-2.5 bg-[#050505] border border-white/[0.1] focus:border-[#b43426] rounded-xl text-white font-sans text-sm focus:outline-none placeholder:text-[#594f49]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-[#b43426] hover:bg-[#c84332] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#b43426]/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authorizing Team..." : "Enter Arena →"}
        </button>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#594f49] font-mono">
            Need a team created? Contact an organizer at the invigilator desk.
          </p>
        </div>
      </form>
    </div>
  );
}

export default JoinForm;
