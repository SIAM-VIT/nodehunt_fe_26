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
        setError("Could not load tournament leaderboard.");
      }

      if (teamRes.status === "fulfilled") {
        setPersonalResult(teamRes.value);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full">
          Official Tournament Standings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
          NodeHunt 2026 Results
        </h1>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Live Standings, Point Totals, and Path Audits
        </p>
      </div>

      {/* Personal Scorecard */}
      {personalResult && (
        <div className="mb-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your Team</span>
              <h2 className="text-xl font-bold text-white">{personalResult.team_name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400">Total Score</span>
                <div className="text-2xl font-black font-mono text-indigo-400">
                  {personalResult.total_score} <span className="text-xs font-normal text-slate-400">PTS</span>
                </div>
              </div>
              {personalResult.rank && (
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-mono text-center">
                  <span className="text-[10px] uppercase block text-slate-400">Rank</span>
                  <span className="text-lg font-bold">#{personalResult.rank}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Traversed Path
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {personalResult.path?.map((nodeId, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-700/60 rounded-lg font-mono text-xs text-slate-200 font-semibold">
                    {nodeId}
                  </span>
                  {idx < personalResult.path.length - 1 && (
                    <span className="text-slate-600 font-mono text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-white">
            Completed Teams ({leaderboard.length})
          </h3>
          <Link
            href="/join"
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to Join / Home
          </Link>
        </div>

        {loading ? (
          <div className="py-14 text-center text-slate-400 font-mono text-xs">
            Loading standings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-14 text-center text-slate-500 font-mono text-xs">
            No teams have completed the tournament graph yet. Standings will appear in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-center">Steps</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      {entry.rank === 1 ? "🥇 #1" : entry.rank === 2 ? "🥈 #2" : entry.rank === 3 ? "🥉 #3" : `#${entry.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-sans">{entry.team_name}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-300">{entry.total_score} PTS</td>
                    <td className="py-3 px-4 text-center text-emerald-400">{entry.nodes_solved}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{entry.path_length}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
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
