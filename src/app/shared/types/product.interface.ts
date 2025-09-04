export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  status: string;
  created_at: string;
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