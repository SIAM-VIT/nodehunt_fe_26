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

  // Initial session hydration
  useEffect(() => {
    const sid = localStorage.getItem(STORAGE_SESSION_ID);
    if (!sid) {
      router.push("/join");
      return;
    }
    setSessionId(sid);

    // Hydrate path and current location
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
        console.warn("Could not load team result, falling back to local/default node:", err);
        const storedNode = localStorage.getItem(STORAGE_CURRENT_NODE) || "N01";
        loadNodeData(sid, storedNode);
      });
  }, [router, loadNodeData]);

  // Invigilator Passcode Submission
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
          message: res.message || "All attempts used. 0 PTS awarded — your path is unlocked.",
          type: "info",
        });
      } else {
        setFeedback({
          message: res.message || `Strike recorded by invigilator. ${res.attempts_left} attempt(s) remaining.`,
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-cyan-400">
            NH
          </div>
        </div>
        <p className="mt-4 font-mono text-sm tracking-widest text-cyan-300 animate-pulse">
          SYNCHRONIZING SECURE NODE TELEMETRY...
        </p>
      </div>
    );
  }

  if (!nodeData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0a1128] border border-red-500/30 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">Node Synchronization Lost</h3>
        <p className="text-sm text-slate-400 mb-6 font-mono">{error || "Could not retrieve current node challenge"}</p>
        <button
          onClick={() => sessionId && loadNodeData(sessionId, localStorage.getItem(STORAGE_CURRENT_NODE) || "N01")}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Top HUD Bar */}
      <div className="relative bg-[#060b18]/90 border border-cyan-500/20 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Team identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-lg shadow-inner">
            {nodeData.team_name ? nodeData.team_name[0].toUpperCase() : "T"}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono text-cyan-400/80">Active Team</div>
            <h1 className="text-lg font-bold text-white tracking-wide">{nodeData.team_name}</h1>
          </div>
        </div>

        {/* Global Live Score */}
        <div className="flex items-center gap-6">
          <div className="text-center px-4 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Total Score</div>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {nodeData.team_score} <span className="text-xs font-normal text-cyan-500">PTS</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs uppercase tracking-widest font-mono text-amber-400">Current Node</div>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-end gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              {nodeData.node_id}
              {nodeData.is_terminal && (
                <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-mono">
                  FINAL
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {NODE_TYPE_LABELS[nodeData.node_type]} • {DIFFICULTY_LABELS[nodeData.difficulty]}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Challenge Interaction (Left) & Radar Map (Right) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Challenge & Invigilator Portal */}
        <div className="lg:col-span-7 space-y-6">
          {/* Challenge Description Card */}
          <div className="bg-[#080e22]/90 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/10 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
                Problem Statement
              </span>
              <span className="text-xs font-mono text-slate-400">
                Level {nodeData.node_id}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-sm font-sans leading-relaxed whitespace-pre-wrap font-medium">
              {nodeData.question_text}
            </div>
          </div>

          {/* Interactive Action Area: Either Path Selection (if unlocked) OR Invigilator Passcode Form */}
          {nodeData.movement_unlocked ? (
            <div className="bg-[#051a1a]/90 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-300 font-mono tracking-wide">
                    {nodeData.is_terminal ? "HUNT OBJECTIVE COMPLETED!" : "PATH TRAVERSAL UNLOCKED"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {nodeData.is_terminal
                      ? "You have completed the tournament graph. Proceed to the leaderboard."
                      : "Choose your next route from the options below:"}
                  </p>
                </div>
              </div>

              {nodeData.is_terminal ? (
                <button
                  onClick={() => router.push("/results")}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold tracking-widest uppercase rounded-xl shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
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
                      className="group relative p-4 rounded-xl bg-[#09152e] hover:bg-[#0c1e45] border border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-amber-400">
                          {route.direction === "continue" ? "FORWARD" : `${route.direction.toUpperCase()} PATH`}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                          {DIFFICULTY_LABELS[route.difficulty]}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                        {NODE_TYPE_LABELS[route.type]} Challenge
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>{route.terminal ? "Final Destination" : "Next Junction"}</span>
                        <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Invigilator Verification Portal */
            <div className="bg-[#080e22]/90 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-cyan-500/10 pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Invigilator Verification
                </span>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">
                    Attempts Left:{" "}
                    <strong className="text-cyan-300">{nodeData.attempts_left} / 3</strong>
                  </span>
                  <span className="text-slate-400">
                    Score at Stake:{" "}
                    <strong className="text-emerald-400">+{nodeData.score_available} PTS</strong>
                  </span>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="bg-[#041126] border border-cyan-500/10 rounded-xl p-3.5 mb-5 text-xs text-slate-300 font-sans flex items-start gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <strong className="text-cyan-300 block mb-0.5">Solve locally, then request verification</strong>
                  Work on this problem in your local environment. Once confident in your solution, call a room volunteer. The invigilator will enter their verification code to approve your solution or record a strike.
                </div>
              </div>

              {/* Feedback Toasts */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-xl font-mono text-xs mb-4 border flex items-center gap-2.5 ${
                    feedback.type === "success"
                      ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                      : feedback.type === "strike"
                      ? "bg-amber-950/70 border-amber-500/50 text-amber-300"
                      : "bg-blue-950/70 border-blue-500/50 text-blue-300"
                  }`}
                >
                  <span className="text-base font-bold">
                    {feedback.type === "success" ? "✓" : "⚠"}
                  </span>
                  <span>{feedback.message}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 font-mono text-xs mb-4 flex items-center gap-2">
                  <span className="text-base">✕</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Verification Passcode Form */}
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Invigilator Passcode
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter verification passcode..."
                      disabled={submitting || nodeData.attempts_left === 0}
                      className="w-full px-4 py-3 bg-[#030712] border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-white font-mono text-sm tracking-widest placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Volunteer enters SUCCESS code (approves node) or STRIKE code (records retry attempt).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passcode.trim() || nodeData.attempts_left === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#050814] font-mono font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-amber-950/50 disabled:opacity-40 cursor-pointer"
                >
                  {submitting ? "Verifying Passcode..." : "Submit Passcode for Verification"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Node Map Radar with Fog of War */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
              Tournament Path Topology
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
              Path Length: {visitedNodes.length}
            </span>
          </div>

          <NodeGraph
            currentNodeId={nodeData.node_id}
            visitedNodes={visitedNodes}
            availableRoutes={nodeData.available_routes}
            onSelectRoute={handleMove}
            compact={false}
          />

          <div className="bg-[#060b18]/70 border border-cyan-500/10 rounded-xl p-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Traversed: {visitedNodes.join(" → ")}</span>
            <span className="text-cyan-400 font-bold">Target: N08</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default GameClient;
