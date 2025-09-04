import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../shared/types/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiService = inject(ApiService);
  
  // Signals para manejo de estado
  private loading = signal(false);
  private error = signal<string | null>(null);
  
  // Getters públicos para los signals
  get isLoading() { return this.loading.asReadonly(); }
  get errorMessage() { return this.error.asReadonly(); }

  /**
   * Obtener todos los productos desde la API
   * Endpoint: GET /api/products/
   */
 getProducts(): Observable<any> {
  this.loading.set(true);
  this.error.set(null);
  
  return this.apiService.get<any>('communities/550e8400-e29b-41d4-a716-446655440001/listings/featured', {
    page: 1,
    limit: 15,
    strategy: 'featured_first'
  }).pipe(
    map((response: any) => {
      // Mapear la nueva estructura a la anterior
      return response.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.short_description,
        price: parseFloat(item.price),
        list_price: parseFloat(item.list_price),
        image_url: item.primary_image?.image_url ? 
    `https://cdn.jatic.com.ar${item.primary_image.image_url}` : 
    'assets/images/placeholder.jpg',
        category: item.category?.name,
        stock: item.stock_quantity,
        // Agregar otros campos que necesites
      }));
    }),
    tap(() => this.loading.set(false)),
    catchError((error) => {
      this.loading.set(false);
      this.error.set('Error al cargar productos desde el servidor');
      console.error('Error getting products:', error);
      throw error;
    })
  );
}

  /**
   * Obtener un producto por ID desde la API
   * Endpoint: GET /api/products/{id}/
   */
  getProduct(id: number): Observable<Product> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.apiService.get<Product>(`products/${id}/`)
      .pipe(
        tap(() => {
          this.loading.set(false);
        }),
        catchError((error) => {
          this.loading.set(false);
          this.error.set('Error al cargar el producto');
          console.error('Error getting product:', error);
          throw error; // Re-throw para que el componente pueda manejarlo
        })
      );
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(product: Omit<Product, 'id' | 'created_at'>): Observable<Product> {
    return this.apiService.post<Product>('api/products/', product);
  }

  /**
   * Actualizar un producto
   */
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.apiService.put<Product>(`api/products/${id}/`, product);
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(`api/products/${id}/`);
  }

  /**
   * Métodos helper para manejar estados
   */
  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  clearError(): void {
    this.error.set(null);
  }
}