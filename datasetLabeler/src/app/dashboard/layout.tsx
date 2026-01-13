import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <SidebarProvider>
      <AppSidebar role={session?.user?.role} />
      <SidebarInset>
        <Header 
          role={session?.user?.role} 
          name={session?.user?.name ?? undefined} 
          email={session?.user?.email ?? undefined} 
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}