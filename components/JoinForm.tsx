"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginTeam } from "@/lib/api";
import {
  STORAGE_SESSION_ID,
  STORAGE_TEAM_NAME,
  STORAGE_CURRENT_NODE,
} from "@/lib/constants";
import { KeyRound, Play } from "lucide-react";

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
    <div className="w-full max-w-xl mx-auto p-8 sm:p-10 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-2xl">
      {activeSession && (
        <div className="mb-8 p-5 rounded-xl bg-[#2d2d2d] border border-[#007acc]/50 text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#4fc1ff] font-bold">
              Active Session Found
            </span>
            <span className="text-xs font-mono text-[#858585]">
              Node: <strong className="text-[#ffffff]">{activeSession.node}</strong>
            </span>
          </div>
          <div className="text-lg font-bold text-[#ffffff] font-mono mb-4">
            {activeSession.name}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResume}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#007acc] hover:bg-[#1f8ad2] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#007acc]/25"
            >
              <Play className="w-4 h-4 fill-current" /> Resume Arena
            </button>
            <button
              onClick={handleClearSession}
              className="py-2.5 px-4 rounded-lg bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#cccccc] text-xs font-mono transition-colors cursor-pointer"
            >
              Switch Team
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[#3e3e42]">
        <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center text-[#4fc1ff]">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono text-[#ffffff] tracking-wide">
            Team Authentication
          </h2>
          <p className="text-xs text-[#9cdcfe] font-mono">
            Enter assigned team credentials to access arena
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-[#3c1e1e] border border-[#f48771]/40 text-[#f48771] text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-2 font-semibold">
            Team Name
          </label>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. StackHunters"
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-sans text-sm sm:text-base focus:outline-none placeholder:text-[#858585] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-2 font-semibold">
            Team Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password given by admin"
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-sans text-sm sm:text-base focus:outline-none placeholder:text-[#858585] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#007acc]/30 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authorizing Team..." : "Enter Arena →"}
        </button>
      </form>
    </div>
  );
}

export default JoinForm;
