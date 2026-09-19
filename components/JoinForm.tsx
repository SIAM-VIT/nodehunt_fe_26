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
        const session = await createTeam(teamName.trim(), password.trim() || undefined);
        localStorage.setItem(STORAGE_SESSION_ID, session.session_id);
        localStorage.setItem(STORAGE_TEAM_NAME, session.team_name);

        const started = await startTeam(session.session_id);
        localStorage.setItem(STORAGE_CURRENT_NODE, started.current_node_id || "N01");

        router.push("/game");
      } else {
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
    <div className="w-full max-w-md mx-auto p-7 rounded-2xl bg-[#120b0a]/90 border border-[#271c19] backdrop-blur-xl shadow-2xl">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#271c19] mb-6 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
            mode === "register"
              ? "text-[#ea5832] border-b-2 border-[#d94f2b] font-bold"
              : "text-[#6e625a] hover:text-[#9e9087]"
          }`}
        >
          Register Team
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("resume");
            setError(null);
          }}
          className={`flex-1 pb-3 text-center transition-all cursor-pointer ${
            mode === "resume"
              ? "text-[#ea5832] border-b-2 border-[#d94f2b] font-bold"
              : "text-[#6e625a] hover:text-[#9e9087]"
          }`}
        >
          Resume Session
        </button>
      </div>

      {error && (
        <div className="p-3 mb-5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9e9087] mb-1.5">
            Team Name
          </label>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. StackHunters"
            className="w-full px-4 py-2.5 bg-[#0a0605] border border-[#3b2a26] focus:border-[#d94f2b] rounded-xl text-white font-sans text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9e9087] mb-1.5 flex justify-between">
            <span>Team Password</span>
            <span className="text-[#6e625a]">{mode === "register" ? "(Optional)" : "(Required)"}</span>
          </label>
          <input
            type="password"
            required={mode === "resume"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Create a session password" : "Enter team password"}
            className="w-full px-4 py-2.5 bg-[#0a0605] border border-[#3b2a26] focus:border-[#d94f2b] rounded-xl text-white font-sans text-sm focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-[#d94f2b] hover:bg-[#ea5832] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#d94f2b]/25 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authorizing..." : mode === "register" ? "Enter Arena →" : "Resume Hunt →"}
        </button>
      </form>
    </div>
  );
}

export default JoinForm;
