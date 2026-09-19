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
        <span className="text-xs font-mono uppercase tracking-widest text-[#ea5832] font-semibold bg-[#26130e] border border-[#d94f2b]/30 px-3.5 py-1 rounded-full">
          Official Tournament Standings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f8f4f0] mt-3 tracking-tight">
          NodeHunt 2026 Results
        </h1>
        <p className="text-xs text-[#9e9087] mt-2 font-mono">
          Live Standings, Point Totals, and Path Audits
        </p>
      </div>

      {/* Personal Scorecard */}
      {personalResult && (
        <div className="mb-8 p-6 rounded-2xl bg-[#120b0a]/90 border border-[#271c19] backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#241a17] pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9e9087]">Your Team</span>
              <h2 className="text-xl font-bold text-[#f8f4f0]">{personalResult.team_name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#9e9087]">Total Score</span>
                <div className="text-2xl font-black font-mono text-[#ea5832]">
                  {personalResult.total_score} <span className="text-xs font-normal text-[#9e9087]">PTS</span>
                </div>
              </div>
              {personalResult.rank && (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#24130f] border border-[#d94f2b]/40 text-[#f6b49e] font-mono text-center">
                  <span className="text-[10px] uppercase block text-[#9e9087]">Rank</span>
                  <span className="text-lg font-bold">#{personalResult.rank}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#9e9087] block mb-2">
              Traversed Path
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {personalResult.path?.map((nodeId, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#1a110e] border border-[#3b2a26] rounded-lg font-mono text-xs text-[#f8f4f0] font-semibold">
                    {nodeId}
                  </span>
                  {idx < personalResult.path.length - 1 && (
                    <span className="text-[#6e625a] font-mono text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-[#120b0a]/90 border border-[#271c19] backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#241a17] flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-white">
            Completed Teams ({leaderboard.length})
          </h3>
          <Link
            href="/join"
            className="text-xs font-mono text-[#ea5832] hover:text-[#f6b49e] transition-colors"
          >
            ← Back to Join / Home
          </Link>
        </div>

        {loading ? (
          <div className="py-14 text-center text-[#9e9087] font-mono text-xs">
            Loading standings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-14 text-center text-[#6e625a] font-mono text-xs">
            No teams have completed the tournament graph yet. Standings will appear in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#090504] text-[#9e9087] uppercase tracking-wider text-[11px] border-b border-[#241a17]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-center">Steps</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241a17] text-[#d6ccc4]">
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className="hover:bg-[#1a110e]/60 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      {entry.rank === 1 ? "🥇 #1" : entry.rank === 2 ? "🥈 #2" : entry.rank === 3 ? "🥉 #3" : `#${entry.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-sans">{entry.team_name}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#ea5832]">{entry.total_score} PTS</td>
                    <td className="py-3 px-4 text-center text-emerald-400">{entry.nodes_solved}</td>
                    <td className="py-3 px-4 text-center text-[#9e9087]">{entry.path_length}</td>
                    <td className="py-3 px-4 text-right text-[#9e9087]">
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
