export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  sku: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category?: Category | null;
  reviews?: Review[];
}

export interface ProductListResponse {
  total: number;
  page: number;
  size: number;
  items: Product[];
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profileImage: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment | null;
}

export interface OrderListResponse {
  total: number;
  page: number;
  size: number;
  items: Order[];
}

export interface Payment {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export type ViewType = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'orders' | 'wishlist' | 'profile' | 'order-detail' | 'admin-dashboard' | 'admin-products' | 'admin-categories' | 'admin-orders' | 'admin-users';