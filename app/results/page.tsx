import { Navbar } from "@/components/Navbar";
import { ResultsClient } from "@/components/ResultsClient";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function ResultsPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-6">
          <ResultsClient />
        </main>
      </div>
    </DarkGradientBg>
  );
}
