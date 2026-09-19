
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function WinnerPage() {
  return (
    <>
      <Navbar />
      <main className="page-pad">
        <div className="shell">
          <div className="card">
            <div className="section-kicker">Completed</div>
            <h2>Hunt completed.</h2>
            <p className="section-copy" style={{ marginTop: 18 }}>Your team has completed NodeHunt. Final stats will appear here once connected to the backend.</p>
            <div className="grid-4" style={{ marginTop: 32 }}>
              <div className="stat"><span className="mono-label">Total Score</span><strong>210</strong></div>
              <div className="stat"><span className="mono-label">Final Node</span><strong>N14</strong></div>
              <div className="stat"><span className="mono-label">Path</span><strong>7 nodes</strong></div>
              <div className="stat"><span className="mono-label">Finish</span><strong>42:18</strong></div>
            </div>
            <div className="hero-actions"><Link className="btn btn-primary" href="/">Back home</Link></div>
          </div>
        </div>
      </main>
    </>
  );
}


