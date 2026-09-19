import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function WinnerPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#120b09]/90 border border-[#e5933a]/40 shadow-2xl">
            <div className="text-4xl mb-3">🏆</div>
            <h1 className="text-2xl font-bold text-[#f8f4f0] mb-2 font-mono">
              HUNT OBJECTIVE COMPLETED!
            </h1>
            <p className="text-xs text-[#9e9087] mb-6 font-sans leading-relaxed">
              Congratulations! Your team successfully traversed the tournament graph and completed the final terminal node challenge.
            </p>
            <div className="flex justify-center gap-3 font-mono text-xs">
              <Link
                href="/results"
                className="px-5 py-2.5 bg-[#d94f2b] hover:bg-[#c24122] text-white rounded-lg transition-colors font-bold"
              >
                View Official Results →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </DarkGradientBg>
  );
}
