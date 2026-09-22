import { JoinForm } from "@/components/JoinForm";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function JoinPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-8 max-w-lg mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4fc1ff] font-semibold bg-[#252526] border border-[#007acc]/40 px-3.5 py-1.5 rounded-full">
              Participant Entry
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ffffff] mt-4">
              Team Authentication
            </h1>
          </div>
          <JoinForm />
        </main>
      </div>
    </DarkGradientBg>
  );
}
