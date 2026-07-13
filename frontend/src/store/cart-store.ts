import { create } from 'zustand';
import type { Cart, CartItem, Product } from '@/types';
import { fetchCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '@/lib/api';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  loadCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: (userId: string) => Promise<void>;
  calculateTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,
  loadCart: async (userId) => {
    set({ isLoading: true });
    try {
      const cart = await fetchCart(userId);
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      set({ cart, itemCount: count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  addItem: async (userId, productId, product, quantity = 1) => {
    set({ isLoading: true });
    try {
      const cart = await apiAddToCart(userId, productId, quantity);
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      set({ cart, itemCount: count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  updateQuantity: async (itemId, quantity) => {
    try {
      const cart = await apiUpdateCartItem(itemId, quantity);
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      set({ cart, itemCount: count });
    } catch {}
  },
  removeItem: async (itemId) => {
    try {
      const cart = await apiRemoveCartItem(itemId);
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      set({ cart, itemCount: count });
    } catch {}
  },
  clear: async (userId) => {
    try {
      await apiClearCart(userId);
      set({ cart: null, itemCount: 0 });
    } catch {}
  },
  calculateTotal: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return total + price * item.quantity;
    }, 0);
  },
}));