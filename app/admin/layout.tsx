import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main className="flex flex-1 flex-col p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
