
import { Navbar } from "@/components/Navbar";
import { ResultsClient } from "@/components/ResultsClient";

export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main className="page-pad">
        <div className="shell">
          <ResultsClient />
        </div>
      </main>
    </>
  );
}


