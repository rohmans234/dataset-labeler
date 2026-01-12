'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchUsersAction, createUserAction, updateUserAction } from "@/lib/actions";

type User = {
  email: string;
  name: string;
  role: string;
  avatar?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Load data dari Google Sheets
  const loadUsers = async () => {
    setIsLoading(true);
    const result = await fetchUsersAction();
    if (result.success) {
      setUsers(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        toast({ title: "Berhasil", description: result.message });
        setIsAddOpen(false);
        loadUsers();
      } else {
        toast({ title: "Gagal", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateUserAction(editUser.email, formData);
      if (result.success) {
        toast({ title: "Berhasil", description: "User diperbarui" });
        setEditUser(null);
        loadUsers();
      } else {
        toast({ title: "Gagal", description: "Gagal memperbarui user", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Tambah, edit, atau hapus akses pengguna.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Buat Akun Baru</DialogTitle>
                <DialogDescription>Daftarkan pengguna baru ke sistem.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" placeholder="Zaid" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="USER">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>Simpan Akun</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* MODAL EDIT USER */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          {editUser && (
            <form onSubmit={handleUpdateUser}>
              <DialogHeader>
                <DialogTitle>Edit User: {editUser.email}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nama</Label>
                  <Input id="edit-name" name="name" defaultValue={editUser.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select name="role" defaultValue={editUser.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-lg">Daftar Pengguna</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <div className="divide-y">
              {users.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Belum ada user.</p>
              ) : (
                users.map((user) => (
                  <div key={user.email} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        user.role === 'ADMIN' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>{user.role}</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}