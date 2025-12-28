import Link from 'next/link';
import Image from 'next/image';
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
import { Album, LayoutDashboard, LogOut, User, ShieldCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

type HeaderProps = {
  role?: 'admin' | 'user';
}

export default function Header({ role = 'user' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className="mr-6 flex items-center gap-2">
          <Album className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">LabelFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {role === 'user' && (
            <Link
              href="/dashboard"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
                  <AvatarFallback>ZA</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Zaid</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    zaid@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              {role === 'admin' && (
                <DropdownMenuItem asChild>
                   <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                   </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
