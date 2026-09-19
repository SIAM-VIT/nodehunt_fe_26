"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam, startTeam, loginTeam } from "@/lib/api";
import {
  STORAGE_SESSION_ID,
  STORAGE_TEAM_NAME,
  STORAGE_CURRENT_NODE,
} from "@/lib/constants";

export function JoinForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "resume">("register");
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        // Register team session
        const session = await createTeam(teamName.trim(), password.trim() || undefined);
        localStorage.setItem(STORAGE_SESSION_ID, session.session_id);
        localStorage.setItem(STORAGE_TEAM_NAME, session.team_name);

        // Explicitly start team at N01
        const started = await startTeam(session.session_id);
        localStorage.setItem(STORAGE_CURRENT_NODE, started.current_node_id || "N01");

        router.push("/game");
      } else {
        // Resume existing session
        const session = await loginTeam(teamName.trim(), password.trim());
        localStorage.setItem(STORAGE_SESSION_ID, session.session_id);
        localStorage.setItem(STORAGE_TEAM_NAME, session.team_name);
        localStorage.setItem(STORAGE_CURRENT_NODE, session.current_node_id || "N01");

        router.push("/game");
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#080e22]/90 border border-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500" />

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/10 mb-6 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
            mode === "register"
              ? "text-cyan-300 border-b-2 border-cyan-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Register New Team
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("resume");
            setError(null);
          }}
          className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
            mode === "resume"
              ? "text-cyan-300 border-b-2 border-cyan-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Resume Session
        </button>
      </div>

      {error && (
        <div className="p-3.5 mb-5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
          <span>✕</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">
            Team Name
          </label>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. StackHunters"
            className="w-full px-4 py-2.5 bg-[#030712] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-white font-sans text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between">
            <span>Team Password</span>
            <span className="text-slate-500">{mode === "register" ? "(Optional)" : "(Required)"}</span>
          </label>
          <input
            type="password"
            required={mode === "resume"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Create a session password" : "Enter team password"}
            className="w-full px-4 py-2.5 bg-[#030712] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-white font-sans text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authorizing..." : mode === "register" ? "Enter Arena" : "Resume Hunt"}
        </button>
      </form>
    </div>
  );
}
export default JoinForm;
