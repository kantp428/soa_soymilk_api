import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-zinc-50 w-full h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto w-full pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
