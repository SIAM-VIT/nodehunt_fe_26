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
  const [teamName, setTeamName] = useState<string>("");
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

      const resolvedName = data.team_name || localStorage.getItem(STORAGE_TEAM_NAME) || "Team";
      setTeamName(resolvedName);
      localStorage.setItem(STORAGE_TEAM_NAME, resolvedName);

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
      const rawMsg = err.message || "Failed to load node challenge";
      setError(typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const sid = localStorage.getItem(STORAGE_SESSION_ID);
    const storedTeamName = localStorage.getItem(STORAGE_TEAM_NAME);
    if (storedTeamName) {
      setTeamName(storedTeamName);
    }

    if (!sid) {
      router.push("/join");
      return;
    }
    setSessionId(sid);

    fetchTeamResult(sid)
      .then((teamRes) => {
        if (teamRes.team_name) {
          setTeamName(teamRes.team_name);
          localStorage.setItem(STORAGE_TEAM_NAME, teamRes.team_name);
        }
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
      const rawMsg = err.message || "Passcode verification failed";
      setError(typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg));
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
      const rawMsg = err.message || "Failed to traverse to next node";
      setError(typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg));
    } finally {
      setMoving(false);
    }
  };

  if (loading && !nodeData) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#b43426]/30 border-t-[#c84332] animate-spin" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#8c8079]">
          Synchronizing Node State...
        </p>
      </div>
    );
  }

  if (!nodeData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0e0a09]/90 border border-white/[0.08] rounded-2xl text-center">
        <h3 className="text-lg font-bold text-[#f8f6f5] mb-2">Connection Lost</h3>
        <p className="text-xs text-[#8c8079] mb-6 font-mono">{error || "Could not retrieve node challenge"}</p>
        <button
          onClick={() => sessionId && loadNodeData(sessionId, localStorage.getItem(STORAGE_CURRENT_NODE) || "N01")}
          className="px-5 py-2.5 bg-[#b43426] hover:bg-[#c84332] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const displayName = teamName || nodeData.team_name || "Team";

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0a09]/80 border border-white/[0.08] backdrop-blur-xl mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Team Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d0f0c] border border-[#b43426]/40 flex items-center justify-center text-[#e8b5af] font-mono font-bold text-sm shadow-inner">
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#8c8079]">Team</div>
            <div className="text-base font-bold text-[#f8f6f5] tracking-tight">{displayName}</div>
          </div>
        </div>

        {/* Score & Node Badge */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="text-right sm:text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8079]">Total Score</div>
            <div className="text-2xl font-black font-mono text-[#e06655]">
              {nodeData.team_score} <span className="text-xs font-normal text-[#8c8079]">PTS</span>
            </div>
          </div>

          <div className="text-right border-l border-white/[0.08] pl-4 sm:pl-8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8079]">Active Node</div>
            <div className="text-xl font-bold font-mono text-[#f8f6f5] flex items-center justify-end gap-1.5">
              <span>{nodeData.node_id}</span>
              {nodeData.is_terminal && (
                <span className="text-[10px] font-mono bg-[#35100c] border border-[#b43426]/50 text-[#fca58f] px-1.5 py-0.5 rounded">
                  FINALE
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#8c8079] font-mono">
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
          <div className="p-6 rounded-2xl bg-[#0e0a09]/75 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] text-xs font-mono text-[#8c8079]">
              <span className="font-semibold text-[#e06655] uppercase tracking-wider">
                Challenge Details
              </span>
              <span>Level {nodeData.node_id}</span>
            </div>

            <div className="text-sm text-[#ece4dc] leading-relaxed font-sans whitespace-pre-wrap font-medium">
              {nodeData.question_text}
            </div>
          </div>

          {/* Action Area: Either Path Choice OR Invigilator Passcode */}
          {nodeData.movement_unlocked ? (
            <div className="p-6 rounded-2xl bg-[#140e09]/80 border border-[#d9822b]/35 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2b1708] border border-[#d9822b]/50 flex items-center justify-center text-[#fcd34d] text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#fed7aa] font-mono uppercase tracking-wide">
                    {nodeData.is_terminal ? "Tournament Finale Reached" : "Branch Traversal Unlocked"}
                  </h3>
                  <p className="text-xs text-[#b8aaa0]">
                    {nodeData.is_terminal
                      ? "You have completed the tournament graph. Proceed to the leaderboard."
                      : "Select your team's next route from the paths below:"}
                  </p>
                </div>
              </div>

              {nodeData.is_terminal ? (
                <button
                  onClick={() => router.push("/results")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b43426] to-[#c84332] hover:from-[#c84332] hover:to-[#b43426] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#b43426]/20 cursor-pointer"
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
                      className="p-4 rounded-xl bg-[#0c0807] hover:bg-[#160f0d] border border-[#d9822b]/30 hover:border-[#d9822b] text-left transition-all flex flex-col justify-between cursor-pointer disabled:opacity-50 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#d9822b]">
                          {route.direction === "continue" ? "FORWARD" : `${route.direction.toUpperCase()} PATH`}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18100e] text-[#d1c7c2]">
                          {DIFFICULTY_LABELS[route.difficulty]}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#fed7aa]">
                        {NODE_TYPE_LABELS[route.type]} Challenge
                      </div>
                      <div className="mt-2 text-[11px] text-[#8c8079] flex items-center justify-between font-mono">
                        <span>{route.terminal ? "Final Destination" : "Next Node"}</span>
                        <span className="text-[#d9822b] group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Invigilator Verification Portal */
            <div className="p-6 rounded-2xl bg-[#0e0a09]/75 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#e06655] font-semibold">
                  Invigilator Approval
                </span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#8c8079]">
                    Attempts Left: <strong className="text-white">{nodeData.attempts_left} / 3</strong>
                  </span>
                  <span className="text-[#8c8079]">
                    Points: <strong className="text-[#e06655]">+{nodeData.score_available} PTS</strong>
                  </span>
                </div>
              </div>

              {/* In-room instruction */}
              <div className="p-3.5 rounded-xl bg-[#120b0a] border border-white/[0.06] mb-4 text-xs text-[#d1c7c2] flex items-start gap-2.5">
                <span className="text-base text-[#e06655]">ℹ</span>
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
                      : "bg-[#21110e] border-[#b43426]/40 text-[#e8b5af]"
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
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#8c8079] mb-1.5">
                    Invigilator Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter volunteer passcode..."
                    disabled={submitting || nodeData.attempts_left === 0}
                    className="w-full px-4 py-2.5 bg-[#070505] border border-white/[0.1] focus:border-[#b43426] rounded-xl text-white font-mono text-sm tracking-wider focus:outline-none disabled:opacity-40"
                  />
                  <p className="text-[11px] text-[#594f49] mt-1 font-mono">
                    Invigilator enters approval code (advances team) or strike code (records retry).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passcode.trim() || nodeData.attempts_left === 0}
                  className="w-full py-3 bg-[#b43426] hover:bg-[#c84332] text-white font-mono text-xs font-bold tracking-wider uppercase rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#b43426]/20"
                >
                  {submitting ? "Verifying..." : "Submit Passcode for Verification"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Node Map Radar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#8c8079] px-1">
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

          <div className="p-3 rounded-xl bg-[#0e0a09]/75 border border-white/[0.08] text-[11px] font-mono text-[#8c8079] flex items-center justify-between">
            <span className="truncate mr-2">Visited: {visitedNodes.join(" → ")}</span>
            <span className="text-[#e06655] font-bold shrink-0">Target: N08</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameClient;
