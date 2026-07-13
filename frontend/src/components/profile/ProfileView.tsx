'use client';

import { LogOut, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileView() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <User className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="mb-2 text-2xl font-bold text-stone-900">Please sign in</h2>
        <p className="mb-6 text-stone-500">Sign in to view your profile</p>
        <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          Sign In
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigateTo('home');
  };

  const initials = user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">My Profile</h1>
          <p className="mt-1 text-stone-500">Manage your account information</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-20 w-20 bg-gradient-to-br from-amber-400 to-rose-400">
              <AvatarFallback className="text-2xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{user.full_name}</CardTitle>
            <p className="text-sm text-stone-500 capitalize">{user.role} Account</p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Full Name</p>
                  <p className="font-medium">{user.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                  <Mail className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                    <MapPin className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Address</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                  <Calendar className="h-5 w-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Member Since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigateTo('orders')}>
                My Orders
              </Button>
              <Button variant="outline" onClick={() => navigateTo('wishlist')}>
                My Wishlist
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}