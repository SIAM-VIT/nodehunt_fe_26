"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchLeaderboard,
  fetchTeamResult,
  type LeaderboardEntry,
  type TeamResultResponse,
} from "@/lib/api";
import { STORAGE_SESSION_ID } from "@/lib/constants";

export function ResultsClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [personalResult, setPersonalResult] = useState<TeamResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = typeof window !== "undefined" ? localStorage.getItem(STORAGE_SESSION_ID) : null;

    Promise.allSettled([
      fetchLeaderboard(),
      sid ? fetchTeamResult(sid) : Promise.reject(new Error("No session")),
    ]).then(([lbRes, teamRes]) => {
      if (lbRes.status === "fulfilled") {
        setLeaderboard(lbRes.value);
      } else {
        setError("Could not load public tournament leaderboard.");
      }

      if (teamRes.status === "fulfilled") {
        setPersonalResult(teamRes.value);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
          Official Tournament Standings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-wide">
          NodeHunt 2026 Results
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Final Rankings, Traversal Paths, and Point Distribution
        </p>
      </div>

      {/* Personal Scorecard (if team finished or has session) */}
      {personalResult && (
        <div className="mb-10 bg-[#08122a]/90 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/10 pb-4 mb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Your Team</span>
              <h2 className="text-2xl font-bold text-white">{personalResult.team_name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400">Total Score</span>
                <div className="text-2xl font-black font-mono text-cyan-300">
                  {personalResult.total_score} PTS
                </div>
              </div>
              {personalResult.rank && (
                <div className="px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-center">
                  <span className="text-[10px] uppercase block text-amber-500">Rank</span>
                  <span className="text-xl font-bold">#{personalResult.rank}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-2">
              Full Traversed Path
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {personalResult.path?.map((nodeId, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-lg font-mono text-xs text-cyan-300 font-bold">
                    {nodeId}
                  </span>
                  {idx < personalResult.path.length - 1 && (
                    <span className="text-slate-600 font-mono">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-[#060b18]/90 border border-cyan-500/20 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-cyan-500/10 flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Completed Teams ({leaderboard.length})
          </h3>
          <Link
            href="/join"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Join / Home
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            Loading live tournament standings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs">
            No teams have completed the tournament graph yet. Standings will appear in real time!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#040816] text-slate-400 uppercase tracking-wider text-[11px] border-b border-cyan-500/10">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Nodes Solved</th>
                  <th className="py-3.5 px-4 text-center">Path Steps</th>
                  <th className="py-3.5 px-4 text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 text-slate-300">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-cyan-950/20 transition-colors ${
                      entry.rank === 1
                        ? "bg-amber-500/5 text-amber-200"
                        : entry.rank === 2
                        ? "bg-slate-300/5"
                        : entry.rank === 3
                        ? "bg-amber-700/5"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold">
                      {entry.rank === 1 ? "🥇 #1" : entry.rank === 2 ? "🥈 #2" : entry.rank === 3 ? "🥉 #3" : `#${entry.rank}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-sans">{entry.team_name}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-cyan-300">{entry.total_score} PTS</td>
                    <td className="py-3.5 px-4 text-center text-emerald-400">{entry.nodes_solved}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{entry.path_length}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {entry.completed_at ? new Date(entry.completed_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default ResultsClient;
