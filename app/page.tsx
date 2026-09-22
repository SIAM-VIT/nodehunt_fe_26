import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function Home() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 border-b border-[#3e3e42]">
            <div className="shell text-center max-w-4xl mx-auto">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#252526] border border-[#007acc]/40 text-[#4fc1ff] font-mono text-sm mb-8 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ec9b0] animate-pulse" />
                SIAM-VIT NodeHunt 2026 • Live Tournament
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#ffffff] mb-8 leading-[1.2]">
                Master the graph through <br className="hidden sm:inline" />
                <span className="text-[#4fc1ff]">
                  algorithmic challenge
                </span>
              </h1>

              {/* Action Button - Enter Arena ONLY */}
              <div className="flex items-center justify-center pt-2">
                <Link
                  href="/join"
                  className="px-9 py-4 rounded-xl bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-base font-bold tracking-wider transition-all shadow-xl shadow-[#007acc]/30 cursor-pointer"
                >
                  Enter Arena →
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Specs Grid */}
          <section className="py-14 border-b border-[#3e3e42] bg-[#252526]/50">
            <div className="shell">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: "Graph Map", val: "10 Nodes", desc: "Start at N01, finale at N10" },
                  { label: "Scoring Model", val: "30 / 20 / 10", desc: "Decrements on retry strikes" },
                  { label: "Verification", val: "Invigilator Code", desc: "In-person solution approval" },
                  { label: "Advancement", val: "Zero-Elimination", desc: "3 strikes unlock forward path" },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-xl bg-[#252526] border border-[#3e3e42] text-left hover:border-[#007acc]/60 transition-colors">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#4ec9b0] font-semibold mb-1.5">
                      {item.label}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-1.5 font-mono">
                      {item.val}
                    </div>
                    <div className="text-sm text-[#cccccc] font-sans">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Challenge Categories */}
          <section className="py-16 border-b border-[#3e3e42] bg-[#1e1e1e]">
            <div className="shell">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4fc1ff] font-semibold block mb-2">
                  Discipline Tracks
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#ffffff]">Challenge Classifications</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { code: "D", name: "Debugging", badge: "Logic & Execution", desc: "Analyze broken code, trace edge cases, and locate base-case flaws." },
                  { code: "C", name: "Coding", badge: "Algorithms", desc: "Implement algorithmic tasks with efficient time and space complexity." },
                  { code: "Q", name: "Quiz", badge: "CS Fundamentals", desc: "Networking, systems internals, data structures, and theory questions." },
                  { code: "R", name: "Riddle", badge: "Lateral Thinking", desc: "Logic enigmas, cipher puzzles, and lateral deduction challenges." },
                ].map((cat, idx) => (
                  <div key={idx} className="p-6 rounded-xl bg-[#252526] border border-[#3e3e42] hover:border-[#007acc]/60 transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-[#1e1e1e] border border-[#007acc]/40 flex items-center justify-center font-mono font-bold text-[#4fc1ff] text-base mb-4">
                      {cat.code}
                    </div>
                    <h3 className="text-lg font-bold text-[#ffffff] mb-1">{cat.name}</h3>
                    <div className="text-xs font-mono text-[#dcdcaa] mb-2.5">{cat.badge}</div>
                    <p className="text-sm text-[#cccccc] leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-[#3e3e42] py-8 text-center text-xs font-mono text-[#858585] bg-[#181818]">
          <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>NODEHUNT 2026 • SIAM-VIT Chapter</div>
            <div className="flex items-center gap-6 text-[#cccccc]">
              <Link href="/join" className="hover:text-white transition-colors">Start Hunt</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Organizer Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </DarkGradientBg>
  );
}
