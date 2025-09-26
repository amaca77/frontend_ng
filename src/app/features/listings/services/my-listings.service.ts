// src/app/features/listings/services/my-listings.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, map, of  } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface MyListing {
  id: string;
  title: string;
  description: string;
  price: number;
  list_price?: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  image_url?: string;
  created_at: string;
  updated_at: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MyListingsService {
  private apiService = inject(ApiService);
  
  // Signals para manejo de estado
  private loading = signal(false);
  private error = signal<string | null>(null);
  
  // Getters públicos para los signals
  get isLoading() { return this.loading.asReadonly(); }
  get errorMessage() { return this.error.asReadonly(); }

  /**
   * Obtener mis publicaciones (solo para advertisers)
   */
    getMyListings(page: number = 1, limit: number = 10): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.apiService.get<any>('my-listings', { page, limit }).pipe(
        map((response: any) => {
        // ✅ Backend ahora devuelve { listings: [...], pagination: {...} }
        let processedListings = [];
        
        if (response.listings) {
            // Respuesta paginada
            processedListings = response.listings.map(this.mapBackendToFrontend);
            return {
            listings: processedListings,
            pagination: response.pagination
            };
        } else if (Array.isArray(response)) {
            // Array directo (fallback)
            processedListings = response.map(this.mapBackendToFrontend);
            return {
            listings: processedListings,
            pagination: { total: processedListings.length }
            };
        }
        
        return { listings: [], pagination: { total: 0 } };
        }),
        tap(() => this.loading.set(false)),
        catchError((error) => {
        this.loading.set(false);
        this.error.set('Error al cargar tus publicaciones');
        console.error('Error getting my listings:', error);
        throw error;
        })
    );
    }

  /**
   * Obtener estadísticas de mis publicaciones
   */
    getMyListingsStats(): Observable<any> {
        return this.apiService.get<any>('listings/my-stats').pipe(
            catchError((error) => {
            console.error('Error getting listings stats:', error);
            return of({ total: 0, active: 0, inactive: 0, draft: 0 }); // ← Usar of()
            })
        );
    }

  /**
   * Actualizar publicación existente
   */
  updateListing(id: string, updates: Partial<MyListing>): Observable<MyListing> {
    return this.apiService.put<any>(`listings/${id}/`, updates).pipe(
      map(this.mapBackendToFrontend),
      tap(() => {
        console.log('✅ Publicación actualizada exitosamente');
      }),
      catchError((error) => {
        console.error('Error updating listing:', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar publicación
   */
  deleteListing(id: string): Observable<void> {
    return this.apiService.delete<void>(`my-listings/${id}/`).pipe(
      tap(() => {
        console.log('✅ Publicación eliminada exitosamente');
      }),
      catchError((error) => {
        console.error('Error deleting listing:', error);
        throw error;
      })
    );
  }

  /**
   * Cambiar estado de publicación (activar/desactivar)
   */
    toggleListingStatus(id: string, active: boolean): Observable<any> {
    return this.apiService.put<any>(`stock/${id}/status`, { 
            is_active: active  // Enviar como objeto, no boolean directo
        }).pipe(
                tap(() => {
                console.log(`✅ Publicación ${active ? 'activada' : 'desactivada'}`);
            }),
                catchError((error) => {
                console.error('Error toggling listing status:', error);
                throw error;
            })
        );
    }

  /**
   * Actualizar stock de publicación
   */
    updateStock(id: string, newStock: number): Observable<any> {
        return this.apiService.post<any>(`stock/${id}/adjust`, { 
            new_quantity: newStock,
            reason: "Actualización manual desde panel de advertiser"
        }).pipe(
            tap(() => {
            console.log('✅ Stock actualizado exitosamente');
            }),
            catchError((error) => {
            console.error('Error updating stock:', error);
            throw error;
            })
        );
    }

    /**
     * Agregar stock a publicación
     */
    addStock(id: string, quantity: number): Observable<any> {
        return this.apiService.post<any>(`stock/${id}/add`, { 
            quantity: quantity,
            reason: "Reposición de stock desde panel de advertiser"
        }).pipe(
            tap(() => {
            console.log('✅ Stock agregado exitosamente');
            }),
            catchError((error) => {
            console.error('Error adding stock:', error);
            throw error;
            })
        );
    }

    /**
     * Obtener mis métodos de entrega
     */
    getMyDeliveryMethods(): Observable<any[]> {
      return this.apiService.get<any[]>('delivery-methods/my').pipe(
        tap(() => {
          console.log('✅ Métodos de entrega cargados');
        }),
        catchError((error) => {
          console.error('Error getting delivery methods:', error);
          throw error;
        })
      );
    }

    /**
     * Crear nueva publicación
     */
    createListing(listingData: any): Observable<any> {
      return this.apiService.post<any>('my-listings/', listingData).pipe(
        tap(() => {
          console.log('✅ Publicación creada exitosamente');
        }),
        catchError((error) => {
          console.error('Error creating listing:', error);
          throw error;
        })
      );
    }


  /**
   * Mapear datos del backend al formato del frontend
   */
  private mapBackendToFrontend = (item: any): MyListing => {
    return {
      id: item.id,
      title: item.title,
      description: item.short_description || item.description,
      price: parseFloat(item.price),
      list_price: item.list_price ? parseFloat(item.list_price) : undefined,
      stock: item.stock_quantity || 0,
      status: item.is_active ? 'active' : 'inactive',
      image_url: item.primary_image?.image_url,
      created_at: item.created_at,
      updated_at: item.updated_at
      // category: item.category?.name
    };
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