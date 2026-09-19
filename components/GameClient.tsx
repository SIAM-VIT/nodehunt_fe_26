"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchNode,
  validatePasscode,
  moveTeam,
  fetchTeamResult,
  type NodeQuestion,
  type Direction,
} from "@/lib/api";
import {
  STORAGE_SESSION_ID,
  STORAGE_CURRENT_NODE,
  STORAGE_TEAM_NAME,
} from "@/lib/constants";
import { NodeGraph } from "./NodeGraph";
import { DIFFICULTY_LABELS, NODE_TYPE_LABELS } from "@/data/graph";

export function GameClient() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nodeData, setNodeData] = useState<NodeQuestion | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "strike" | "info" } | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>(["N01"]);

  const loadNodeData = useCallback(async (sid: string, nodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNode(nodeId, sid);
      setNodeData(data);
      localStorage.setItem(STORAGE_CURRENT_NODE, data.node_id);
      localStorage.setItem(STORAGE_TEAM_NAME, data.team_name);

      if (data.is_locked) {
        router.push("/locked");
        return;
      }

      if (data.completed) {
        router.push("/results");
        return;
      }
    } catch (err: any) {
      if (err.status === 423) {
        router.push("/locked");
        return;
      }
      if (err.message?.includes("completed")) {
        router.push("/results");
        return;
      }
      setError(err.message || "Failed to load node challenge");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const sid = localStorage.getItem(STORAGE_SESSION_ID);
    if (!sid) {
      router.push("/join");
      return;
    }
    setSessionId(sid);

    fetchTeamResult(sid)
      .then((teamRes) => {
        if (teamRes.completed) {
          router.push("/results");
          return;
        }
        const path = teamRes.path && teamRes.path.length > 0 ? teamRes.path : ["N01"];
        setVisitedNodes(path);
        const current = path[path.length - 1];
        loadNodeData(sid, current);
      })
      .catch((err) => {
        console.warn("Falling back to local node:", err);
        const storedNode = localStorage.getItem(STORAGE_CURRENT_NODE) || "N01";
        loadNodeData(sid, storedNode);
      });
  }, [router, loadNodeData]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !nodeData || !passcode.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await validatePasscode(sessionId, nodeData.node_id, passcode.trim());
      setPasscode("");

      if (res.correct) {
        setFeedback({
          message: res.message || `Solution verified! +${res.points_awarded} PTS earned.`,
          type: "success",
        });
      } else if (res.movement_unlocked) {
        setFeedback({
          message: res.message || "All attempts used. 0 PTS awarded — forward path is unlocked.",
          type: "info",
        });
      } else {
        setFeedback({
          message: res.message || `Strike recorded. ${res.attempts_left} attempt(s) remaining.`,
          type: "strike",
        });
      }

      if (res.completed) {
        setTimeout(() => router.push("/results"), 1200);
      } else {
        await loadNodeData(sessionId, nodeData.node_id);
      }
    } catch (err: any) {
      setError(err.message || "Passcode verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMove = async (direction: string) => {
    if (!sessionId || !nodeData || moving) return;
    setMoving(true);
    setError(null);
    try {
      const res = await moveTeam(sessionId, nodeData.node_id, direction as Direction);
      setVisitedNodes((prev) => (prev.includes(res.moved_to) ? prev : [...prev, res.moved_to]));
      setFeedback(null);
      await loadNodeData(sessionId, res.moved_to);
    } catch (err: any) {
      setError(err.message || "Failed to traverse to next node");
    } finally {
      setMoving(false);
    }
  };

  if (loading && !nodeData) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-slate-400">
          Synchronizing Node State...
        </p>
      </div>
    );
  }

  if (!nodeData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-white mb-2">Connection Lost</h3>
        <p className="text-xs text-slate-400 mb-6 font-mono">{error || "Could not retrieve node challenge"}</p>
        <button
          onClick={() => sessionId && loadNodeData(sessionId, localStorage.getItem(STORAGE_CURRENT_NODE) || "N01")}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Team Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-mono font-bold text-sm">
            {nodeData.team_name ? nodeData.team_name[0].toUpperCase() : "T"}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Team</div>
            <div className="text-base font-bold text-white tracking-tight">{nodeData.team_name}</div>
          </div>
        </div>

        {/* Score & Node Badge */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="text-right sm:text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Score</div>
            <div className="text-2xl font-black font-mono text-indigo-400">
              {nodeData.team_score} <span className="text-xs font-normal text-slate-400">PTS</span>
            </div>
          </div>

          <div className="text-right border-l border-slate-800 pl-4 sm:pl-8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Node</div>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-end gap-1.5">
              <span>{nodeData.node_id}</span>
              {nodeData.is_terminal && (
                <span className="text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-300 px-1.5 py-0.5 rounded">
                  FINALE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {NODE_TYPE_LABELS[nodeData.node_type]} • {DIFFICULTY_LABELS[nodeData.difficulty]}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Challenge & Action (Left) | Radar Map (Right) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Statement & Verification */}
        <div className="lg:col-span-7 space-y-5">
          {/* Problem Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                Challenge Details
              </span>
              <span>Level {nodeData.node_id}</span>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap font-medium">
              {nodeData.question_text}
            </div>
          </div>

          {/* Action Area: Either Path Choice OR Invigilator Passcode */}
          {nodeData.movement_unlocked ? (
            <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-500/30 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-900/60 border border-teal-500/40 flex items-center justify-center text-teal-300 text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal-200 font-mono uppercase tracking-wide">
                    {nodeData.is_terminal ? "Tournament Finale Reached" : "Branch Traversal Unlocked"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {nodeData.is_terminal
                      ? "You have completed the tournament graph. Proceed to the leaderboard."
                      : "Select your team's next route from the paths below:"}
                  </p>
                </div>
              </div>

              {nodeData.is_terminal ? (
                <button
                  onClick={() => router.push("/results")}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  View Final Standings & Scorecard →
                </button>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {nodeData.available_routes?.map((route) => (
                    <button
                      key={route.direction}
                      onClick={() => handleMove(route.direction)}
                      disabled={moving}
                      className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-teal-500/30 hover:border-teal-400 text-left transition-all flex flex-col justify-between cursor-pointer disabled:opacity-50 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-teal-300">
                          {route.direction === "continue" ? "FORWARD" : `${route.direction.toUpperCase()} PATH`}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {DIFFICULTY_LABELS[route.difficulty]}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-teal-200">
                        {NODE_TYPE_LABELS[route.type]} Challenge
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>{route.terminal ? "Final Destination" : "Next Node"}</span>
                        <span className="text-teal-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Invigilator Verification Portal */
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Invigilator Approval
                </span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">
                    Attempts Left: <strong className="text-white">{nodeData.attempts_left} / 3</strong>
                  </span>
                  <span className="text-slate-400">
                    Points: <strong className="text-emerald-400">+{nodeData.score_available} PTS</strong>
                  </span>
                </div>
              </div>

              {/* In-room instruction */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 mb-4 text-xs text-slate-300 flex items-start gap-2.5">
                <span className="text-base text-indigo-400">ℹ</span>
                <div>
                  Demonstrate your solution to the room invigilator. They will enter their verification passcode below to approve your solution or record a strike.
                </div>
              </div>

              {/* Feedback messages */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl font-mono text-xs mb-4 border ${
                    feedback.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : feedback.type === "strike"
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                      : "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs mb-4">
                  {error}
                </div>
              )}

              {/* Passcode Form */}
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Invigilator Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter volunteer passcode..."
                    disabled={submitting || nodeData.attempts_left === 0}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl text-white font-mono text-sm tracking-wider focus:outline-none disabled:opacity-40"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Invigilator enters approval code (advances team) or strike code (records retry).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passcode.trim() || nodeData.attempts_left === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? "Verifying..." : "Submit Passcode for Verification"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Node Map Radar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider">Tournament Radar</span>
            <span>Path Length: {visitedNodes.length}</span>
          </div>

          <NodeGraph
            currentNodeId={nodeData.node_id}
            visitedNodes={visitedNodes}
            availableRoutes={nodeData.available_routes}
            onSelectRoute={handleMove}
            compact={false}
          />

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="truncate mr-2">Visited: {visitedNodes.join(" → ")}</span>
            <span className="text-indigo-400 font-bold shrink-0">Target: N08</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameClient;
