'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react'; // Tambahkan getSession
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Album, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // 1. Melakukan autentikasi
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Login Gagal',
          description: 'Email atau password salah. Silakan hubungi admin.',
          variant: 'destructive',
        });
      } else {
        // 2. Ambil session terbaru untuk mendapatkan data ROLE
        const session = await getSession();
        
        toast({
          title: 'Berhasil Masuk',
          description: `Selamat datang kembali, ${session?.user?.name || 'User'}!`,
        });

        // 3. LOGIKA REDIRECT BERDASARKAN ROLE
        // Pastikan role di Spreadsheet ditulis 'ADMIN' atau 'USER'
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <div className='flex justify-center items-center gap-2 mb-4'>
            <Album className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">TalaqyLabeler</CardTitle>
          </div>
          <CardDescription>
            Masukkan email dan password akun Anda untuk mengakses dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@talaqy.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
            <p>Belum punya akun? Silakan hubungi <strong>Admin</strong> untuk pendaftaran akses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}