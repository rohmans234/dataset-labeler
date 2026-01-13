'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  History, 
  UserPlus, 
  Settings,
  AudioLines
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  role?: string;
};

export function AppSidebar({ role = 'USER' }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === 'ADMIN';

  // Menu khusus Admin
  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "User Management", url: "/admin/users", icon: UserPlus },
    { title: "All History", url: "/admin/history", icon: History },
  ];

  // Menu khusus User (Hanya Pelabelan)
  const userItems = [
    { title: "Labeling", url: "/dashboard", icon: AudioLines },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar variant="inset" className="shadow-sm">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-headline text-primary">Navigasi {isAdmin ? 'Admin' : 'User'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}