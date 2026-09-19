import { AdminPreview } from "@/components/AdminPreview";
import { Navbar } from "@/components/Navbar";
import { DarkGradientBg } from "@/components/DarkGradientBg";

export default function AdminPage() {
  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-6">
          <AdminPreview />
        </main>
      </div>
    </DarkGradientBg>
  );
}
