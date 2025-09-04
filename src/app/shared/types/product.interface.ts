export interface Product {
  id: string; // cambiar de number a string
  title: string; // agregar
  name?: string; // mantener para compatibilidad
  description: string;
  long_description?: string; // agregar
  price: number; // cambiar de string a number
  list_price?: number; // agregar
  image: string; // cambiar de image_url
  image_url?: string; // mantener para compatibilidad
  stock?: number; // agregar
  max_quantity?: number; // agregar
  category?: string; // agregar
  advertiser?: string; // agregar
  status?: string;
  created_at: string;
  updated_at?: string; // agregar
  images?: ProductImage[]; // agregar
  delivery_methods?: DeliveryMethod[]; // agregar
}

// Agregar nuevas interfaces
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  is_primary: boolean;
}

export interface DeliveryMethod {
  id: string;
  type: string;
  name: string;
  description: string;
  cost: string;
  address?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}