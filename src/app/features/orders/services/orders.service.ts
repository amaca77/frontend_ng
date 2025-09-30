import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';



@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiService = inject(ApiService);

  getUserOrders(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('checkout/orders', { page, limit });
  }

  /**
 * Obtener detalle completo de una orden
 */
  getOrderDetail(orderId: string): Observable<any> {
    return this.apiService.get<any>(`checkout/orders/${orderId}`).pipe(
      tap(() => {
        console.log('✅ Order detail loaded');
      }),
      catchError((error) => {
        console.error('Error getting order detail:', error);
        throw error;
      })
    );
  }
}