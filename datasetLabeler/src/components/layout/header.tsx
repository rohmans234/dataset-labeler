'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Album, LogOut, User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SidebarTrigger } from '@/components/ui/sidebar';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
const adminAvatar = PlaceHolderImages.find(p => p.id === 'admin-avatar-1');

type HeaderProps = {
  role?: string;
  name?: string;
  email?: string;
}

export default function Header({ role = 'USER', name, email }: HeaderProps) {
  // 1. Inisialisasi state mounted untuk menangani Hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = role === 'ADMIN';
  const avatar = isAdmin ? adminAvatar : userAvatar;
  const fallback = isAdmin ? 'AD' : 'US';

  // 2. Render Placeholder selama proses hidrasi (Server-Side safe)
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="mr-2 md:mr-4 w-10 h-10" /> {/* Placeholder SidebarTrigger */}
          <div className="flex items-center gap-2">
            <Album className="h-6 w-6 text-primary shrink-0" />
            <span className="font-bold text-base md:text-lg font-headline">TalaqyLabeler</span>
          </div>
        </div>
      </header>
    );
  }

  // 3. Render asli setelah komponen terpasang (Mounted) di client
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <SidebarTrigger className="mr-2 md:mr-4" />
        
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="mr-6 flex items-center gap-2">
          <Album className="h-6 w-6 text-primary shrink-0" />
          <span className="font-bold text-base md:text-lg font-headline truncate">TalaqyLabeler</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-primary/10">
                  {avatar && <AvatarImage src={avatar.imageUrl} alt="User Avatar" />}
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil Saya</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer" 
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}