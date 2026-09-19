import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NodeGraph } from "@/components/NodeGraph";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function Home() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 border-b border-[#221815]/80">
            <div className="shell text-center max-w-4xl mx-auto">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24130f]/80 border border-[#d94f2b]/40 text-[#f6b49e] font-mono text-xs mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#ea5832] animate-pulse" />
                SIAM-VIT NodeHunt 2026 • Live Tournament
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f8f4f0] mb-6 leading-[1.15]">
                Master the graph through <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#ea5832] via-[#e5933a] to-[#f4b584] bg-clip-text text-transparent">
                  algorithmic challenge
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#b0a298] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
                A team-based graph traversal tournament. Tackle coding, debugging, quizzes, and riddles. 
                Demonstrate your solutions to room invigilators, unlock branching choices, and forge your path to the finale.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/join"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#d94f2b] to-[#c24122] hover:from-[#ea5832] hover:to-[#d94f2b] text-white font-mono text-sm font-semibold tracking-wide transition-all shadow-lg shadow-[#d94f2b]/25 cursor-pointer"
                >
                  Enter Arena →
                </Link>
                <Link
                  href="/results"
                  className="px-7 py-3 rounded-xl bg-[#140e0c]/90 hover:bg-[#1f1513] border border-[#3b2a26] text-[#d6ccc4] font-mono text-sm transition-all"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Specs Grid */}
          <section className="py-12 border-b border-[#221815]/80 bg-[#0c0807]/50">
            <div className="shell">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Graph Map", val: "10 Nodes", desc: "Start at N01, finale at N08" },
                  { label: "Scoring Model", val: "30 / 20 / 10", desc: "Decrements on retry strikes" },
                  { label: "Verification", val: "Invigilator Code", desc: "In-person solution approval" },
                  { label: "Advancement", val: "Zero-Elimination", desc: "3 strikes unlock forward path" },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#130d0b]/80 border border-[#2b1f1c] text-left">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#ea5832] font-semibold mb-1">
                      {item.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#f8f4f0] mb-1 font-mono">
                      {item.val}
                    </div>
                    <div className="text-xs text-[#9e9087] font-sans">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gameplay Workflow */}
          <section className="py-16 border-b border-[#221815]/80">
            <div className="shell">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#ea5832] font-semibold block mb-2">
                  Event Mechanics
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f4f0]">How the tournament runs</h2>
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
                    desc: "Call the room volunteer. They enter an approval code (+30/20/10) or strike code.",
                  },
                  {
                    step: "04",
                    title: "Choose Next Route",
                    desc: "Once verified or exhausted, select Left or Right to traverse deeper into the graph.",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#120c0a]/75 border border-[#271c19] relative hover:border-[#d94f2b]/40 transition-all">
                    <div className="text-xs font-mono text-[#ea5832] font-bold mb-3">
                      STEP {step.step}
                    </div>
                    <h3 className="text-base font-bold text-[#f8f4f0] mb-2">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-[#9e9087]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Challenge Categories */}
          <section className="py-16 border-b border-[#221815]/80 bg-[#0c0807]/50">
            <div className="shell">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#ea5832] font-semibold block mb-2">
                  Discipline Tracks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f4f0]">Challenge Classifications</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { code: "D", name: "Debugging", badge: "Logic & Execution", desc: "Analyze broken code, trace edge cases, and locate base-case flaws." },
                  { code: "C", name: "Coding", badge: "Algorithms", desc: "Implement algorithmic tasks with efficient time and space complexity." },
                  { code: "Q", name: "Quiz", badge: "CS Fundamentals", desc: "Networking, systems internals, data structures, and theory questions." },
                  { code: "R", name: "Riddle", badge: "Lateral Thinking", desc: "Logic enigmas, cipher puzzles, and lateral deduction challenges." },
                ].map((cat, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#120c0a]/80 border border-[#271c19]">
                    <div className="w-9 h-9 rounded-lg bg-[#27130e] border border-[#d94f2b]/40 flex items-center justify-center font-mono font-bold text-[#f6b49e] text-sm mb-3">
                      {cat.code}
                    </div>
                    <h3 className="text-base font-bold text-[#f8f4f0] mb-1">{cat.name}</h3>
                    <div className="text-[11px] font-mono text-[#e5933a] mb-2">{cat.badge}</div>
                    <p className="text-xs text-[#9e9087] leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Live Graph Radar Preview */}
          <section className="py-16">
            <div className="shell max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-[#ea5832] font-semibold block mb-2">
                  Tournament Map
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f4f0] mb-3">Confirmed 10-Node Graph</h2>
                <p className="text-xs text-[#9e9087] font-mono">
                  Starts at N01. Branch choices navigate teams towards the grand terminal finale at N08.
                </p>
              </div>

              <div className="p-2 sm:p-4 rounded-2xl bg-[#100b09]/80 border border-[#271c19]">
                <NodeGraph adminMode={true} compact={false} />
              </div>
            </div>
          </section>
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-[#221815]/80 py-8 text-center text-xs font-mono text-[#6e625a] bg-[#070505]/90">
          <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>NODEHUNT 2026 • SIAM-VIT Chapter</div>
            <div className="flex items-center gap-4 text-[#9e9087]">
              <Link href="/join" className="hover:text-white transition-colors">Start Hunt</Link>
              <Link href="/results" className="hover:text-white transition-colors">Standings</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Organizer Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </DarkGradientBg>
  );
}
