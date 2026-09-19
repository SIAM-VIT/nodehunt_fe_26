
import { FloatingTechBackground } from "@/components/FloatingTechBackground";
import { JoinForm } from "@/components/JoinForm";
import { Navbar } from "@/components/Navbar";

export default function JoinPage() {
  return (
    <>
      <Navbar />
      <main className="join-page">
        <FloatingTechBackground />
        <div className="shell join-layout">
          <div>
            <span className="eyebrow"><span className="pulse-dot" /> Team entry</span>
            <h1>
              Name your team.
              <span className="headline-break">Enter the graph.</span>
            </h1>
            <p className="hero-copy">
              This creates your team session and starts the hunt at the top node, N01. Keep your password safe for event verification and recovery.
            </p>
          </div>
          <JoinForm />
        </div>
      </main>
    </>
  );
}


