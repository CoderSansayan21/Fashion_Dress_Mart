'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  ClipboardList,
  Users,
  ArrowLeft,
  Menu,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type AdminView = 'admin-dashboard' | 'admin-products' | 'admin-categories' | 'admin-orders' | 'admin-users';

const navItems: { view: AdminView; label: string; icon: React.ReactNode }[] = [
  { view: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { view: 'admin-products', label: 'Products', icon: <ShoppingBag className="h-5 w-5" /> },
  { view: 'admin-categories', label: 'Categories', icon: <FolderOpen className="h-5 w-5" /> },
  { view: 'admin-orders', label: 'Orders', icon: <ClipboardList className="h-5 w-5" /> },
  { view: 'admin-users', label: 'Users', icon: <Users className="h-5 w-5" /> },
];

function SidebarContent({ currentView, onNavigate, onBackToStore, onLogout }: {
  currentView: string;
  onNavigate: (view: AdminView) => void;
  onBackToStore: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-900">Admin Panel</h2>
          <p className="text-xs text-stone-500">Fashion Dress Mart</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                currentView === item.view
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3 space-y-1">
        <button
          onClick={onBackToStore}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Store
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentView = useUIStore((s) => s.currentView);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdminView = currentView.startsWith('admin-');

  if (!isAdminView) return <>{children}</>;

  const handleNavigate = (view: AdminView) => {
    navigateTo(view);
    setSidebarOpen(false);
  };

  const handleBackToStore = () => {
    navigateTo('home');
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries();
    navigateTo('home');
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-stone-200 bg-stone-50 lg:block">
        <SidebarContent
          currentView={currentView}
          onNavigate={handleNavigate}
          onBackToStore={handleBackToStore}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            currentView={currentView}
            onNavigate={handleNavigate}
            onBackToStore={handleBackToStore}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Mobile top bar */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <h1 className="text-lg font-bold text-stone-900">
                {navItems.find((i) => i.view === currentView)?.label || 'Admin'}
              </h1>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}