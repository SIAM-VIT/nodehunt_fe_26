"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { DIFFICULTY_LABELS, NODE_TYPE_LABELS } from "@/data/graph";
import { RefreshCw } from "lucide-react";

export function GameClient() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [nodeData, setNodeData] = useState<NodeQuestion | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "strike" | "info" } | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>(["N01"]);
  const isPollingRef = useRef(false);

  const loadNodeData = useCallback(async (sid: string, nodeId: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
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
        router.push("/winner");
        return;
      }
    } catch (err: any) {
      if (err.status === 423) {
        router.push("/locked");
        return;
      }
      if (err.message?.includes("completed")) {
        router.push("/winner");
        return;
      }
      if (!silent) {
        const rawMsg = err.message || "Failed to load node challenge";
        setError(typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg));
      }
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
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
          router.push("/winner");
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

  // Fast background polling: Checks every 3s if another device (invigilator) approved the node
  useEffect(() => {
    if (!sessionId || !nodeData || nodeData.movement_unlocked || nodeData.completed) return;

    const interval = setInterval(() => {
      if (!isPollingRef.current) {
        isPollingRef.current = true;
        loadNodeData(sessionId, nodeData.node_id, true).finally(() => {
          isPollingRef.current = false;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, nodeData, loadNodeData]);

  const handleManualRefresh = () => {
    if (sessionId && nodeData && !loading && !isRefreshing) {
      loadNodeData(sessionId, nodeData.node_id, true);
    }
  };

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
        setTimeout(() => router.push("/winner"), 1200);
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
        <div className="w-12 h-12 rounded-full border-3 border-[#3e3e42] border-t-[#007acc] animate-spin" />
        <p className="mt-5 font-mono text-sm uppercase tracking-widest text-[#9cdcfe]">
          Synchronizing Node State...
        </p>
      </div>
    );
  }

  if (!nodeData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#252526] border border-[#3e3e42] rounded-2xl text-center">
        <h3 className="text-xl font-bold text-[#ffffff] mb-2 font-mono">Connection Lost</h3>
        <p className="text-sm text-[#858585] mb-6 font-mono">{error || "Could not retrieve node challenge"}</p>
        <button
          onClick={() => sessionId && loadNodeData(sessionId, localStorage.getItem(STORAGE_CURRENT_NODE) || "N01")}
          className="px-6 py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold shadow-md shadow-[#007acc]/30"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const displayName = teamName || nodeData.team_name || "Team";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl bg-[#252526] border border-[#3e3e42] mb-8 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        {/* Team Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center text-[#4fc1ff] font-mono font-extrabold text-2xl shadow-inner">
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-[#9cdcfe] font-semibold">Participating Team</div>
            <div className="text-2xl font-black text-[#ffffff] tracking-tight font-sans">{displayName}</div>
          </div>
        </div>

        {/* Score & Node Badge */}
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="text-right sm:text-center">
            <div className="text-xs font-mono uppercase tracking-widest text-[#9cdcfe] font-semibold">Total Score</div>
            <div className="text-3xl font-black font-mono text-[#4ec9b0]">
              {nodeData.team_score} <span className="text-sm font-normal text-[#858585]">PTS</span>
            </div>
          </div>

          <div className="text-right border-l border-[#3e3e42] pl-6 sm:pl-10">
            <div className="text-xs font-mono uppercase tracking-widest text-[#9cdcfe] font-semibold">Active Node</div>
            <div className="text-2xl font-bold font-mono text-[#ffffff] flex items-center justify-end gap-2">
              <span className="text-[#4fc1ff]">{nodeData.node_id}</span>
              {nodeData.is_terminal && (
                <span className="text-xs font-mono bg-[#1e3a5f] border border-[#4fc1ff]/60 text-[#4fc1ff] px-2 py-0.5 rounded font-bold">
                  FINALE
                </span>
              )}
            </div>
            <div className="text-xs text-[#cccccc] font-mono mt-0.5">
              {NODE_TYPE_LABELS[nodeData.node_type]} • {DIFFICULTY_LABELS[nodeData.difficulty]}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Expanded Challenge Screen */}
      <div className="space-y-6">
        {/* Expanded Problem Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#3e3e42] text-sm font-mono">
            <span className="font-bold text-[#4fc1ff] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ec9b0]" />
              Challenge Statement
            </span>
            <span className="text-[#858585] font-semibold">
              Node {nodeData.node_id} • {NODE_TYPE_LABELS[nodeData.node_type]}
            </span>
          </div>

          <div className="text-lg sm:text-xl text-[#ffffff] leading-relaxed font-sans whitespace-pre-wrap font-medium">
            {nodeData.question_text}
          </div>
        </div>

        {/* Action Area: Either Path Choice OR Invigilator Passcode */}
        {nodeData.movement_unlocked ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#252526] border border-[#4ec9b0]/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#4ec9b0]/60 flex items-center justify-center text-[#4ec9b0] text-xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#ffffff] font-mono uppercase tracking-wide">
                  {nodeData.is_terminal ? "Tournament Finale Reached" : "Branch Traversal Unlocked"}
                </h3>
                <p className="text-sm text-[#cccccc] mt-1">
                  {nodeData.is_terminal
                    ? "Congratulations! You have successfully completed the final tournament challenge."
                    : "Select your team's next route from the paths below:"}
                </p>
              </div>
            </div>

            {nodeData.is_terminal ? (
              <button
                onClick={() => router.push("/winner")}
                className="w-full py-4 rounded-xl bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#007acc]/30 cursor-pointer"
              >
                View Final Achievement & Scorecard →
              </button>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {nodeData.available_routes?.map((route) => (
                  <button
                    key={route.direction}
                    onClick={() => handleMove(route.direction)}
                    disabled={moving}
                    className="p-6 rounded-xl bg-[#1e1e1e] hover:bg-[#2d2d2d] border border-[#3e3e42] hover:border-[#007acc] text-left transition-all flex flex-col justify-between cursor-pointer disabled:opacity-50 group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-mono uppercase font-bold tracking-widest text-[#4fc1ff]">
                        {route.direction === "continue" ? "FORWARD" : `${route.direction.toUpperCase()} PATH`}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#252526] text-[#dcdcaa] border border-[#3e3e42]">
                        {DIFFICULTY_LABELS[route.difficulty]}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white group-hover:text-[#4fc1ff] transition-colors">
                      {NODE_TYPE_LABELS[route.type]} Challenge
                    </div>
                    <div className="mt-4 text-xs text-[#858585] flex items-center justify-between font-mono">
                      <span>{route.terminal ? "Final Destination Node" : "Next Node"}</span>
                      <span className="text-[#4fc1ff] text-base group-hover:translate-x-1.5 transition-transform">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Invigilator Verification Portal */
          <div className="p-8 sm:p-10 rounded-2xl bg-[#252526] border border-[#3e3e42] shadow-2xl">
            {/* Header + Fast Refresh Status Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-[#3e3e42] gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono uppercase tracking-wider text-[#4fc1ff] font-bold">
                  Invigilator Approval
                </span>
                {/* Fast Refresh Bar Button */}
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={loading || isRefreshing}
                  title="Check if invigilator verified your solution from another device"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e1e1e] hover:bg-[#2d2d2d] border border-[#3e3e42] hover:border-[#007acc] text-[11px] font-mono text-[#9cdcfe] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#4fc1ff]" : ""}`} />
                  <span>{isRefreshing ? "Checking..." : "Check Status"}</span>
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm font-mono">
                <span className="text-[#858585]">
                  Attempts Left: <strong className="text-white text-base ml-1">{nodeData.attempts_left} / 3</strong>
                </span>
                <span className="text-[#858585]">
                  Points: <strong className="text-[#4ec9b0] text-base ml-1">+{nodeData.score_available} PTS</strong>
                </span>
              </div>
            </div>

            {/* In-room instruction */}
            <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#3e3e42] mb-6 text-sm text-[#cccccc] flex items-start gap-3">
              <span className="text-lg text-[#4fc1ff] font-bold">ℹ</span>
              <div>
                Demonstrate your solution to the room invigilator. They can approve directly from their invigilator device (this screen updates automatically), or enter the verification passcode below.
              </div>
            </div>

            {/* Feedback messages */}
            {feedback && (
              <div
                className={`p-4 rounded-xl font-mono text-sm mb-6 border ${
                  feedback.type === "success"
                    ? "bg-[#1e3a2b] border-[#4ec9b0]/50 text-[#4ec9b0]"
                    : feedback.type === "strike"
                    ? "bg-[#3a2e1e] border-[#dcdcaa]/50 text-[#dcdcaa]"
                    : "bg-[#1e2e3e] border-[#007acc]/50 text-[#4fc1ff]"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-[#3c1e1e] border border-[#f48771]/50 text-[#f48771] font-mono text-sm mb-6">
                {error}
              </div>
            )}

            {/* Passcode Form */}
            <form onSubmit={handlePasscodeSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9cdcfe] mb-2 font-semibold">
                  Invigilator Passcode
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter volunteer passcode..."
                  disabled={submitting || nodeData.attempts_left === 0}
                  className="w-full px-5 py-3.5 bg-[#1e1e1e] border border-[#3e3e42] focus:border-[#007acc] rounded-xl text-white font-mono text-base tracking-wider focus:outline-none disabled:opacity-40 transition-colors"
                />
                <p className="text-xs text-[#858585] mt-2 font-mono">
                  Invigilator enters approval code (advances team) or strike code (records retry).
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !passcode.trim() || nodeData.attempts_left === 0}
                className="w-full py-4 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-sm font-bold tracking-wider uppercase rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-[#007acc]/25"
              >
                {submitting ? "Verifying..." : "Submit Passcode for Verification"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameClient;
