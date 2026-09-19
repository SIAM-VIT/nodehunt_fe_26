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
          <section className="relative pt-24 pb-20 border-b border-white/[0.06]">
            <div className="shell text-center max-w-4xl mx-auto">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#180e0c] border border-[#b43426]/30 text-[#e8b5af] font-mono text-xs mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#c84332] animate-pulse" />
                SIAM-VIT NodeHunt 2026 • Live Tournament
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f8f6f5] mb-6 leading-[1.15]">
                Master the graph through <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#d95b4c] via-[#d9822b] to-[#f0c294] bg-clip-text text-transparent">
                  algorithmic challenge
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#a69a93] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
                A team-based graph traversal tournament. Tackle coding, debugging, quizzes, and riddles. 
                Demonstrate your solutions to room invigilators, unlock branching choices, and navigate the graph to the finale.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/join"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#b43426] to-[#9b2a1e] hover:from-[#c84332] hover:to-[#b43426] text-white font-mono text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#b43426]/20 cursor-pointer"
                >
                  Enter Arena →
                </Link>
                <Link
                  href="/results"
                  className="px-7 py-3 rounded-xl bg-[#100b0a]/80 hover:bg-[#1a110f] border border-white/[0.1] text-[#d1c7c2] font-mono text-sm transition-all"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Specs Grid */}
          <section className="py-12 border-b border-white/[0.06] bg-[#080606]/40">
            <div className="shell">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Graph Map", val: "10 Nodes", desc: "Start at N01, finale at N08" },
                  { label: "Scoring Model", val: "30 / 20 / 10", desc: "Decrements on retry strikes" },
                  { label: "Verification", val: "Invigilator Code", desc: "In-person solution approval" },
                  { label: "Advancement", val: "Zero-Elimination", desc: "3 strikes unlock forward path" },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#0e0a09]/75 border border-white/[0.07] text-left">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#d95b4c] font-semibold mb-1">
                      {item.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#f8f6f5] mb-1 font-mono">
                      {item.val}
                    </div>
                    <div className="text-xs text-[#8c8079] font-sans">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gameplay Workflow */}
          <section className="py-16 border-b border-white/[0.06]">
            <div className="shell">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#d95b4c] font-semibold block mb-2">
                  Event Mechanics
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f6f5]">How the tournament runs</h2>
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
                  <div key={idx} className="p-6 rounded-2xl bg-[#0e0a09]/70 border border-white/[0.07] relative hover:border-[#b43426]/30 transition-all">
                    <div className="text-xs font-mono text-[#d95b4c] font-bold mb-3">
                      STEP {step.step}
                    </div>
                    <h3 className="text-base font-bold text-[#f8f6f5] mb-2">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-[#8c8079]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Challenge Categories */}
          <section className="py-16 border-b border-white/[0.06] bg-[#080606]/40">
            <div className="shell">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#d95b4c] font-semibold block mb-2">
                  Discipline Tracks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f6f5]">Challenge Classifications</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { code: "D", name: "Debugging", badge: "Logic & Execution", desc: "Analyze broken code, trace edge cases, and locate base-case flaws." },
                  { code: "C", name: "Coding", badge: "Algorithms", desc: "Implement algorithmic tasks with efficient time and space complexity." },
                  { code: "Q", name: "Quiz", badge: "CS Fundamentals", desc: "Networking, systems internals, data structures, and theory questions." },
                  { code: "R", name: "Riddle", badge: "Lateral Thinking", desc: "Logic enigmas, cipher puzzles, and lateral deduction challenges." },
                ].map((cat, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#0e0a09]/75 border border-white/[0.07]">
                    <div className="w-9 h-9 rounded-lg bg-[#21110e] border border-[#b43426]/30 flex items-center justify-center font-mono font-bold text-[#e8b5af] text-sm mb-3">
                      {cat.code}
                    </div>
                    <h3 className="text-base font-bold text-[#f8f6f5] mb-1">{cat.name}</h3>
                    <div className="text-[11px] font-mono text-[#d9822b] mb-2">{cat.badge}</div>
                    <p className="text-xs text-[#8c8079] leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Live Graph Radar Preview */}
          <section className="py-16">
            <div className="shell max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-[#d95b4c] font-semibold block mb-2">
                  Tournament Map
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f8f6f5] mb-3">Confirmed 10-Node Graph</h2>
                <p className="text-xs text-[#8c8079] font-mono">
                  Starts at N01. Branch choices navigate teams towards the grand terminal finale at N08.
                </p>
              </div>

              <div className="p-2 sm:p-4 rounded-2xl bg-[#0a0707]/80 border border-white/[0.07]">
                <NodeGraph adminMode={true} compact={false} />
              </div>
            </div>
          </section>
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-white/[0.06] py-8 text-center text-xs font-mono text-[#594f49] bg-[#050505]/95">
          <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>NODEHUNT 2026 • SIAM-VIT Chapter</div>
            <div className="flex items-center gap-4 text-[#8c8079]">
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
