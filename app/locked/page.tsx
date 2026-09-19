import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function LockedPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#120b09]/90 border border-rose-500/40 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-300 text-xl font-bold mb-4">
              🔒
            </div>
            <h1 className="text-xl font-bold text-[#f8f4f0] mb-2 font-mono">
              SESSION TEMPORARILY LOCKED
            </h1>
            <p className="text-xs text-[#9e9087] mb-6 font-sans leading-relaxed">
              Your team session has been paused by an event administrator or invigilator. 
              Please contact the organizing desk to unlock your session.
            </p>
            <div className="flex justify-center gap-3 font-mono text-xs">
              <Link
                href="/results"
                className="px-4 py-2 bg-[#1c1412] hover:bg-[#281c19] text-[#d6ccc4] rounded-lg transition-colors border border-[#3b2a26]"
              >
                View Standings
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-[#d94f2b] hover:bg-[#c24122] text-white rounded-lg transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </DarkGradientBg>
  );
}
