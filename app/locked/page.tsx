
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function LockedPage() {
  return (
    <>
      <Navbar />
      <main className="page-pad">
        <div className="shell">
          <div className="card">
            <div className="section-kicker">Locked</div>
            <h2>Team locked.</h2>
            <p className="section-copy" style={{ marginTop: 18 }}>Your team has been locked by the organizers. Please contact an event admin.</p>
            <div className="hero-actions"><Link className="btn btn-primary" href="/">Back home</Link></div>
          </div>
        </div>
      </main>
    </>
  );
}


