import type { ProductListResponse, Product, Category, Cart, CartItem, Order, OrderListResponse, Review, WishlistItem, Payment, User, AdminStats } from '@/types';

const API_BASE = '/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Products
export async function fetchProducts(params?: { q?: string; category_id?: string; min_price?: number; max_price?: number; is_featured?: boolean; page?: number; size?: number }): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category_id) searchParams.set('category_id', params.category_id);
  if (params?.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
  if (params?.max_price !== undefined) searchParams.set('max_price', String(params.max_price));
  if (params?.is_featured !== undefined) searchParams.set('is_featured', String(params.is_featured));
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.size) searchParams.set('size', String(params.size));
  const qs = searchParams.toString();
  return fetchAPI<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProduct(id: string): Promise<Product> {
  return fetchAPI<Product>(`/products/${id}`);
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/categories');
}

// Auth
export async function registerUser(data: { full_name: string; email: string; password: string; phone?: string; address?: string }) {
  return fetchAPI<{ id: string; full_name: string; email: string; access_token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function loginUser(data: { email: string; password: string }) {
  return fetchAPI<{ access_token: string; user: { id: string; full_name: string; email: string; role: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

// Cart
export async function fetchCart(userId: string): Promise<Cart> {
  return fetchAPI<Cart>(`/cart?userId=${userId}`);
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<Cart> {
  return fetchAPI<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ userId, productId, quantity }) });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return fetchAPI<Cart>(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  return fetchAPI<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearCart(userId: string): Promise<void> {
  await fetchAPI<void>(`/cart?userId=${userId}`, { method: 'DELETE' });
}

// Orders
export async function createOrder(data: { userId: string; shipping_address: string; contact_phone?: string; note?: string }): Promise<Order> {
  return fetchAPI<Order>('/orders', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchOrder(id: string): Promise<Order> {
  return fetchAPI<Order>(`/orders/${id}`);
}

export async function fetchOrders(userId: string, page?: number, size?: number): Promise<OrderListResponse> {
  const params = new URLSearchParams({ userId });
  if (page) params.set('page', String(page));
  if (size) params.set('size', String(size));
  return fetchAPI<OrderListResponse>(`/orders/list?${params}`);
}

// Reviews
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  return fetchAPI<Review[]>(`/reviews/product/${productId}`);
}

export async function createReview(data: { userId: string; productId: string; rating: number; comment?: string }): Promise<Review> {
  return fetchAPI<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });
}

// Wishlist
export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  return fetchAPI<WishlistItem[]>(`/wishlist?userId=${userId}`);
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  return fetchAPI<WishlistItem>('/wishlist', { method: 'POST', body: JSON.stringify({ userId, productId }) });
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await fetchAPI<void>(`/wishlist/${productId}?userId=${userId}`, { method: 'DELETE' });
}

// Payments
export async function createPayment(orderId: string, method: string): Promise<Payment> {
  return fetchAPI<Payment>('/payments', { method: 'POST', body: JSON.stringify({ orderId, method }) });
}

// ==================== ADMIN API ====================

// Admin Stats
export async function fetchAdminStats(): Promise<AdminStats> {
  return fetchAPI<AdminStats>('/admin/stats');
}

// Admin Products
export async function fetchAdminProducts(params?: { page?: number; size?: number; q?: string; category_id?: string }): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.size) searchParams.set('size', String(params.size));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category_id) searchParams.set('category_id', params.category_id);
  const qs = searchParams.toString();
  return fetchAPI<ProductListResponse>(`/admin/products${qs ? `?${qs}` : ''}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchAPI<void>(`/admin/products/${id}`, { method: 'DELETE' });
}

// Admin Categories
export async function fetchAdminCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/admin/categories');
}

export async function createCategory(data: { name: string; slug: string; description?: string; image?: string }): Promise<Category> {
  return fetchAPI<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return fetchAPI<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchAPI<void>(`/admin/categories/${id}`, { method: 'DELETE' });
}

// Admin Orders
export async function fetchAdminOrders(params?: { page?: number; size?: number; status?: string }): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.size) searchParams.set('size', String(params.size));
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return fetchAPI<OrderListResponse>(`/admin/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return fetchAPI<Order>(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

// Admin Users
export async function fetchAdminUsers(params?: { page?: number; size?: number }): Promise<{ total: number; items: User[] }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.size) searchParams.set('size', String(params.size));
  const qs = searchParams.toString();
  return fetchAPI<{ total: number; items: User[] }>(`/admin/users${qs ? `?${qs}` : ''}`);
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<User> {
  return fetchAPI<User>(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) });
}

export async function deleteUser(userId: string): Promise<void> {
  await fetchAPI<void>(`/admin/users/${userId}`, { method: 'DELETE' });
}