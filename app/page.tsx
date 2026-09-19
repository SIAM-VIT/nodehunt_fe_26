
import Link from "next/link";
import { FloatingTechBackground } from "@/components/FloatingTechBackground";
import { Navbar } from "@/components/Navbar";
import { NodeGraph } from "@/components/NodeGraph";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <header className="hero home-hero reference-hero">
          <FloatingTechBackground />
          <div className="shell reference-hero-inner">
            <div className="hero-content centered-hero-content">
              <span className="eyebrow"><span className="pulse-dot" /> NODEHUNT 2026 / Technical graph hunt</span>
              <h1 className="reference-title">
                <span className="title-gradient">Master the graph</span>
                <span className="title-white">through challenge</span>
              </h1>
              <p className="hero-copy reference-copy">
                Solve programming, debugging, quiz, and riddle nodes with your team. Every correct answer unlocks a strategic edge through the NodeHunt graph.
              </p>
              <div className="hero-actions centered">
                <Link className="btn btn-primary hero-main-cta" href="/join">Get Started</Link>
                <Link className="btn btn-ghost" href="#details">Explore Rules</Link>
              </div>
            </div>
          </div>
        </header>

        <section id="details" className="event-details-section">
          <div className="shell grid-2">
            <div>
              <div className="section-kicker">Event Details</div>
              <h2>Not a quiz. Not a race. A graph.</h2>
            </div>
            <div className="details-grid">
              <InfoCard label="Format" value="Team-based graph traversal" />
              <InfoCard label="Start" value="All teams begin at N01" />
              <InfoCard label="Attempts" value="3 per node" />
              <InfoCard label="Finals" value="4 terminal nodes" />
            </div>
          </div>
        </section>

        <section id="gameplay">
          <div className="shell">
            <div className="section-head">
              <div>
                <div className="section-kicker">Gameplay</div>
                <h2>Answer first. Move after.</h2>
              </div>
              <p className="section-copy">A correct answer unlocks Left and Right. If all attempts fail, the path still unlocks with zero points unless an admin locks the team.</p>
            </div>
            <div className="loop">
              {[
                ["Step 01", "Start", "Every team starts from the top node, N01."],
                ["Step 02", "Solve", "Submit answers with up to three attempts."],
                ["Step 03", "Score", "Earn 30, 20, 10, or 0 points."],
                ["Step 04", "Choose", "See next type and difficulty, then choose Left or Right."],
                ["Step 05", "Finish", "Complete one of four final nodes and enter results."],
              ].map(([kicker, title, copy]) => (
                <div className="card loop-card" key={title}>
                  <div className="mono-label">{kicker}</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="categories">
          <div className="shell">
            <div className="section-head">
              <div>
                <div className="section-kicker">Challenge Types</div>
                <h2>Four disciplines.</h2>
              </div>
              <p className="section-copy">Each node has a type. Route choices reveal the next type and difficulty, but never the question itself.</p>
            </div>
            <div className="grid-4">
              <Category letter="D" title="Debugging" text="Trace broken logic and reason through code execution." tone="medium" />
              <Category letter="C" title="Coding" text="Solve algorithmic prompts under event constraints." tone="easy" />
              <Category letter="Q" title="Quiz" text="Technical, mathematical, and knowledge-based questions." tone="hard" />
              <Category letter="R" title="Riddle" text="Logic puzzles and lateral-thinking challenges." tone="accent" />
            </div>
          </div>
        </section>

        <section id="scoring">
          <div className="shell">
            <div className="section-head">
              <div>
                <div className="section-kicker">Scoring</div>
                <h2>Accuracy matters.</h2>
              </div>
              <p className="section-copy">Final nodes are scored too. A team can continue after three wrong attempts, but receives zero points for that node.</p>
            </div>
            <div className="grid-4">
              <ScoreCard label="1st attempt" value="30" text="Best solve." />
              <ScoreCard label="2nd attempt" value="20" text="One miss." />
              <ScoreCard label="3rd attempt" value="10" text="Final scoring try." />
              <ScoreCard label="Exhausted" value="0" text="Movement unlocks." />
            </div>
          </div>
        </section>

        <section id="graph">
          <div className="shell">
            <div className="section-head">
              <div>
                <div className="section-kicker">Confirmed Graph</div>
                <h2>The map behind the hunt.</h2>
              </div>
              <p className="section-copy">The graph starts at N01 and ends at one of four final nodes. The red final Quiz node is reachable from both sides.</p>
            </div>
            <div className="card graph-card home-graph-card">
              <NodeGraph />
            </div>
          </div>
        </section>

        <section id="timeline">
          <div className="shell">
            <div className="section-head">
              <div>
                <div className="section-kicker">Flow</div>
                <h2>From entry to leaderboard.</h2>
              </div>
            </div>
            <div className="timeline-grid">
              <InfoCard label="01" value="Open homepage and read rules" />
              <InfoCard label="02" value="Enter team name and password" />
              <InfoCard label="03" value="Start at N01 and traverse" />
              <InfoCard label="04" value="Finish and view ranks" />
            </div>
            <div className="hero-actions centered"><Link className="btn btn-primary" href="/join">Start team entry →</Link></div>
          </div>
        </section>
      </main>
      <footer>
        <div className="shell footer-inner">
          <div className="brand"><span className="brand-mark">N</span><span>NODEHUNT</span></div>
          <div>NodeHunt 2026 / graph-based technical hunt</div>
        </div>
      </footer>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="card info-card"><div className="mono-label">{label}</div><strong>{value}</strong></div>;
}

function Category({ letter, title, text, tone }: { letter: string; title: string; text: string; tone: "easy" | "medium" | "hard" | "accent" }) {
  const colorClass = tone === "accent" ? "" : `diff-${tone}`;
  return (
    <div className="card category-card">
      <div className={`type-badge ${colorClass}`} style={tone === "accent" ? { color: "var(--accent-2)" } : undefined}>{letter}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ScoreCard({ label, value, text }: { label: string; value: string; text: string }) {
  return <div className="card"><div className="mono-label">{label}</div><div className="big-number">{value}</div><p>{text}</p></div>;
}


