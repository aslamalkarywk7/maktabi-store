import type {Request} from 'express';

export interface AuthUser {
  id: number;
  role: 'customer' | 'admin';
}

export interface AuthedRequest extends Request {
  user: AuthUser;
}

export interface CategoryRow {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
}

export interface ProductRow {
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
  category_id: number;
  brand: string | null;
  images: string; // JSON
  specs: string; // JSON
  is_active: number;
  is_featured: number;
  rating_avg: number;
  rating_count: number;
  ol_key: string | null;
  ol_cover_id: number | null;
  ol_ia: string | null;
  authors: string; // JSON array
  pub_year: number | null;
  format: 'paperback' | 'hardcover' | 'ebook';
  isbn: string | null;
  pages: number | null;
  book_language: string;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: number;
  order_number: string;
  user_id: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
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
  updated_at: string;
}
