import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function LockedPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md mx-auto p-10 rounded-2xl bg-[#252526] border border-[#f48771]/50 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#3c1e1e] border border-[#f48771]/60 flex items-center justify-center text-[#f48771] text-2xl font-bold mb-5">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff] mb-3 font-mono">
              SESSION TEMPORARILY LOCKED
            </h1>
            <p className="text-sm text-[#cccccc] mb-8 font-sans leading-relaxed">
              Your team session has been paused by an event administrator or invigilator. 
              Please contact the organizing desk to unlock your session.
            </p>
            <div className="flex justify-center gap-4 font-mono text-xs">
              <Link
                href="/"
                className="px-6 py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded-xl transition-all font-bold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </DarkGradientBg>
  );
}
