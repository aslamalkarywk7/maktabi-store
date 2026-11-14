export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url?: string | null;
}

export type BookFormat = 'paperback' | 'hardcover' | 'ebook';

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  brand: string | null;
  images: string[];
  specs: {ar: Record<string, string>; en: Record<string, string>};
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  category: {id: number; slug: string; name_ar: string; name_en: string};
  // Book metadata
  ol_key: string | null;
  ol_ia: string | null;
  read_url: string | null;
  authors: string[];
  pub_year: number | null;
  format: BookFormat;
  isbn: string | null;
  pages: number | null;
  book_language: string;
  created_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  user_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone: string | null;
  created_at: string;
}

export interface CartItem {
  id: number;
  qty: number;
  line_total: number;
  product: Product;
}

export interface CartPayload {
  items: CartItem[];
  subtotal: number;
  count: number;
}

export type OrderStatus =
  | 'pending' | 'paid' | 'processing' | 'shipped'
  | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: number;
  name_ar: string;
  name_en: string;
  image: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: 'cod' | 'card' | 'paypal';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  paypal_order_id: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  ship_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_city: string;
  ship_country: string;
  placed_at: string;
  items: OrderItem[];
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_subtotal: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: number;
}

/** Open Library search hit used by the admin import tool. */
export interface OlImportHit {
  ol_key: string;
  title: string;
  authors: string[];
  coverId: number | null;
  coverUrl: string | null;
  ia: string | null;
  year: number | null;
  publisher: string | null;
  isbn: string | null;
  pages: number | null;
  language: string;
}
