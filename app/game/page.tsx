
import { GameClient } from "@/components/GameClient";
import { Navbar } from "@/components/Navbar";

export default function GamePage() {
  return (
    <>
      <Navbar />
      <main className="game-page page-pad">
        <div className="shell">
          <div className="section-head game-head">
            <div>
              <div className="section-kicker">Live Hunt</div>
              <h2>Start at N01.</h2>
            </div>
            <p className="section-copy">Answer the current node, unlock movement, then choose Left or Right. The graph view highlights only your visited path.</p>
          </div>
          <GameClient />
        </div>
      </main>
    </>
  );
}


