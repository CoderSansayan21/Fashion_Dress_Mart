'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  UserCircle,
  Shield,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { fetchCategories } from '@/lib/api';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

export default function Header() {
  const {
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery,
    setCartOpen,
    setAuthModalOpen,
  } = useUIStore();
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigateTo('shop');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    useUIStore.getState().setSelectedCategoryId(categoryId);
    navigateTo('shop');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (view: 'home' | 'shop' | 'orders' | 'wishlist' | 'profile') => {
    if (view === 'orders' || view === 'wishlist' || view === 'profile') {
      if (!user) {
        setAuthModalOpen(true);
        setMobileMenuOpen(false);
        return;
      }
    }
    if (view === 'shop') {
      setSearchQuery('');
      setSearchInput('');
    }
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigateTo('checkout');
  };

  const navLinkClass = (view: string) =>
    cn(
      'relative text-sm font-medium transition-colors hover:text-amber-700',
      currentView === view
        ? 'text-amber-800'
        : 'text-stone-600'
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="hidden text-lg font-bold text-stone-900 sm:block">
              Fashion Dress Mart
            </span>
            <span className="text-lg font-bold text-stone-900 sm:hidden">FDM</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <button onClick={() => handleNavClick('home')} className={navLinkClass('home')}>
              Home
              {currentView === 'home' && (
                <motion.div
                  layoutId="header-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-amber-600"
                />
              )}
            </button>
            <button onClick={() => handleNavClick('shop')} className={navLinkClass('shop')}>
              Shop
              {currentView === 'shop' && (
                <motion.div
                  layoutId="header-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-amber-600"
                />
              )}
            </button>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn('flex items-center gap-1 text-sm font-medium text-stone-600 transition-colors hover:text-amber-700')}>
                  Categories
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right: Search + Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearch}
                className="overflow-hidden"
              >
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search dresses..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 w-full border-stone-300 bg-stone-50 text-sm"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => {
              if (searchOpen && searchInput.trim()) {
                setSearchQuery(searchInput.trim());
                navigateTo('shop');
                setSearchOpen(false);
              } else {
                setSearchOpen(!searchOpen);
              }
            }}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            <span className="sr-only">Search</span>
          </Button>

          {/* Cart - hide in admin views */}
          {!currentView.startsWith('admin-') && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white hover:bg-rose-600">
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          )}

          {/* Wishlist - hide in admin views */}
          {!currentView.startsWith('admin-') && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50 sm:flex"
              onClick={() => handleNavClick('wishlist')}
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
          )}

          {/* User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50 sm:flex"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => { navigateTo('admin-dashboard'); }}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleNavClick('profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick('orders')}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick('wishlist')}>
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-rose-600 focus:text-rose-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50 sm:flex"
              onClick={() => setAuthModalOpen(true)}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Button>
          )}

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-stone-600 hover:text-amber-700 hover:bg-amber-50 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto p-0">
          <SheetHeader className="border-b border-stone-200 px-6 py-4">
            <SheetTitle className="flex items-center gap-2 text-stone-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
                <span className="text-xs font-bold text-white">F</span>
              </div>
              Fashion Dress Mart
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search dresses..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-10 pl-9 border-stone-300"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              <SheetClose asChild>
                <button
                  onClick={() => handleNavClick('home')}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    currentView === 'home'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  Home
                </button>
              </SheetClose>

              <SheetClose asChild>
                <button
                  onClick={() => handleNavClick('shop')}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    currentView === 'shop'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  Shop
                </button>
              </SheetClose>

              {/* Categories section */}
              <div className="mt-2 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                Categories
              </div>
              {categories.map((cat) => (
                <SheetClose key={cat.id} asChild>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex items-center rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                  >
                    {cat.name}
                  </button>
                </SheetClose>
              ))}

              <div className="my-3 h-px bg-stone-200" />

              <SheetClose asChild>
                <button
                  onClick={() => handleNavClick('wishlist')}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </button>
              </SheetClose>

              <SheetClose asChild>
                <button
                  onClick={() => handleNavClick('orders')}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </button>
              </SheetClose>

              <div className="my-3 h-px bg-stone-200" />

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <SheetClose asChild>
                      <button
                        onClick={() => { navigateTo('admin-dashboard'); setMobileMenuOpen(false); }}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </button>
                    </SheetClose>
                  )}
                  <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Account
                  </div>
                  <SheetClose asChild>
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    >
                      <UserCircle className="h-4 w-4" />
                      {user.full_name}
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </SheetClose>
                </>
              ) : (
                <SheetClose asChild>
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50"
                  >
                    <User className="h-4 w-4" />
                    Sign In / Register
                  </button>
                </SheetClose>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}