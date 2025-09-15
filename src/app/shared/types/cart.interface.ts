import { DeliveryMethod } from "./product.interface";

export interface CheckoutFormData {
  delivery_address: string;
  delivery_apartment?: string;
  delivery_postal_code?: string;
  delivery_city?: string;
  delivery_province?: string;
  delivery_notes?: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string;
}

// src/app/shared/types/cart.interface.ts
export interface CartItem {
  listing_id: string;
  quantity: number;
  // Datos del producto para mostrar sin hacer peticiones
  productData: {
    title: string;
    price: number;
    image_url: string;
    delivery_methods?: any[];
  };
}

export interface Cart {
  seller_id: string;
  items: CartItem[];
  created_at: Date;
  expires_at: Date;
}

export interface CheckoutValidation {
  valid: boolean;
  errors: ValidationError[];
  updated_items: CartItem[];
}

export interface ValidationError {
  listing_id: string;
  error_type: string;
  message: string;
  current_value?: string;
}

export interface CheckoutCalculation {
  subtotal: number;
  shipping: number;
  discounts: number;
  taxes: number;
  total: number;
  errors: string[];
}