import { create } from 'zustand';
import type { ViewType, Product } from '@/types';

interface UIState {
  currentView: ViewType;
  previousView: ViewType | null;
  selectedProductId: string | null;
  selectedOrderNumber: string | null;
  searchQuery: string;
  selectedCategoryId: string | null;
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  navigateTo: (view: ViewType) => void;
  viewProduct: (productId: string) => void;
  viewOrder: (orderNumber: string) => void;
  goBack: () => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setCartOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentView: 'home',
  previousView: null,
  selectedProductId: null,
  selectedOrderNumber: null,
  searchQuery: '',
  selectedCategoryId: null,
  isCartOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  navigateTo: (view) => set({ previousView: get().currentView, currentView: view, isCartOpen: false }),
  viewProduct: (productId) => set({ previousView: get().currentView, currentView: 'product-detail', selectedProductId: productId, isCartOpen: false }),
  viewOrder: (orderNumber) => set({ previousView: get().currentView, currentView: 'order-detail', selectedOrderNumber: orderNumber }),
  goBack: () => {
    const prev = get().previousView;
    if (prev) set({ currentView: prev, previousView: null });
    else set({ currentView: 'home', previousView: null });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
}));