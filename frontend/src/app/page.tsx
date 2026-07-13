'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import AdminLayout from '@/components/admin/AdminLayout';
import HomeView from '@/components/home/HomeView';
import ShopView from '@/components/shop/ShopView';
import ProductDetailView from '@/components/products/ProductDetailView';
import CheckoutView from '@/components/checkout/CheckoutView';
import OrdersView from '@/components/orders/OrdersView';
import OrderDetailView from '@/components/orders/OrderDetailView';
import WishlistView from '@/components/wishlist/WishlistView';
import ProfileView from '@/components/profile/ProfileView';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';
import Providers from '@/providers/QueryProvider';

function ViewRouter() {
  const currentView = useUIStore((s) => s.currentView);

  switch (currentView) {
    case 'home':
      return <HomeView />;
    case 'shop':
      return <ShopView />;
    case 'product-detail':
      return <ProductDetailView />;
    case 'checkout':
      return <CheckoutView />;
    case 'orders':
      return <OrdersView />;
    case 'order-detail':
      return <OrderDetailView />;
    case 'wishlist':
      return <WishlistView />;
    case 'profile':
      return <ProfileView />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-products':
      return <AdminProducts />;
    case 'admin-categories':
      return <AdminCategories />;
    case 'admin-orders':
      return <AdminOrders />;
    case 'admin-users':
      return <AdminUsers />;
    default:
      return <HomeView />;
  }
}

function AppShell() {
  const user = useAuthStore((s) => s.user);
  const loadCart = useCartStore((s) => s.loadCart);
  const queryClient = useQueryClient();
  const currentView = useUIStore((s) => s.currentView);

  // Load cart when user logs in, invalidate on logout
  useEffect(() => {
    if (user && user.role !== 'admin') {
      loadCart(user.id);
    } else if (!user) {
      queryClient.invalidateQueries();
    }
  }, [user, loadCart, queryClient]);

  // Redirect non-admin users from admin views
  useEffect(() => {
    if (currentView.startsWith('admin-') && (!user || user.role !== 'admin')) {
      useUIStore.getState().navigateTo('home');
    }
  }, [currentView, user]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const isAdminView = currentView.startsWith('admin-');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className={isAdminView ? 'flex-1' : 'flex-1'}>
        <AdminLayout>
          <ViewRouter />
        </AdminLayout>
      </main>
      {!isAdminView && <Footer />}
      {!isAdminView && <CartDrawer />}
      <AuthModal />
    </div>
  );
}

export default function Home() {
  return (
    <Providers>
      <AppShell />
    </Providers>
  );
}