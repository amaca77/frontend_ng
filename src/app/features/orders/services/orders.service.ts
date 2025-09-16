import { Injectable, inject } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiService = inject(ApiService);

  getUserOrders(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('checkout/orders', { page, limit });
  }
}