import DashboardSidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reviewflow-theme flex min-h-dvh w-full bg-[#FBF6EC] text-[#17120E]">
      <DashboardSidebar />
      {/* min-w-0 lets this flex child shrink on phones so wide content scrolls inside itself, not the page */}
      <main className="min-w-0 flex-1 overflow-auto p-4 pt-18 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}