import { JoinForm } from "@/components/JoinForm";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function JoinPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-8 max-w-md mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ea5832] font-semibold bg-[#26130e] border border-[#d94f2b]/30 px-3 py-1 rounded-full">
              Participant Entry
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f8f4f0] mt-3">
              Team Authentication
            </h1>
            <p className="text-xs text-[#9e9087] mt-1.5 font-mono">
              Register a team session or resume your existing tournament path.
            </p>
          </div>
          <JoinForm />
        </main>
      </div>
    </DarkGradientBg>
  );
}
