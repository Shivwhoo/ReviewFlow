import DashboardSidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-surface-0">
      <DashboardSidebar />
      <main className="flex-1 lg:p-8 p-4 pt-18 lg:pt-8 overflow-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
