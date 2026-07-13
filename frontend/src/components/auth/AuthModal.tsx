'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab } = useUIStore();
  const { login, register, isLoading, error, clearError, user } = useAuthStore();

  // Close modal on successful auth
  useEffect(() => {
    if (user && isAuthModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen, setAuthModalOpen]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const resetLoginFields = () => {
    setLoginEmail('');
    setLoginPassword('');
    clearError();
  };

  const resetRegisterFields = () => {
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegPhone('');
    setRegAddress('');
    clearError();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(regName, regEmail, regPassword, regPhone || undefined, regAddress || undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAuthModalOpen(false);
      resetLoginFields();
      resetRegisterFields();
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-stone-900">
            Welcome to Fashion Dress Mart
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-stone-500">
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={authModalTab}
          onValueChange={(v) => {
            setAuthModalTab(v as 'login' | 'register');
            clearError();
          }}
          className="mt-2"
        >
          <TabsList className="mx-auto flex w-full">
            <TabsTrigger value="login" className="flex-1">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="border-stone-300 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="border-stone-300 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-amber-600 to-rose-600 font-semibold text-white hover:from-amber-700 hover:to-rose-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-sm text-stone-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setAuthModalTab('register');
                  }}
                  className="font-medium text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Register
                </button>
              </p>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Your full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="border-stone-300 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="border-stone-300 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create a password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-stone-300 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone (optional)</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+94 XX XXX XXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="border-stone-300 focus-visible:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-address">Address (optional)</Label>
                  <Input
                    id="reg-address"
                    type="text"
                    placeholder="Your address"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="border-stone-300 focus-visible:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-amber-600 to-rose-600 font-semibold text-white hover:from-amber-700 hover:to-rose-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-sm text-stone-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setAuthModalTab('login');
                  }}
                  className="font-medium text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}