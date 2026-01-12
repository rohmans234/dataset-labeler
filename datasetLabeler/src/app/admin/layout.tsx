'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Users, History, LayoutDashboard } from "lucide-react";
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header role="admin" />
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin" isActive={pathname === '/admin'}>
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/users" isActive={pathname === '/admin/users'}>
                  <Users />
                  Users
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
          <SidebarInset>
              <div className="p-4 md:p-8">
                <SidebarTrigger className="md:hidden mb-4" />
                {children}
              </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
