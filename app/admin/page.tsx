import { AdminPreview } from "@/components/AdminPreview";
import { Navbar } from "@/components/Navbar";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="py-6">
        <AdminPreview />
      </main>
    </>
  );
}
