import { GameClient } from "@/components/GameClient";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function GamePage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-4">
          <GameClient />
        </main>
      </div>
    </DarkGradientBg>
  );
}
