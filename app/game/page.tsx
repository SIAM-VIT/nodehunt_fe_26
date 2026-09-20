import { GameClient } from "@/components/GameClient";
import { Navbar } from "@/components/Navbar";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export default function GamePage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f8f6f5] overflow-x-hidden selection:bg-[#b43426] selection:text-white">
      {/* Floating Paths Animated Lines (Position -1 for dynamic flow) */}
      <FloatingPathsBackground
        position={-1}
        className="min-h-screen flex flex-col justify-between"
      >
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 py-4">
            <GameClient />
          </main>
        </div>
      </FloatingPathsBackground>
    </div>
  );
}
