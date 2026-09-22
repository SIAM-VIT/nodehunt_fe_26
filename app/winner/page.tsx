import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function WinnerPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg mx-auto p-10 rounded-2xl bg-[#252526] border border-[#007acc]/60 shadow-2xl">
            <div className="text-5xl mb-4">🏆</div>
            <h1 className="text-3xl font-extrabold text-[#ffffff] mb-3 font-mono">
              HUNT OBJECTIVE COMPLETED!
            </h1>
            <p className="text-sm text-[#cccccc] mb-8 font-sans leading-relaxed">
              Congratulations! Your team successfully traversed the tournament graph and resolved the finale challenge at Node N10.
            </p>
            <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#3e3e42] text-xs font-mono text-[#9cdcfe] mb-6">
              Final tournament standings and rankings will be officially projected and announced by the event organizers from the Admin Command Deck.
            </div>
            <div className="flex justify-center gap-4 font-mono text-xs">
              <Link
                href="/"
                className="px-6 py-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white rounded-xl transition-all font-bold shadow-md shadow-[#007acc]/20"
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
