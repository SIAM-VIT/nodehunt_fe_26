import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NodeGraph } from "@/components/NodeGraph";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 overflow-hidden border-b border-slate-800/60">
          <div className="shell relative z-10 text-center max-w-4xl mx-auto">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-mono text-xs mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              SIAM-VIT NodeHunt 2026 • Live Tournament
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Master the graph through <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                algorithmic challenge
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              A collaborative technical hunt. Solve coding, debugging, quizzes, and riddles. 
              Call room invigilators to verify your solutions, unlock branching paths, and navigate the graph to the finale.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/join"
                className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-sm font-semibold tracking-wide transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40"
              >
                Enter Arena →
              </Link>
              <Link
                href="/results"
                className="px-7 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-mono text-sm transition-all"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Specs Grid */}
        <section className="py-14 border-b border-slate-800/60 bg-slate-950/40">
          <div className="shell">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Graph Structure", val: "10 Nodes", desc: "Start at N01, converge at N08" },
                { label: "Scoring Model", val: "30 / 20 / 10", desc: "Decrements on retry strikes" },
                { label: "Verification", val: "Invigilator Passcode", desc: "In-person solution approval" },
                { label: "Advancement", val: "Zero-Elimination", desc: "3 strikes unlock forward route" },
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 text-left">
                  <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold mb-1">
                    {item.label}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1 font-mono">
                    {item.val}
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gameplay Workflow */}
        <section className="py-16 border-b border-slate-800/60">
          <div className="shell">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold block mb-2">
                Event Mechanics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">How the tournament runs</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: "01",
                  title: "Inspect Node",
                  desc: "Team lands on a node and receives the challenge (Coding, Debugging, Quiz, or Riddle).",
                },
                {
                  step: "02",
                  title: "Solve Locally",
                  desc: "Write and test your solution in your local IDE or whiteboard with your teammates.",
                },
                {
                  step: "03",
                  title: "Verify with Volunteer",
                  desc: "Call the invigilator. They enter an approval code (+30/20/10) or strike code.",
                },
                {
                  step: "04",
                  title: "Choose Next Route",
                  desc: "Once verified or exhausted, select Left or Right to traverse deeper into the graph.",
                },
              ].map((step, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 relative group hover:border-indigo-500/30 transition-all">
                  <div className="text-xs font-mono text-indigo-400/80 font-bold mb-3">
                    STEP {step.step}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Challenge Categories */}
        <section className="py-16 border-b border-slate-800/60 bg-slate-950/30">
          <div className="shell">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold block mb-2">
                Discipline Tracks
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Challenge Classifications</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { code: "D", name: "Debugging", badge: "Logic & Execution", desc: "Analyze broken code, trace edge cases, and locate base-case flaws." },
                { code: "C", name: "Coding", badge: "Algorithms", desc: "Implement algorithmic tasks with efficient time and space complexity." },
                { code: "Q", name: "Quiz", badge: "CS Fundamentals", desc: "Networking, systems internals, data structures, and theory questions." },
                { code: "R", name: "Riddle", badge: "Lateral Thinking", desc: "Logic enigmas, cipher puzzles, and lateral deduction challenges." },
              ].map((cat, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-indigo-300 text-sm mb-3">
                    {cat.code}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{cat.name}</h3>
                  <div className="text-[11px] font-mono text-indigo-400 mb-2">{cat.badge}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Graph Radar Preview */}
        <section className="py-16">
          <div className="shell max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold block mb-2">
                Tournament Map
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">The Confirmed 10-Node Graph</h2>
              <p className="text-xs text-slate-400 font-mono">
                Starts at N01. Branch choices navigate teams towards the grand terminal finale at N08.
              </p>
            </div>

            <div className="p-2 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <NodeGraph adminMode={true} compact={false} />
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs font-mono text-slate-500 bg-slate-950/80">
        <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>NODEHUNT 2026 • SIAM-VIT Chapter</div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/join" className="hover:text-white transition-colors">Start Hunt</Link>
            <Link href="/results" className="hover:text-white transition-colors">Standings</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Organizer Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
